// See https://svelte.dev/docs/kit/types#app.d.ts for information about these interfaces

declare global {
  namespace App {
    interface Locals {
      // TODO: Type this properly when BetterAuth is configured
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      session: any | null
      // TODO: Type this properly when DB/tenant model is defined
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tenant: any | null
    }
    // interface Error {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {}
