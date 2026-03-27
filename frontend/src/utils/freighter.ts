import type { FreighterApi, StellarNetwork } from '@/types/wallet'

export type WaitForFreighterOptions = {
  timeoutMs?: number
  intervalMs?: number
}

export function getFreighterApi(): FreighterApi | null {
  if (typeof window === 'undefined') return null
  return ((window as any).freighterApi ?? null) as FreighterApi | null
}

export async function waitForFreighterApi(
  options: WaitForFreighterOptions = {},
): Promise<FreighterApi | null> {
  const timeoutMs = options.timeoutMs ?? 3000
  const intervalMs = options.intervalMs ?? 100

  const start = Date.now()
  while (Date.now() - start <= timeoutMs) {
    const api = getFreighterApi()
    if (api) return api
    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }

  return null
}

export async function ensureFreighterAllowed(api: FreighterApi): Promise<void> {
  // Older/partial APIs might not expose these methods.
  if (!api.isAllowed || !api.setAllowed) return

  const allowed = await api.isAllowed()
  if (!allowed) {
    await api.setAllowed()
  }
}

export function getStellarNetworkFromFreighter(
  networkDetails: unknown,
): StellarNetwork {
  const net = (networkDetails as any)?.network
  if (net === 'PUBLIC') return 'mainnet'
  if (net === 'FUTURENET') return 'futurenet'
  return 'testnet'
}

