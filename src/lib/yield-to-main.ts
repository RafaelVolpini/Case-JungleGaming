type YieldingScheduler = { yield?: () => Promise<void> }

export function yieldToMain(): Promise<void> {
  const scheduler = (globalThis as { scheduler?: YieldingScheduler }).scheduler
  if (scheduler?.yield) return scheduler.yield()
  return new Promise((resolve) => setTimeout(resolve, 0))
}
