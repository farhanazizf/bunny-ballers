import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type RegisterIntent = {
  programId?: 'mini' | 'junior' | 'senior'
  session?: 'fri' | 'sat'
}

type IntentContextValue = {
  intent: RegisterIntent
  setIntent: (next: RegisterIntent) => void
}

const IntentContext = createContext<IntentContextValue | null>(null)

export function IntentProvider({ children }: { children: ReactNode }) {
  const [intent, setIntent] = useState<RegisterIntent>({})
  const value = useMemo(() => ({ intent, setIntent }), [intent])
  return <IntentContext.Provider value={value}>{children}</IntentContext.Provider>
}

export function useRegisterIntent(): IntentContextValue {
  const ctx = useContext(IntentContext)
  if (!ctx) throw new Error('useRegisterIntent must be used within IntentProvider')
  return ctx
}
