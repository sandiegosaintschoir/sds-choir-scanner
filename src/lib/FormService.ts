import type { ChoirItem } from './ChoirItem';
import type { ScanMode } from './config';

export class FormService {
    /**
     * Google Form URL for checkout process.
     * The {ids} placeholder will be replaced with comma-separated scanned item IDs.
     */
    private CHECKOUT_FORM_URL =
        'https://docs.google.com/forms/d/e/1FAIpQLScNG-TdysxB1OLYpjFHGGTI8MrGvYVzinXAmLkkna4WOrh3-g/viewform?usp=pp_url&entry.581984049={ids}';

    /**
     * Google Form URL for checkin process.
     * The {ids} placeholder will be replaced with comma-separated scanned item IDs.
     */
    private CHECKIN_FORM_URL =
        'https://docs.google.com/forms/d/e/1FAIpQLSeN8xypbgcOrRdXC1MxAKAWWydnHWUaRf0ufhdFgG9BKIZ6Bg/viewform?usp=pp_url&entry.393802085={ids}';

    /**
     * Builds the form URL with the provided item IDs based on the mode
     */
    public buildFormUrl(items: ChoirItem[], mode: ScanMode): string {
        const template = mode === 'checkin' ? this.CHECKIN_FORM_URL : this.CHECKOUT_FORM_URL;

        let itemsFieldString = encodeURIComponent(
            items.map((item) => `${item.name} [_${item.itemId}_]`).join('\n')
        );

        return template.replace('{ids}', itemsFieldString);
    }
}
