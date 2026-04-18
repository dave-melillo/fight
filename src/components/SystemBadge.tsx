'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SystemResult, SystemId } from '@/types';
import { SYSTEM_DESCRIPTIONS } from '@/lib/systems';

interface SystemBadgeProps {
  system: SystemResult;
  className?: string;
  showDescription?: boolean;
}

export function SystemBadge({ system, className, showDescription }: SystemBadgeProps) {
  const meta = SYSTEM_DESCRIPTIONS[system.id];

  if (!system.triggered) {
    return null;
  }

  const confidenceStyles = {
    HIGH: 'bg-red-500/20 text-red-700 border-red-500/30',
    MEDIUM: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
    LOW: 'bg-gray-500/20 text-gray-600 border-gray-500/30',
  };

  return (
    <div className={cn('inline-flex flex-col', className)}>
      <Badge
        variant="outline"
        className={cn(confidenceStyles[system.confidence], 'font-medium gap-1')}
      >
        {meta.emoji} {meta.name}
      </Badge>
      {showDescription && (
        <span className="text-xs text-muted-foreground mt-1 max-w-48">
          {system.description}
        </span>
      )}
    </div>
  );
}

interface SystemCountBadgeProps {
  count: number;
  className?: string;
}

export function SystemCountBadge({ count, className }: SystemCountBadgeProps) {
  if (count === 0) return null;

  const color = count >= 4 ? 'bg-red-500 text-white'
    : count >= 2 ? 'bg-amber-500 text-white'
    : 'bg-gray-400 text-white';

  return (
    <Badge className={cn(color, 'font-bold text-xs', className)}>
      {count} {count === 1 ? 'system' : 'systems'}
    </Badge>
  );
}

interface FighterStyleBadgeProps {
  style: string;
  finishType: string;
  className?: string;
}

export function FighterStyleBadge({ style, finishType, className }: FighterStyleBadgeProps) {
  const styleConfig: Record<string, { emoji: string; color: string }> = {
    STRIKER: { emoji: '👊', color: 'bg-orange-500/20 text-orange-700 border-orange-500/30' },
    GRAPPLER: { emoji: '🤼', color: 'bg-blue-500/20 text-blue-700 border-blue-500/30' },
    SUBMISSION: { emoji: '🔒', color: 'bg-purple-500/20 text-purple-700 border-purple-500/30' },
    WRESTLER: { emoji: '🏋️', color: 'bg-teal-500/20 text-teal-700 border-teal-500/30' },
    BALANCED: { emoji: '⚖️', color: 'bg-gray-500/20 text-gray-700 border-gray-500/30' },
  };

  const config = styleConfig[style] || styleConfig.BALANCED;

  return (
    <Badge variant="outline" className={cn(config.color, 'font-medium', className)}>
      {config.emoji} {style}
    </Badge>
  );
}
