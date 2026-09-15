import { Button } from '@/components/ui/button'
import { cn } from '../lib/utils'

export default function SectionHeader({ title, subtitle, actionLabel = 'Lihat Semuanya', right, className }) {
  return (
    <div className={cn('flex justify-between items-end gap-4 mb-6', className)}>
      <div>
        <h2 className="text-2xl font-bold text-primary">{title}</h2>
        {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
      </div>
      {right ??
        (actionLabel ? (
          <Button variant="ghost" size="sm" className="text-secondary hover:text-secondary/80 shrink-0 hidden sm:inline-flex">
            {actionLabel} <span className="material-symbols-outlined text-sm">chevron_right</span>
          </Button>
        ) : null)}
    </div>
  )
}
