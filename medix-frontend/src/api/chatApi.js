import api from './axiosInstance'

export const chatApi = {
  // { message } -> { id, role, content, timestamp }
  send: (message) => api.post('/chat/message', { message }).then((r) => r.data),

  // -> ChatResponse[] (user + assistant messages, chronological)
  history: () => api.get('/chat/history').then((r) => r.data),

  clear: () => api.delete('/chat/history').then((r) => r.data),
}
