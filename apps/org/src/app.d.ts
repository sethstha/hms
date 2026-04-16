// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { AppSession } from "$lib/auth/client";

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session: AppSession | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
