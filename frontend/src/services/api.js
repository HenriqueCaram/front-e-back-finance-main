import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:5000',
})

// Add auth interceptor later
api.interceptors.request.use((config) => {
  return config
})

