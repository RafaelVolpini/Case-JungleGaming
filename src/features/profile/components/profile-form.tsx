import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { changePasswordSchema, type ChangePasswordInput, type User } from '@/contracts/session'
import type { Wallet } from '@/contracts/wallet'
import { applyApiErrors } from '@/features/auth/lib/apply-api-errors'
import { useSaveWallet } from '@/features/wallets/hooks/use-wallet-mutations'
import { walletToInput } from '@/features/wallets/lib/wallet-input'
import { ApiRequestError, errorMessage } from '@/lib/http/errors'

import { useProfileMutations } from '../hooks/use-profile-mutations'
import { profileDefaults, profileFormSchema, type ProfileFormValues } from '../lib/profile-form'
import { PasswordFields } from './password-fields'
import { ProfileFields } from './profile-fields'

const EMPTY_PASSWORDS: ChangePasswordInput = {
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
}

export function ProfileForm({ user, primary }: { user: User; primary: Wallet | undefined }) {
  const { updateProfile, changePassword } = useProfileMutations()
  const saveWallet = useSaveWallet()
  const [formError, setFormError] = useState<string | null>(null)

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema(Boolean(primary))),
    defaultValues: profileDefaults(user, primary?.label ?? ''),
  })
  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: EMPTY_PASSWORDS,
  })

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setFormError(null)
    const wantsPassword = Object.values(passwordForm.getValues()).some(Boolean)
    const valid = await Promise.all([
      profileForm.trigger(),
      wantsPassword ? passwordForm.trigger() : true,
    ])
    if (valid.includes(false)) return

    const { walletLabel, ...profile } = profileForm.getValues()
    try {
      await updateProfile.mutateAsync(profile)
    } catch (error) {
      setFormError(applyApiErrors(error, profileForm.setError))
      return
    }
    if (primary && walletLabel !== primary.label) {
      try {
        await saveWallet.mutateAsync({
          id: primary.id,
          input: walletToInput(primary, { label: walletLabel }),
        })
      } catch (error) {
        const fieldMessage = error instanceof ApiRequestError ? error.fields['label'] : undefined
        profileForm.setError('walletLabel', {
          type: 'server',
          message: fieldMessage ?? errorMessage(error),
        })
        return
      }
    }
    if (wantsPassword) {
      try {
        await changePassword.mutateAsync(passwordForm.getValues())
        passwordForm.reset(EMPTY_PASSWORDS)
      } catch (error) {
        setFormError(applyApiErrors(error, passwordForm.setError))
        return
      }
    }
    profileForm.reset(profileForm.getValues())
    toast.success('Perfil atualizado.')
  }

  const saving = updateProfile.isPending || changePassword.isPending || saveWallet.isPending

  return (
    <form noValidate onSubmit={(event) => void submit(event)}>
      <h1 className="text-cream -mt-1 text-base leading-6 font-bold">Perfil do colecionador</h1>
      <div className="mt-[29px]">
        <ProfileFields form={profileForm} hasWallet={Boolean(primary)} />
      </div>
      <PasswordFields form={passwordForm} />
      {formError && (
        <p role="alert" className="text-destructive mt-4 text-sm">
          {formError}
        </p>
      )}
      <Button type="submit" disabled={saving} className="mt-8 h-10 w-[131px] rounded text-sm">
        Salvar
      </Button>
    </form>
  )
}
