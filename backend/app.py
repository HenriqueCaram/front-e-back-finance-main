from flask import Flask, request, jsonify
import os, json, hashlib
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "https://noncoplanar-unethnologic-german.ngrok-free.dev"])

BASE_FOLDER = 'data'
os.makedirs(BASE_FOLDER, exist_ok=True)

users = {}

# -----------------------
# USERS
# -----------------------

def hash_gen(password):
    return hashlib.sha256(password.encode()).hexdigest()

def load_users():
    global users
    try:
        with open('users.json', 'r') as f:
            users.update(json.load(f))
    except:
        pass

def save_users():
    with open('users.json', 'w') as f:
        json.dump(users, f)


# -----------------------
# SAVINGS
# -----------------------

def savings_path(user):
    return os.path.join(BASE_FOLDER, user, 'savings.json')

def load_savings(user):
    try:
        with open(savings_path(user), 'r') as f:
            return json.load(f)
    except:
        return {"goal": None, "total_saved": 0}

def save_savings(user, data):
    with open(savings_path(user), 'w') as f:
        json.dump(data, f)


# -----------------------
# FINANCE DATA
# -----------------------

def finance_path(user):
    return os.path.join(BASE_FOLDER, user, 'finance.json')

def load_finance(user):
    try:
        with open(finance_path(user), 'r') as f:
            return json.load(f)
    except:
        return []

def save_finance(user, data):
    with open(finance_path(user), 'w') as f:
        json.dump(data, f)


# -----------------------
# AUTH
# -----------------------

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    user = data["user"].lower()
    password = data["password"]

    # validações iguais ao seu código
    if len(password) < 8:
        return jsonify({"error": "Password too short"}), 400

    if ' ' in password:
        return jsonify({"error": "Password cannot contain spaces"}), 400

    if not any(char.isdigit() for char in password):
        return jsonify({"error": "Password must contain number"}), 400

    if not any(char in '!@#$%^&*()_+-=[]{}|;:,.<>?/' for char in password):
        return jsonify({"error": "Password must contain special char"}), 400

    if user in users:
        return jsonify({"error": "User exists"}), 400

    users[user] = hash_gen(password)
    save_users()

    os.makedirs(os.path.join(BASE_FOLDER, user), exist_ok=True)

    return jsonify({"message": "User created"})


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    user = data["user"].lower()
    password = data["password"]

    if user in users and users[user] == hash_gen(password):
        return jsonify({"message": "Login ok", "user": user})

    return jsonify({"error": "Invalid login"}), 401


# -----------------------
# FINANCE REGISTER
# -----------------------

@app.route("/finance", methods=["POST"])
def add_finance():
    data = request.json

    user = data["user"]
    wage = data.get("wage", 0)
    expenses_list = data.get("expenses", [])
    limiter = data.get("limiter")

    total_expenses = sum(item["amount"] for item in expenses_list)
    leftover = wage - total_expenses

    # savings
    savings = load_savings(user)
    savings["total_saved"] += leftover

    if "goal" in data:
        savings["goal"] = data["goal"]

    save_savings(user, savings)

    # record
    record = {
        "date": datetime.now().isoformat(),
        "wage": wage,
        "expenses": expenses_list,
        "total_expenses": total_expenses,
        "leftover": leftover,
        "limiter": limiter,
        "goal": savings["goal"],
        "total_saved": savings["total_saved"]
    }

    records = load_finance(user)
    records.append(record)
    save_finance(user, records)

    return jsonify(record)


# -----------------------
# GET DATA
# -----------------------

@app.route("/finance/<user>", methods=["GET"])
def get_finance(user):
    return jsonify(load_finance(user))


@app.route("/savings/<user>", methods=["GET"])
def get_savings(user):
    data = load_savings(user)

    goal = data["goal"]
    total = data["total_saved"]

    remaining = None
    if goal is not None:
        remaining = max(goal - total, 0)

    return jsonify({
        "goal": goal,
        "total_saved": total,
        "remaining": remaining
    })


@app.route("/rankings", methods=["GET"])
def get_rankings():
    """Get all users ranked by total_saved (descending)"""
    rankings = []
    try:
        for user_dir in os.listdir(BASE_FOLDER):
            user_path = os.path.join(BASE_FOLDER, user_dir)
            if os.path.isdir(user_path):
                savings_file = os.path.join(user_path, 'savings.json')
                if os.path.exists(savings_file):
                    with open(savings_file, 'r') as f:
                        data = json.load(f)
                        rankings.append({
                            "user": user_dir,
                            "total_saved": data.get("total_saved", 0),
                            "goal": data.get("goal", 0)
                        })
    except Exception as e:
        print(f"Rankings error: {e}")
    
    # Sort by total_saved desc, then alphabetically
    rankings.sort(key=lambda x: (-x['total_saved'], x['user']))
    return jsonify(rankings)



# -----------------------
# DELETE / EDIT
# -----------------------

@app.route("/finance/<user>/<int:index>", methods=["DELETE"])
def delete_record(user, index):
    data = load_finance(user)

    if 0 <= index < len(data):
        removed = data.pop(index)
        save_finance(user, data)
        return jsonify({"deleted": removed})

    return jsonify({"error": "Invalid index"}), 400


@app.route("/finance/<user>/<int:index>", methods=["PUT"])
def edit_record(user, index):
    records = load_finance(user)
    new_data = request.json

    if not (0 <= index < len(records)):
        return jsonify({"error": "Invalid index"}), 400

    old_record = records[index]
    old_leftover = old_record.get("leftover", 0)

    # New values from request
    new_wage = new_data.get("wage", old_record.get("wage", 0))
    new_expenses = new_data.get("expenses", old_record.get("expenses", []))
    new_limiter = new_data.get("limiter", old_record.get("limiter", ""))
    new_goal = new_data.get("goal", old_record.get("goal", None))

    # Recalculate
    total_expenses = sum(float(exp.get("amount", 0)) for exp in new_expenses)
    new_leftover = new_wage - total_expenses

    # Update savings with delta
    savings = load_savings(user)
    delta = new_leftover - old_leftover
    savings["total_saved"] += delta
    save_savings(user, savings)

    # Update record completely
    records[index] = {
        "date": old_record["date"],
        "wage": new_wage,
        "expenses": new_expenses,
        "total_expenses": total_expenses,
        "leftover": new_leftover,
        "limiter": new_limiter,
        "goal": new_goal,
        "total_saved": savings["total_saved"]
    }

    save_finance(user, records)
    return jsonify(records[index])

@app.route("/user/<user>", methods=["GET"])
def get_user_profile(user):
    profile = load_profile(user) or {}
    savings = load_savings(user)
    return jsonify({
        "username": user,
        "password": "***hidden***",
        "email": profile.get("email", "user@example.com"),
        "phone": profile.get("phone", "+55 (11) 99999-9999"),
        "total_saved": savings.get("total_saved", 0),
        "social_links": profile.get("social_links", {})
    })

@app.route("/user/<user>", methods=["PUT"])
def update_user_profile(user):
    if user not in users:
        return jsonify({"error": "User not found"}), 404
    
    data = request.json
    profile_data = data.get("profile", {})
    
    # Load existing profile or create new
    current_profile = load_profile(user) or {}
    
    # Update fields
    current_profile.update({
        "email": profile_data.get("email", current_profile.get("email")),
        "phone": profile_data.get("phone", current_profile.get("phone")),
        "social_links": profile_data.get("social_links", current_profile.get("social_links", {}))
    })
    
    # Save
    save_profile(user, current_profile)
    
    return jsonify({"message": "Profile updated", "profile": current_profile})

def load_profile(user):
    try:
        with open(f'profiles.json', 'r') as f:
            profiles = json.load(f)
            return profiles.get(user)
    except:
        return None

def save_profile(user, data):
    try:
        with open('profiles.json', 'r') as f:
            profiles = json.load(f)
    except:
        profiles = {}
    
    profiles[user] = data
    with open('profiles.json', 'w') as f:
        json.dump(profiles, f, indent=2)



# -----------------------


@app.route("/users", methods=["GET"])
def get_users():
    return jsonify(list(users.keys()))

@app.route("/users/search", methods=["GET"])
def search_users():
    q = request.args.get('q', '').lower()
    results = []
    for username in users:
        if q in username.lower():
            savings = load_savings(username)
            profile = load_profile(username)
            results.append({
                "username": username,
                "savings": savings.get("total_saved", 0),
                "email": profile.get("email", "")[:20] + "..." if profile.get("email") else "No email"
            })
    return jsonify(results)

def notifications_path():
    return 'notifications.json'

def load_notifications():
    try:
        with open(notifications_path(), 'r') as f:
            return json.load(f)
    except:
        return {}

def save_notifications(data):
    with open(notifications_path(), 'w') as f:
        json.dump(data, f, indent=2)

@app.route("/challenge", methods=["POST"])

def send_challenge():
    data = request.json
    from_user = data["from"]
    to_user = data["to"]
    
    notifications = load_notifications()
    if to_user not in notifications:
        notifications[to_user] = []
    
    notif_id = len(notifications[to_user]) + 1
    notification = {
        "id": notif_id,
        "type": "challenge",
        "from": from_user,
        "message": f"{from_user} invited you to a savings challenge!",
        "date": datetime.now().isoformat(),
        "status": "pending"
    }
    
    notifications[to_user].append(notification)
    save_notifications(notifications)
    
    return jsonify({"message": "Challenge sent", "notification": notification})

@app.route("/notifications/<user>", methods=["GET"])
def get_notifications(user):
    """Get notifications for user (accepted=false by default)"""
    notifications = load_notifications()
    user_notifs = notifications.get(user, [])
    
    accepted = request.args.get('accepted', 'false').lower() == 'true'
    
    if not accepted:
        # Filter pending only
        user_notifs = [n for n in user_notifs if n.get('status') == 'pending']
    
    return jsonify(user_notifs)


@app.route("/notification/<user>/<int:notif_id>", methods=["PUT"])
def update_notification(user, notif_id):
    data = request.json
    status = data["status"]
    
    notifications = load_notifications()
    user_notifs = notifications.get(user, [])
    
    for notif in user_notifs:
        if notif["id"] == notif_id:
            notif["status"] = status
            
            # Create bidirectional challenge when accepted
            if status == 'accepted':
                opponent_notif = {
                    "id": len(notifications.get(notif["from"], [])) + 1,
                    "type": "challenge_accepted",
                    "from": user,
                    "message": f"{user} accepted your challenge!",
                    "date": datetime.now().isoformat(),
                    "status": "accepted",
                    "opponent": user
                }
                if notif["from"] not in notifications:
                    notifications[notif["from"]] = []
                notifications[notif["from"]].append(opponent_notif)
            
            save_notifications(notifications)
            return jsonify({"message": "Updated"})
    
    return jsonify({"error": "Not found"}), 404

@app.route("/challenges/<user>", methods=["GET"])
def get_challenges(user):
    """Get active challenges for user"""
    notifications = load_notifications()
    user_notifs = notifications.get(user, [])
    
    challenges = []
    for notif in user_notifs:
        if notif["status"] == "accepted" and notif["type"] == "challenge":
            opponent_savings = load_savings(notif["from"])["total_saved"]
            user_savings = load_savings(user)["total_saved"]
            
            challenges.append({
                "id": notif["id"],
                "opponent": notif["from"],
                "date": notif["date"],
                "your_savings": user_savings,
                "opponent_savings": opponent_savings,
                "leading": user_savings > opponent_savings,
                "difference": abs(user_savings - opponent_savings),
                "chart_data": {
                  "labels": [user, notif["from"]],
                  "datasets": [{
                    "label": 'Savings',
                    "data": [user_savings, opponent_savings],
                    "backgroundColor": ['rgba(59, 130, 246, 0.8)', 'rgba(239, 68, 68, 0.8)']
                  }]
                }
            })
    
    return jsonify(challenges)



if __name__ == "__main__":
    load_users()
    app.run(debug=True, port=5000)


    