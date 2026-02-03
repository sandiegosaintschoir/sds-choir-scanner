import type { ScanMode } from '$lib/config';
import { ScanPresenter } from '$lib/presenters/ScanPresenter.svelte';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
    // Read mode from query parameter, default to 'checkout'
    const modeParam = url.searchParams.get('mode');
    const mode: ScanMode = modeParam === 'checkin' ? 'checkin' : 'checkout';

    const presenter = new ScanPresenter(url.href, mode);
    return { presenter };
};
