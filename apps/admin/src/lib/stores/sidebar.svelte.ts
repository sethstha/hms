// Sidebar state store for the admin app using Svelte 5 runes

function createSidebar() {
  let isOpen = $state(true)
  let isMobileOpen = $state(false)

  return {
    get isOpen() { return isOpen },
    get isMobileOpen() { return isMobileOpen },
    toggle() { isOpen = !isOpen },
    open() { isOpen = true },
    close() { isOpen = false },
    toggleMobile() { isMobileOpen = !isMobileOpen },
    closeMobile() { isMobileOpen = false },
  }
}

export const sidebar = createSidebar()
