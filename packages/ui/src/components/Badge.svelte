<script lang="ts">
  import { cn } from '@hms/utils'

  type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info'

  let {
    variant = 'default',
    class: className = '',
    children,
  }: {
    variant?: Variant
    class?: string
    children?: import('svelte').Snippet
  } = $props()

  const variants: Record<Variant, string> = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  }
</script>

<span class={cn(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  variants[variant],
  className
)}>
  {@render children?.()}
</span>
