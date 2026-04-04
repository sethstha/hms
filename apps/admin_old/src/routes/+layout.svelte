<script lang="ts">
  import '../app.css'
  import { getLocale, locales, setLocale, type Locale } from '../paraglide/runtime.js'

  let { children } = $props()
  const activeLocale = getLocale()

  const switchLocale = (locale: Locale) => {
    if (locale === activeLocale) return
    setLocale(locale)
  }
</script>

<div class="fixed top-3 right-3 z-50 flex items-center gap-1 rounded-lg border border-border bg-background/90 p-1 shadow-sm backdrop-blur">
  {#each locales as locale}
    <button
      type="button"
      class="rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wide transition-colors"
      class:bg-primary={locale === activeLocale}
      class:text-primary-foreground={locale === activeLocale}
      class:text-muted-foreground={locale !== activeLocale}
      class:hover:text-foreground={locale !== activeLocale}
      onclick={() => switchLocale(locale)}
      aria-pressed={locale === activeLocale}
    >
      {locale}
    </button>
  {/each}
</div>

{@render children()}
