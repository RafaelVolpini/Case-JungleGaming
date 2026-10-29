import { useEffect } from 'react'

import { reportToasterMounted } from '@/lib/toaster-gate'

import { Toaster } from './sonner'

export default function LazyToaster() {
  useEffect(() => reportToasterMounted(), [])

  return <Toaster position="bottom-right" />
}
