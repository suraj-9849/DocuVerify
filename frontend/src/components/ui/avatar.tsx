import * as React from 'react';
import { cn } from '@/lib/utils';

const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-secondary-foreground text-xs font-semibold',
        className,
      )}
      {...props}
    />
  ),
);
Avatar.displayName = 'Avatar';

export { Avatar };
