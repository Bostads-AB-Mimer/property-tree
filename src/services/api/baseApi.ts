import createClient from 'openapi-fetch'
import type { paths } from './generated/api-types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050'

export const { GET, POST, PUT, DELETE, PATCH } = createClient<paths>({
  baseUrl: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
