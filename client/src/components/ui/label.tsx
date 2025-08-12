import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      variant: {
        default: 'text-foreground',
        error: 'text-destructive',
        success: 'text-green-600 dark:text-green-400',
        warning: 'text-amber-600 dark:text-amber-400',
        info: 'text-blue-600 dark:text-blue-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {
  asChild?: boolean;
  required?: boolean;
  optional?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, variant, asChild = false, children, required, optional, ...props }, ref) => {
    const Comp = asChild ? Slot : 'label';
    
    return (
      <div className="flex items-center justify-between">
        <Comp
          className={cn(labelVariants({ variant, className }))}
          ref={ref}
          {...props}
        >
          {children}
          {required && <span className="text-destructive ml-1">*</span>}
        </Comp>
        {optional && (
          <span className="text-xs text-muted-foreground">Opcional</span>
        )}
      </div>
    );
  }
);
Label.displayName = 'Label';

export { Label };
