import {
  authResponseSchema,
  sessionSchema,
  type AuthResponse,
  type LoginInput,
  type RegisterInput,
  type Session,
} from '@/contracts/session'
import { http } from '@/lib/http/client'

export async function fetchSession(): Promise<Session> {
  const { data } = await http.get('/auth/session')
  return sessionSchema.parse(data)
}

export async function loginRequest(input: LoginInput): Promise<AuthResponse> {
  const { data } = await http.post('/auth/login', input)
  return authResponseSchema.parse(data)
}

export async function registerRequest(input: RegisterInput): Promise<AuthResponse> {
  const { data } = await http.post('/auth/register', input)
  return authResponseSchema.parse(data)
}

export async function logoutRequest(): Promise<void> {
  await http.post('/auth/logout')
}
