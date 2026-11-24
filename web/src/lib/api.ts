import axios from 'axios'

export interface Service {
  id: number
  name: string
  description: string
  category: string
  price: number
  duration: number
  active: boolean
}

export interface Booking {
  id: number
  reference: string
  service: Service
  customerName: string
  customerEmail: string
  date: string
  time: string
  status: string
}

export interface BookingRequest {
  serviceId: number
  customerName: string
  customerEmail: string
  date: string
  time: string
}

export interface Stats {
  total: number
  confirmed: number
  cancelled: number
  completed: number
  services: number
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000
})

export const bookingApi = {
  services: async (): Promise<Service[]> =>
    (await api.get('/services')).data,

  availability: async (serviceId: number, date: string): Promise<string[]> =>
    (await api.get('/availability', { params: { serviceId, date } })).data,

  create: async (body: BookingRequest): Promise<Booking> =>
    (await api.post('/bookings', body)).data,

  find: async (reference: string): Promise<Booking> =>
    (await api.get(`/bookings/${encodeURIComponent(reference)}`)).data,

  cancel: async (reference: string): Promise<Booking> =>
    (await api.delete(`/bookings/${encodeURIComponent(reference)}`)).data
}

export const adminApi = (password: string) => {
  const auth = { username: 'admin', password }
  return {
    login: async () =>
      (await api.get('/admin/me', { auth })).data,
    stats: async (): Promise<Stats> =>
      (await api.get('/admin/stats', { auth })).data,
    bookings: async (): Promise<Booking[]> =>
      (await api.get('/admin/bookings', { auth })).data,
    update: async (reference: string, action: string) =>
      (await api.patch(`/admin/bookings/${reference}/${action}`, null, { auth })).data
  }
}

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message
      || (error.response?.status === 401
        ? 'Invalid administrator password.'
        : 'Unable to complete your request. Please try again.')
  }
  return 'Something went wrong.'
}
