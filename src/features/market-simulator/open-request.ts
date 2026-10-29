export const SIMULATOR_REQUESTED_AT_LOAD =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('simulador')
