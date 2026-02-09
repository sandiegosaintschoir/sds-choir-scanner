import { ScanControlsPresenter } from '$lib/presenters/ScanControlsPresenter.svelte';
import { ScanPresenter } from '$lib/presenters/ScanPresenter.svelte';
import { VideoElementProvider } from '$lib/VideoElementProvider.svelte';
import type { LayoutLoad } from './$types';

export const prerender = true;
export const ssr = false;

export const load: LayoutLoad = () => {
    const videoElementProvider = new VideoElementProvider();
    const scanPresenter = new ScanPresenter();
    const controlsPresenter = new ScanControlsPresenter(videoElementProvider);
    return { videoElementProvider, scanPresenter, controlsPresenter };
};
