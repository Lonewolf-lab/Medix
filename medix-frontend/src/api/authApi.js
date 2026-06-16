import api from './axiosInstance'

export const authApi = {
  // { name, email, password, dob?, bloodGroup? } -> { token, userId, name, email }
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data),

  // { email, password } -> { token, userId, name, email }
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data),

  // clears cookie + blacklists token -> { message }
  logout: () => api.post('/auth/logout').then((r) => r.data),
}
