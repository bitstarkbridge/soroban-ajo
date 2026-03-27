'use client';

import React, { useState } from 'react';

interface FirstGroupStepProps {
  onComplete: () => void;
  onBack: () => void;
}

type Choice = 'create' | 'join' | null;

const createSteps = [
  { icon: '✏️', text: 'Name your group and set a contribution amount' },
  { icon: '📅', text: 'Choose a cycle length (e.g. monthly)' },
  { icon: '👥', text: 'Set a max member count and invite people' },
  { icon: '🚀', text: 'Deploy the group — a smart contract is created on Stellar' },
];

const joinSteps = [
  { icon: '🔍', text: 'Browse available groups or use an invite link' },
  { icon: '📋', text: 'Review the group rules: amount, cycle, member count' },
  { icon: '✅', text: 'Click Join and approve the transaction in your wallet' },
  { icon: '💰', text: 'Contribute each cycle and wait for your payout round' },
];

export function FirstGroupStep({ onComplete, onBack }: FirstGroupStepProps) {
  const [choice, setChoice] = useState<Choice>(null);
  const [visible, setVisible] = useState(true);

  const handleComplete = () => {
    setVisible(false);
    setTimeout(onComplete, 200);
  };

  const steps = choice === 'create' ? createSteps : joinSteps;

  return (
    <div className={`transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">👥</div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
          Your First Group
        </h2>
        <p className="text-surface-500 dark:text-surface-400">
          You can create a new savings group or join an existing one.
        </p>
      </div>

      {/* Choice cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { id: 'create' as Choice, icon: '➕', label: 'Create a group', sub: 'Start your own ROSCA' },
          { id: 'join' as Choice, icon: '🔗', label: 'Join a group', sub: 'Find an existing one' },
        ].map((opt) => (
          <button
            key={opt.id!}
            onClick={() => setChoice(opt.id)}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              choice === opt.id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 hover:border-primary-300 dark:hover:border-primary-700'
            }`}
          >
            <div className="text-3xl mb-2">{opt.icon}</div>
            <p className="font-semibold text-surface-900 dark:text-white text-sm">{opt.label}</p>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{opt.sub}</p>
          </button>
        ))}
      </div>

      {/* Steps for chosen path */}
      {choice && (
        <div className="bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl p-4 mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-500 mb-3">
            How to {choice === 'create' ? 'create' : 'join'}
          </p>
          <ol className="space-y-2">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs flex items-center justify-center font-bold mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-surface-700 dark:text-surface-300">
                  {s.icon} {s.text}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Tip */}
      <div className="bg-accent-50 dark:bg-accent-900/20 border border-accent-100 dark:border-accent-800 rounded-xl p-3 mb-6">
        <p className="text-xs text-accent-700 dark:text-accent-300">
          <strong>💡 Tip:</strong> You can always replay this tutorial from your profile settings.
        </p>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="text-sm text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleComplete}
          className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors shadow-sm"
        >
          🎉 Start using Ajo
        </button>
      </div>
    </div>
  );
}
