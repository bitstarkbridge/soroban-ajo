'use client';

import React, { useEffect, useRef } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { WelcomeStep } from './WelcomeStep';
import { WalletSetupStep } from './WalletSetupStep';
import { FirstGroupStep } from './FirstGroupStep';

const STEPS = ['Welcome', 'Wallet', 'First Group'];

export function OnboardingFlow() {
  const {
    isOnboardingActive,
    currentStep,
    skipOnboarding,
    completeOnboarding,
    nextStep,
    prevStep,
  } = useOnboarding();

  // Trap focus inside modal while open
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOnboardingActive) {
      containerRef.current?.focus();
    }
  }, [isOnboardingActive]);

  if (!isOnboardingActive) return null;

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Ajo onboarding"
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        className="relative w-full max-w-lg bg-white dark:bg-surface-900 rounded-2xl shadow-2xl outline-none overflow-hidden"
      >
        {/* Top bar: step labels + skip */}
        <div className="px-6 pt-5 pb-4 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {STEPS.map((label, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span
                    className={`text-xs font-medium transition-colors ${
                      i === currentStep
                        ? 'text-primary-600 dark:text-primary-400'
                        : i < currentStep
                        ? 'text-success-600 dark:text-success-400'
                        : 'text-surface-400 dark:text-surface-600'
                    }`}
                  >
                    {i < currentStep ? '✓' : i + 1}. {label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span className="text-surface-300 dark:text-surface-700 text-xs">›</span>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={skipOnboarding}
              className="text-xs text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
              aria-label="Skip onboarding"
            >
              Skip all
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={currentStep + 1}
              aria-valuemin={1}
              aria-valuemax={STEPS.length}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="p-6">
          {currentStep === 0 && (
            <WelcomeStep onNext={nextStep} onSkip={skipOnboarding} />
          )}
          {currentStep === 1 && (
            <WalletSetupStep onNext={nextStep} onBack={prevStep} onSkip={skipOnboarding} />
          )}
          {currentStep === 2 && (
            <FirstGroupStep onComplete={completeOnboarding} onBack={prevStep} />
          )}
        </div>
      </div>
    </div>
  );
}
