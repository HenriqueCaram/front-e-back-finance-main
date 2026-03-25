import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { api } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard({ user, setUser }) {
  const [financeRecords, setFinanceRecords] = useState([]);
  const [savings, setSavings] = useState({});
  const [goal, setGoal] = useState('');
  const [wage, setWage] = useState('');
  const [expenses, setExpenses] = useState([{ name: '', amount: 0 }]);
  const [limiter, setLimiter] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchData();
    fetchNotifications();
  }, [user]);

  const fetchData = async () => {
    try {
      const [financeRes, savingsRes] = await Promise.all([
        api.get(`/finance/${user}`),
        api.get(`/savings/${user}`),
      ]);
      setFinanceRecords(financeRes.data);
      setSavings(savingsRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get(`/notifications/${user}`);
      setNotifications(res.data);
    } catch (err) {
      console.error('Notifications error', err);
    }
  };


  const addExpense = () => {
    setExpenses([...expenses, { name: '', amount: 0 }]);
  };

  const updateExpense = (index, field, value) => {
    const newExpenses = [...expenses];
    newExpenses[index][field] = value;
    setExpenses(newExpenses);
  };

  const removeExpense = (index) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const editRecord = (index) => {
    const record = financeRecords[index];
    setEditingIndex(index);
    setWage(record.wage.toString());
    setExpenses(record.expenses || [{ name: '', amount: 0 }]);
    setLimiter(record.limiter || '');
    setGoal(record.goal ? record.goal.toString() : '');
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setWage('');
    setExpenses([{ name: '', amount: 0 }]);
    setLimiter('');
    setGoal('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validExpenses = expenses.filter(exp => exp.name.trim());
    const wageNum = parseFloat(wage) || 0;
    const goalNum = parseFloat(goal) || savings.goal;

    try {
      if (editingIndex !== null) {
        const totalExpenses = validExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        const leftover = wageNum - totalExpenses;
        
        await api.put(`/finance/${user}/${editingIndex}`, {
          wage: wageNum,
          expenses: validExpenses,
          total_expenses: totalExpenses,
          leftover,
          limiter,
          goal: goalNum
        });
        console.log('Updated record');
      } else {
        const response = await api.post('/finance', {
          user,
          wage: wageNum,
          expenses: validExpenses,
          limiter,
          goal: goalNum
        });
        console.log('Saved:', response.data);
      }
      setEditingIndex(null);
      setWage('');
      setExpenses([{ name: '', amount: 0 }]);
      setLimiter('');
      setGoal('');
      fetchData();
    } catch (err) {
      console.error('Save failed', err);
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const deleteRecord = async (index) => {
    try {
      await api.delete(`/finance/${user}/${index}`);
      fetchData();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 shadow-xl rounded-lg p-8 mb-8 border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Welcome, {user}!</h1>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold">Total Saved</h3>
              <p className="text-3xl font-bold">R$ {savings.total_saved?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold">Savings Goal</h3>
              <p className="text-3xl font-bold">R$ {savings.goal || '0.00'}</p>
            </div>
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold">Remaining</h3>
              <p className="text-3xl font-bold">R$ {savings.remaining?.toFixed(2) || '0.00'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 p-8 rounded-xl shadow-xl shadow-gray-600/50 mb-8">
            <h2 className="text-2xl font-bold mb-6">Add Financial Record</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Salary</label>
                <input
                  type="number"
                  step="0.01"
                  value={wage}
                  onChange={(e) => setWage(e.target.value)}
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Savings Goal</label>
                <input
                  type="number"
                  step="0.01"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                  placeholder="10000"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-4">Expenses</label>
              {expenses.map((expense, index) => (
                <div key={index} className="flex gap-4 items-end mb-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <input
                    type="text"
                    placeholder="Rent"
                    value={expense.name}
                    onChange={(e) => updateExpense(index, 'name', e.target.value)}
                    className="flex-1 p-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1500"
                    value={expense.amount}
                    onChange={(e) => updateExpense(index, 'amount', parseFloat(e.target.value) || 0)}
                    className="w-32 p-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => removeExpense(index)}
                    className="text-red-400 hover:text-red-300 font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addExpense}
                className="text-blue-400 hover:text-blue-300 font-medium text-sm"
              >
                + Add Expense
              </button>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
              <input
                type="text"
                value={limiter}
                onChange={(e) => setLimiter(e.target.value)}
                className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400"
                placeholder="Optional notes..."
              />
            </div>

            <button
              type="submit"
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition"
            >
              {editingIndex !== null ? 'Update Record' : 'Save Record'}
            </button>
            {editingIndex !== null && (
              <button
                type="button"
                onClick={cancelEdit}
                className="w-full mt-2 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            )}
          </form>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">History Summary - Expenses Bar Chart</h2>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8">
              {financeRecords.length > 0 ? (
                <div className="h-96">
                  <Bar
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: true,
                          text: 'Salary vs Expenses vs Leftover (R$)',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return 'R$ ' + value.toLocaleString('pt-BR');
                            },
                          },
                        },
                      },
                      elements: {
                        bar: {
                          borderRadius: 8,
                          borderSkipped: false,
                        },
                      },
                    }}
                    data={{
                      labels: financeRecords.map((record) => formatDate(record.date)),
                      datasets: [
                        {
                          label: 'Salary',
                          data: financeRecords.map((record) => record.wage || 0),
                          backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        },
                        {
                          label: 'Expenses',
                          data: financeRecords.map((record) =>
                            record.total_expenses ||
                            (record.expenses || []).reduce((sum, exp) => sum + (exp.amount || 0), 0)
                          ),
                          backgroundColor: 'rgba(239, 68, 68, 0.8)',
                        },
                        {
                          label: 'Leftover',
                          data: financeRecords.map((record) => record.leftover || 0),
                          backgroundColor: 'rgba(34, 197, 94, 0.8)',
                        },
                      ],
                    }}
                  />
                </div>
              ) : (
                <p className="text-gray-400 text-center py-12 text-lg">
                  No financial records yet. Add your first record above!
                </p>
              )}
            </div>

            <h3 className="text-xl font-bold mb-4">Detailed Records</h3>
            {financeRecords.map((record, index) => (
              <div key={index} className="bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-blue-400 border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{formatDate(record.date)}</h3>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-900 text-green-100 rounded-full text-sm font-medium">
                      Leftover: R$ {record.leftover?.toFixed(2) || '0.00'}
                    </span>
                    <button
                      onClick={() => editRecord(index)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        const record = financeRecords[index];
                        setWage(record.wage.toString());
                        setExpenses(record.expenses || [{ name: '', amount: 0 }]);
                        setLimiter(record.limiter || '');
                        setGoal(record.goal ? record.goal.toString() : '');
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded font-medium text-sm"
                    >
                      Add Copy
                    </button>
                    <button
                      onClick={() => deleteRecord(index)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
                  <div>
                    <p>
                      <span className="font-medium">Salary:</span> R$ {record.wage?.toFixed(2) || '0.00'}
                    </p>
                    <p>
                      <span className="font-medium">Total Expenses:</span> R$ {record.total_expenses?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    {record.limiter && (
                      <p>
                        <span className="font-medium">Notes:</span> {record.limiter}
                      </p>
                    )}
                  </div>
                </div>
                {record.expenses && record.expenses.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <h4 className="font-semibold mb-2">Expenses:</h4>
                    <ul className="space-y-1">
                      {record.expenses.map((exp, i) => (
                        <li key={i} className="text-sm text-gray-400">
                          • {exp.name}: R$ {exp.amount?.toFixed(2) || '0.00'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
          <footer className="text-center mt-12 pt-8 border-t border-gray-700 text-gray-400 text-sm">
            <div>Created by Henrique Caram</div>
            <div className="mt-1">Enhanced by BLACKBOXAI</div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

