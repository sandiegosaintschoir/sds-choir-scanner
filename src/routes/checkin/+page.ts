import type { ScanMode } from '$lib/config';
import { ScanPresenter } from '$lib/presenters/ScanPresenter.svelte';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
    const presenter = new ScanPresenter(url.href, 'checkin');
    return { presenter };
};
