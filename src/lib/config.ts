/**
 * Application Configuration
 */

export type ScanMode = 'checkin' | 'checkout';

/**
 * Google Form URL for checkout process.
 * The {ids} placeholder will be replaced with comma-separated scanned item IDs.
 */
export const CHECKOUT_FORM_URL =
    'https://docs.google.com/forms/d/e/1FAIpQLSe5S4yge_s8ajTstJ6U17o9VUj3oFEpBHUadDFsN_GOi0QE2A/viewform?usp=pp_url&entry.313553357={ids}';

/**
 * Google Form URL for checkin process.
 * The {ids} placeholder will be replaced with comma-separated scanned item IDs.
 */
export const CHECKIN_FORM_URL =
    'https://docs.google.com/forms/d/e/1FAIpQLScGCRxW3jehdjonoVMcIcKIhJL8HOR5-2yR5f_HsYCj7pYgnw/viewform?usp=pp_url&entry.591811361={ids}';

/**
 * The host name of the choir scanner web app
 */
export const HOST_NAME = 'sandiegosaintschoir.github.io';
/**
 * The base path of the choir scanner web app
 */
export const BASE_PATH = '/sds-choir-scanner';

/**
 * Builds the form URL with the provided item IDs based on the mode
 */
export function buildFormUrl(ids: string, mode: ScanMode): string {
    const template = mode === 'checkin' ? CHECKIN_FORM_URL : CHECKOUT_FORM_URL;
    return template.replace('{ids}', ids);
}

/**
 * Builds the checkout URL with the provided item IDs
 * @deprecated Use buildFormUrl() instead
 */
export function buildCheckoutUrl(ids: string): string {
    return buildFormUrl(ids, 'checkout');
}
