import {
  userSchema,
  type ChangePasswordInput,
  type UpdateProfileInput,
  type User,
} from '@/contracts/session'
import { http } from '@/lib/http/client'

export async function updateProfileRequest(input: UpdateProfileInput): Promise<User> {
  const { data } = await http.patch('/profile', input)
  return userSchema.parse(data)
}

export async function changePasswordRequest(input: ChangePasswordInput): Promise<void> {
  await http.post('/profile/password', input)
}
