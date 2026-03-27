/**
 * GradientText - renders text with a gradient fill
 * Issue #317: Gradient color system
 */
import React from 'react'

type GradientVariant = 'primary' | 'stellar' | 'success' | 'accent' | 'info'
type TextTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'

interface GradientTextProps {
  children: React.ReactNode
  variant?: GradientVariant
  as?: TextTag
  className?: string
}

const variantClass: Record<GradientVariant, string> = {
  primary: 'text-gradient-primary',
  stellar: 'text-gradient-stellar',
  success: 'text-gradient-success',
  accent: 'text-gradient-accent',
  info: 'text-gradient-info',
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  variant = 'stellar',
  as: Tag = 'span',
  className = '',
}) => {
  return (
    <Tag className={`${variantClass[variant]} ${className}`}>
      {children}
    </Tag>
  )
}
