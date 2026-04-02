<script lang="ts">
  import { cn, getInitials } from '@hms/utils'

  let {
    name,
    size = 'md',
    class: className = '',
  }: {
    name: string
    size?: 'sm' | 'md' | 'lg'
    class?: string
  } = $props()

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  }
</script>

<div class={cn(
  'flex items-center justify-center rounded-full bg-blue-600 font-medium text-white',
  sizes[size],
  className
)}>
  {getInitials(name)}
</div>
