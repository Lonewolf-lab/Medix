import api from './axiosInstance'

export const symptomApi = {
  // { symptoms: string[], additionalNotes? }
  //   -> { severity, possibleCauses, recommendation, disclaimer, timestamp }
  analyze: (payload) => api.post('/symptoms/analyze', payload).then((r) => r.data),

  // -> SymptomLog[]
  history: () => api.get('/symptoms/history').then((r) => r.data),
}
