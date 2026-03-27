'use client';

import { useState } from 'react';

interface WelcomeStepProps {
  onNext: () => void;
  onSkip: () => void;
}

const concepts = [
  {
    icon: '🤝',
    title: 'Pool Together',
    description: 'Members contribute a fixed amount every cycle into a shared pot.',
  },
  {
    icon: '🔄',
    title: 'Rotate Payouts',
    description: 'Each cycle, one member receives the full pool. Everyone gets a turn.',
  },
  {
    icon: '⛓️',
    title: 'Blockchain Secured',
    description: 'Every transaction is recorded on Stellar — transparent and tamper-proof.',
  },
];

export function WelcomeStep({ onNext, onSkip }: WelcomeStepProps) {
  const [visible, setVisible] = useState(true);

  const handleNext = () => {
    setVisible(false);
    setTimeout(onNext, 200);
  };

  return (
    <div
      className={`transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4 animate-bounce">👋</div>
        <h2 className="text-3xl font-bold text-surface-900 dark:text-white mb-3">
          Welcome to Ajo
        </h2>
        <p className="text-surface-500 dark:text-surface-400 text-lg max-w-md mx-auto">
          A decentralized savings group platform built on the Stellar blockchain.
          Save together, grow together.
        </p>
      </div>

      {/* What is a ROSCA */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-500 text-center mb-4">
          How it works
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {concepts.map((c, i) => (
            <div
              key={i}
              className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4 text-center border border-surface-200 dark:border-surface-700"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="text-3xl mb-2">{c.icon}</div>
              <p className="font-semibold text-surface-900 dark:text-white text-sm mb-1">{c.title}</p>
              <p className="text-surface-500 dark:text-surface-400 text-xs">{c.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Example */}
      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-xl p-4 mb-8">
        <p className="text-sm font-semibold text-primary-700 dark:text-primary-300 mb-1">
          Quick example
        </p>
        <p className="text-sm text-primary-600 dark:text-primary-400">
          5 friends each contribute 100 XLM/month. Month 1: Friend A gets 500 XLM.
          Month 2: Friend B gets 500 XLM. After 5 months, everyone has received their payout.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={onSkip}
          className="text-sm text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
        >
          Skip tutorial
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors shadow-sm"
        >
          Get started →
        </button>
      </div>
    </div>
  );
}
