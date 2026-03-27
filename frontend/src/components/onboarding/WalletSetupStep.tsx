'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';

interface WalletSetupStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const wallets = [
  {
    id: 'freighter' as const,
    name: 'Freighter',
    description: 'Official Stellar wallet — recommended',
    icon: '🚀',
    installUrl: 'https://freighter.app',
    badge: 'Recommended',
  },
  {
    id: 'lobstr' as const,
    name: 'LOBSTR',
    description: 'Popular Stellar wallet with mobile support',
    icon: '🦞',
    installUrl: 'https://lobstr.co',
    badge: null,
  },
];

export function WalletSetupStep({ onNext, onBack, onSkip }: WalletSetupStepProps) {
  const { connect, isConnected, address, isLoading, error } = useWallet();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);

  const handleConnect = async (walletId: 'freighter' | 'lobstr') => {
    setConnecting(walletId);
    const result = await connect({ walletType: walletId, network: 'testnet' });
    setConnecting(null);
    if (result.success) {
      setTimeout(() => {
        setVisible(false);
        setTimeout(onNext, 200);
      }, 800);
    }
  };

  const handleNext = () => {
    setVisible(false);
    setTimeout(onNext, 200);
  };

  return (
    <div className={`transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">👛</div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-surface-500 dark:text-surface-400">
          Your Stellar wallet is your identity on Ajo. No passwords needed.
        </p>
      </div>

      {/* Already connected */}
      {isConnected && address ? (
        <div className="bg-success-50 dark:bg-success-500/10 border border-success-100 dark:border-success-700 rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-semibold text-success-700 dark:text-success-400 text-sm">Wallet connected</p>
            <p className="text-xs font-mono text-surface-500 dark:text-surface-400">
              {address.slice(0, 8)}...{address.slice(-8)}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {wallets.map((w) => (
            <button
              key={w.id}
              onClick={() => handleConnect(w.id)}
              disabled={isLoading || !!connecting}
              className="w-full flex items-center gap-4 p-4 bg-surface-50 dark:bg-surface-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
            >
              <span className="text-3xl">{w.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-surface-900 dark:text-white">{w.name}</span>
                  {w.badge && (
                    <span className="text-xs bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">
                      {w.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-surface-500 dark:text-surface-400">{w.description}</p>
              </div>
              {connecting === w.id ? (
                <svg className="animate-spin h-5 w-5 text-primary-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <span className="text-surface-400 dark:text-surface-500">→</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-error-50 dark:bg-error-500/10 border border-error-100 dark:border-error-700 rounded-xl p-3 mb-4">
          <p className="text-sm text-error-700 dark:text-error-400">{error.message}</p>
          {error.code === 'WALLET_NOT_INSTALLED' && (
            <a
              href={wallets.find(w => w.id === error.walletType)?.installUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-600 dark:text-primary-400 underline mt-1 inline-block"
            >
              Install {error.walletType} →
            </a>
          )}
        </div>
      )}

      {/* Testnet note */}
      <div className="bg-warning-50 dark:bg-warning-500/10 border border-warning-100 dark:border-warning-700 rounded-xl p-3 mb-6">
        <p className="text-xs text-warning-700 dark:text-warning-400">
          <strong>Testnet mode:</strong> Make sure your wallet is set to Stellar Testnet.
          Testnet XLM has no real value — get free XLM from{' '}
          <a
            href="https://friendbot.stellar.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Stellar Friendbot
          </a>.
        </p>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="text-sm text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
        >
          ← Back
        </button>
        <div className="flex gap-3">
          {!isConnected && (
            <button
              onClick={onSkip}
              className="text-sm text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
            >
              Skip for now
            </button>
          )}
          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors shadow-sm"
          >
            {isConnected ? 'Continue →' : 'Skip →'}
          </button>
        </div>
      </div>
    </div>
  );
}
