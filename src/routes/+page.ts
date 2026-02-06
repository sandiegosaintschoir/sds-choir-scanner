import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, url }) => {
    const { scanPresenter } = await parent();

    const urlItems = scanPresenter.getItemsFromUrl(url);
    if (urlItems) {
        scanPresenter.addItems(urlItems);
        const strippedUrl = scanPresenter.stripItemsFromUrl(url);
        throw redirect(302, strippedUrl);
    }

    return { presenter: scanPresenter };
};
