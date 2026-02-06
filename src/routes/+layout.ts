import { ScanPresenter } from '$lib/presenters/ScanPresenter.svelte';
import type { LayoutLoad } from './$types';

export const prerender = true;
export const ssr = false;

export const load: LayoutLoad = () => {
    const scanPresenter = new ScanPresenter();
    return { scanPresenter };
};
