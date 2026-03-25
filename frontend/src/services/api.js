import axios from 'axios'

export const api = axios.create({
baseURL: '/api',
})

// Add auth interceptor later
api.interceptors.request.use((config) => {
  return config
})

