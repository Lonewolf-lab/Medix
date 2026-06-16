import api from './axiosInstance'

export const userApi = {
  // -> { id, name, email, dob, bloodGroup }
  getProfile: () => api.get('/user/profile').then((r) => r.data),
}
