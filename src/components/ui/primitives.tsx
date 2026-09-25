import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-11 items-center justify-center px-8 py-3.5 text-sm font-semibold tracking-wide transition duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bunny-orange focus-visible:ring-offset-2 focus-visible:ring-offset-bunny-ink',
        'active:scale-[0.98] active:translate-y-px',
        variant === 'primary' &&
          'rounded-lg bg-bunny-orange text-bunny-ink shadow-[0_12px_28px_-10px_rgba(196,90,38,0.7)] hover:bg-bunny-ember hover:translate-y-[-1px]',
        variant === 'secondary' &&
          'rounded-md border border-bunny-steel text-bunny-chalk hover:border-bunny-orange',
        className,
      )}
      {...props}
    />
  )
}

export function Lightbox({
  src,
  alt,
  onClose,
  onPrev,
  onNext,
}: {
  src: string
  alt: string
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[var(--z-lightbox)] flex items-center justify-center bg-bunny-ink/90 p-6"
      onClick={onClose}
    >
      <img
        src={src}
        alt={alt}
        className="max-h-[85vh] max-w-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <button type="button" className="absolute right-6 top-6 min-h-11 min-w-11 text-bunny-chalk" onClick={onClose}>
        Esc
      </button>
      <button
        type="button"
        className="absolute left-4 top-1/2 min-h-11 min-w-11 -translate-y-1/2 text-bunny-chalk"
        onClick={(e) => {
          e.stopPropagation()
          onPrev()
        }}
      >
        Prev
      </button>
      <button
        type="button"
        className="absolute right-4 top-1/2 min-h-11 min-w-11 -translate-y-1/2 text-bunny-chalk"
        onClick={(e) => {
          e.stopPropagation()
          onNext()
        }}
      >
        Next
      </button>
    </div>
  )
}
