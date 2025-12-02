'use client'

import { useEffect, useState, useRef } from 'react'
import { Loader2, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'motion/react'

export type FormState =
  | 'idle'
  | 'dirty'
  | 'loading'
  | 'success'
  | 'error'
  | 'warning'

interface FormActionBarProps {
  state: FormState
  message?: string
  successMessage?: string
  errorMessage?: string
  warningMessage?: string
  loadingMessage?: string
  dirtyMessage?: string
  onReset?: () => void
  onSave?: () => void
  resetLabel?: string
  saveLabel?: string
  className?: string
  onAnimationComplete?: () => void
}

const stateConfig = {
  idle: {
    icon: null,
    message: '',
    accentColor: '',
    progressColor: '',
  },
  dirty: {
    icon: null,
    message: 'Careful — you have unsaved changes!',
    accentColor: 'text-foreground',
    progressColor: '',
  },
  loading: {
    icon: Loader2,
    message: 'Saving changes...',
    accentColor: 'text-foreground',
    progressColor: '',
  },
  success: {
    icon: CheckCircle2,
    message: 'Changes saved successfully!',
    accentColor: 'text-green-600',
    progressColor: 'bg-green-100',
  },
  error: {
    icon: AlertCircle,
    message: 'Failed to save changes. Please try again.',
    accentColor: 'text-destructive',
    progressColor: 'bg-destructive/10',
  },
  warning: {
    icon: AlertTriangle,
    message: 'Saved with warnings.',
    accentColor: 'text-yellow-600',
    progressColor: 'bg-yellow-100',
  },
}

export function FormActionBar({
  state,
  message,
  successMessage,
  errorMessage,
  warningMessage,
  loadingMessage,
  dirtyMessage,
  onReset,
  onSave,
  resetLabel = 'Reset',
  saveLabel = 'Save Changes',
  className,
  onAnimationComplete,
}: FormActionBarProps) {
  const [visibleBar, setVisibleBar] = useState<
    'none' | 'dirty' | 'loading' | 'progress'
  >('none')
  const [progressState, setProgressState] = useState<FormState>('idle')
  const prevStateRef = useRef<FormState>('idle')

  useEffect(() => {
    const prevState = prevStateRef.current
    prevStateRef.current = state

    if (state === 'idle') {
      // Only hide if we're not showing a progress animation
      if (visibleBar !== 'progress') {
        setVisibleBar('none')
      }
      // Don't reset progressState immediately - let animation complete first
    } else if (state === 'dirty') {
      setVisibleBar('dirty')
      setProgressState('idle')
    } else if (state === 'loading') {
      setProgressState('idle')
      if (prevState === 'dirty') {
        setVisibleBar('none')
        setTimeout(() => {
          setVisibleBar('loading')
        }, 300)
      } else {
        setVisibleBar('loading')
      }
    } else if (
      state === 'success' ||
      state === 'error' ||
      state === 'warning'
    ) {
      setProgressState(state)
      if (visibleBar === 'loading') {
        setVisibleBar('none')
        setTimeout(() => {
          setVisibleBar('progress')
        }, 300)
      } else {
        setVisibleBar('progress')
      }
    }
  }, [state, visibleBar])

  const config = stateConfig[progressState]
  const Icon = config.icon

  // Get the appropriate message based on state
  let displayMessage = message || config.message
  if (state === 'dirty' && dirtyMessage) displayMessage = dirtyMessage
  if (state === 'loading' && loadingMessage) displayMessage = loadingMessage

  // For progress bar states, use progressState
  if (progressState === 'success') {
    displayMessage = successMessage || config.message
  }
  if (progressState === 'error') {
    displayMessage = errorMessage || config.message
  }
  if (progressState === 'warning') {
    displayMessage = warningMessage || config.message
  }

  const barClassName =
    'inline-flex items-center justify-center gap-4 px-1 py-0 bg-background border rounded-lg overflow-hidden shadow-lg'

  const handleProgressComplete = () => {
    setProgressState('idle')
    setVisibleBar('none')
    if (onAnimationComplete) {
      onAnimationComplete()
    }
  }

  return (
    <div
      className={cn(
        'fixed bottom-12 left-0 right-4 z-50 flex justify-end px-4',
        className
      )}
    >
      <AnimatePresence mode="wait">
        {visibleBar === 'dirty' && (
          <motion.div
            key="dirty-bar"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className={barClassName}
          >
            <div className="flex items-center px-0 py-2 space-x-0">
              <div className="inline-flex items-center justify-center gap-2 pl-3 pr-3 py-0">
                <span className="text-foreground text-[13px] leading-5 font-medium whitespace-nowrap">
                  {dirtyMessage || stateConfig.dirty.message}
                </span>
              </div>

              <div className="inline-flex items-center gap-2 pl-0 pr-2 py-0">
                <span className="px-2 text-border hidden sm:block">|</span>

                {onReset && (
                  <Button variant="outline" size="sm" onClick={onReset}>
                    {resetLabel}
                  </Button>
                )}

                {onSave && (
                  <Button variant="default" size="sm" onClick={onSave}>
                    {saveLabel}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {visibleBar === 'loading' && (
          <motion.div
            key="loading-bar"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className={barClassName}
          >
            <div className="flex items-center px-3 py-2 space-x-2">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
              <span className="text-[13px] leading-5 font-medium whitespace-nowrap text-foreground">
                {loadingMessage || stateConfig.loading.message}
              </span>
            </div>
          </motion.div>
        )}

        {visibleBar === 'progress' && (
          <motion.div
            key="progress-bar"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className={cn(barClassName, 'relative')}
          >
            {config.progressColor && (
              <motion.div
                key={`progress-fill-${progressState}`}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 3, ease: 'linear' }}
                onAnimationComplete={handleProgressComplete}
                className={cn(
                  'absolute inset-y-0 left-0 opacity-50',
                  config.progressColor
                )}
              />
            )}

            <div className="flex items-center px-3 py-2.5 space-x-2 relative z-10">
              {Icon && (
                <Icon className={cn('h-4 w-4 shrink-0', config.accentColor)} />
              )}
              <span
                className={cn(
                  'text-[13px] leading-5 font-medium whitespace-nowrap',
                  config.accentColor || 'text-foreground'
                )}
              >
                {displayMessage}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
