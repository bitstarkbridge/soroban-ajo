'use client'

import { useEffect, useState } from 'react'

import type { FreighterApi } from '@/types/wallet'
import { getFreighterApi } from '@/utils/freighter'

type LogToConsole = boolean

export default function FreighterDebugConsole({
  logToConsole = true,
}: {
  logToConsole?: LogToConsole
}) {
  const [logs, setLogs] = useState<string[]>([])
  const [freighterApi, setFreighterApi] = useState<FreighterApi | null>(null)

  const addLog = (message: string) => {
    const line = `[${new Date().toLocaleTimeString()}] ${message}`
    setLogs(prev => [...prev, line])
    // Debug logging disabled for production
  }

  useEffect(() => {
    addLog('Page loaded, starting Freighter detection...')

    const detectFreighter = async () => {
      addLog('Checking window object...')
      addLog(`window is defined: ${typeof window !== 'undefined'}`)

      if (typeof window === 'undefined') {
        addLog('ERROR: window is undefined')
        return
      }

      addLog('Checking for freighterApi...')
      addLog(`window.freighterApi exists: ${!!(window as any).freighterApi}`)

      const immediate = getFreighterApi()
      if (immediate) {
        addLog('✓ Freighter API found immediately!')
        setFreighterApi(immediate)
        return
      }

      addLog('Freighter not found, waiting...')

      for (let i = 0; i < 50; i++) {
        await new Promise(resolve => setTimeout(resolve, 100))
        const api = getFreighterApi()
        if (api) {
          addLog(`✓ Freighter API found after ${(i + 1) * 100}ms!`)
          setFreighterApi(api)
          return
        }
        if (i % 10 === 0) {
          addLog(`Still waiting... (${(i + 1) * 100}ms elapsed)`)
        }
      }

      addLog('✗ Freighter API not found after 5 seconds')
      addLog('Checking window properties...')

      const windowKeys = Object.keys(window).filter(
        key =>
          key.toLowerCase().includes('freighter') ||
          key.toLowerCase().includes('stellar') ||
          key.toLowerCase().includes('wallet'),
      )

      if (windowKeys.length > 0) {
        addLog(`Found related properties: ${windowKeys.join(', ')}`)
      } else {
        addLog('No wallet-related properties found on window object')
      }
    }

    detectFreighter()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const testFreighterMethods = async () => {
    if (!freighterApi) {
      addLog('ERROR: No Freighter API available')
      return
    }

    try {
      addLog('Testing isAllowed()...')
      const allowed = (await freighterApi.isAllowed?.()) ?? false
      addLog(`isAllowed() returned: ${allowed}`)

      if (!allowed && freighterApi.setAllowed) {
        addLog('Requesting permission with setAllowed()...')
        await freighterApi.setAllowed()
        addLog('setAllowed() completed')
      }

      addLog('Testing getPublicKey()...')
      const publicKey = await freighterApi.getPublicKey()
      addLog(`✓ Got public key: ${publicKey}`)

      if (freighterApi.getNetworkDetails) {
        addLog('Testing getNetworkDetails()...')
        const network = await freighterApi.getNetworkDetails()
        addLog(`✓ Network: ${JSON.stringify(network)}`)
      } else {
        addLog('getNetworkDetails() not available on this Freighter API')
      }
    } catch (err) {
      addLog(`ERROR: ${err instanceof Error ? err.message : String(err)}`)
      // Error logged to UI console
    }
  }

  const checkExtensions = () => {
    addLog('Checking for other wallet extensions...')

    const checks = [
      { name: 'Freighter', key: 'freighterApi' },
      { name: 'Albedo', key: 'albedo' },
      { name: 'xBull', key: 'xBullSDK' },
      { name: 'Rabet', key: 'rabet' },
      { name: 'MetaMask', key: 'ethereum' },
    ]

    checks.forEach(({ name, key }) => {
      const exists = !!(window as any)[key]
      addLog(`${name}: ${exists ? '✓ Found' : '✗ Not found'}`)
    })
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">
          Freighter Debug Console
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div
            className={`p-4 rounded-lg ${freighterApi ? 'bg-green-900' : 'bg-red-900'}`}
          >
            <div className="text-sm text-gray-300">Freighter Status</div>
            <div className="text-2xl font-bold">
              {freighterApi ? '✓ Detected' : '✗ Not Found'}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-blue-900">
            <div className="text-sm text-gray-300">Logs</div>
            <div className="text-2xl font-bold">{logs.length}</div>
          </div>

          <div className="p-4 rounded-lg bg-purple-900">
            <div className="text-sm text-gray-300">Browser</div>
            <div className="text-lg font-bold">
              {typeof navigator !== 'undefined'
                ? navigator.userAgent.includes('Chrome')
                  ? 'Chrome'
                  : navigator.userAgent.includes('Firefox')
                    ? 'Firefox'
                    : navigator.userAgent.includes('Safari')
                      ? 'Safari'
                      : 'Other'
                : 'Unknown'}
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <button
            onClick={testFreighterMethods}
            disabled={!freighterApi}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
          >
            Test Freighter Methods
          </button>

          <button
            onClick={checkExtensions}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Check All Wallet Extensions
          </button>

          <button
            onClick={() => setLogs([])}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition"
          >
            Clear Logs
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Console Output</h2>
            <span className="text-sm text-gray-400">{logs.length} entries</span>
          </div>

          <div className="bg-black rounded p-4 font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">Waiting for logs...</div>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  className={
                    log.includes('ERROR')
                      ? 'text-red-400'
                      : log.includes('✓')
                        ? 'text-green-400'
                        : log.includes('✗')
                          ? 'text-red-400'
                          : log.includes('waiting')
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                  }
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="font-bold mb-2">Quick Checks:</h3>
          <ul className="space-y-2 text-sm">
            <li>• Is Freighter icon visible in your browser toolbar?</li>
            <li>• Can you click the Freighter icon and see your wallet?</li>
            <li>• Have you created/imported an account in Freighter?</li>
            <li>• Did you refresh this page after installing Freighter?</li>
            <li>• Are you using Chrome, Firefox, Brave, or Edge?</li>
          </ul>
        </div>

        <div className="mt-6 p-4 bg-yellow-900 rounded-lg">
          <h3 className="font-bold mb-2 text-yellow-200">
            If Freighter is not detected:
          </h3>
          <ol className="space-y-2 text-sm text-yellow-100 list-decimal list-inside">
            <li>Go to your browser&apos;s extension page (chrome://extensions/)</li>
            <li>Find Freighter and make sure it&apos;s enabled</li>
            <li>Click the Freighter icon to open it</li>
            <li>Make sure you have an account (create or import one)</li>
            <li>Come back to this page and refresh (F5)</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

