import type { Snippet } from 'svelte';
import type { HTMLInputAttributes } from 'svelte/elements';
import type { ButtonProps } from '../components/button.svelte';
import type { UseRampOptions } from '@hms/utils/hooks/use-ramp.svelte';
import type { WithElementRef } from '@hms/lib/utils';

export type NumberFieldRootProps = {
	value?: number;
	step?: number;
	min?: number;
	max?: number;
	rampSettings?: Omit<UseRampOptions, 'increment' | 'canRamp'>;
	children: Snippet;
};

export type NumberFieldButtonProps = Omit<ButtonProps, 'disabled'> & {
	disabled?: boolean;
};

export type NumberFieldInputProps = WithElementRef<
	Omit<HTMLInputAttributes, 'min' | 'max' | 'value' | 'type'>
>;
