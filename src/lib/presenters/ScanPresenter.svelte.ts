import QrScanner from 'qr-scanner';
import { SvelteSet } from 'svelte/reactivity';
import { BASE_PATH, buildFormUrl, HOST_NAME, type ScanMode } from '$lib/config';
import { ChoirItem } from '$lib/ChoirItem';

export class ScanPresenter {
    private scanner: QrScanner | null = null;
    public scannedItems: SvelteSet<ChoirItem> = $state(new SvelteSet<ChoirItem>());
    private detected: Set<string> = new Set();
    private readonly mode: ScanMode;

    constructor(mode: ScanMode = 'checkout') {
        this.mode = mode;
    }

    private validateAndExtractBarcodeData(data: string): ChoirItem[] | null {
        try {
            const url = new URL(data);

            // Validate hostname and pathname
            if (url.hostname !== HOST_NAME || url.pathname !== BASE_PATH) {
                return null;
            }

            // Extract and parse item parameter
            const itemParam = url.searchParams.get('item');
            if (!itemParam) return null;
            const nameParam = url.searchParams.get('name');
            if (!nameParam) return null;

            // Split by comma, trim whitespace, filter empty strings
            const ids = itemParam
                .split(',')
                .map((id) => id.trim())
                .filter((id) => id.length > 0);

            const names = nameParam.split(',').map(decodeURIComponent);

            if (ids.length !== names.length) {
                throw new Error(
                    `[ScanPresenter] Tried to decode a QR code with value ${data} but the length of the ids and names params were not equal`
                );
            }

            const barcodes = ids.map((id, idx) => new ChoirItem(id, names[idx]));

            return ids.length > 0 ? barcodes : null;
        } catch {
            return null; // Invalid URL
        }
    }

    private processQrCode(data: string): void {
        // Prevent processing same URL multiple times
        if (this.detected.has(data)) return;
        this.detected.add(data);

        // Validate and extract IDs
        const items = this.validateAndExtractBarcodeData(data);
        if (!items) return; // Invalid URL, silently ignore

        // Add each new ID
        items.forEach((id) => {
            this.scannedItems.add(id);
        });
    }

    setup(videoElement: HTMLVideoElement): void {
        this.scanner = new QrScanner(videoElement, (result) => this.processQrCode(result.data), {
            preferredCamera: 'environment'
        });
        this.scanner.start();
    }

    destroy(): void {
        if (this.scanner) {
            this.scanner.destroy();
            this.scanner = null;
        }
    }

    removeScannedItem(item: ChoirItem): void {
        this.scannedItems.delete(item);
        // Note: Don't remove from detected Set - we still want to remember
        // we scanned that URL to avoid reprocessing if scanned again
    }

    getCheckoutUrl(): string {
        // const ids = [...this.scannedIds].join(',');
        // TODO: Format the checkout URL correctly
        // return buildFormUrl(ids, this.mode);
        return 'TODO: Fix me';
    }

    getButtonText(): string {
        return this.mode === 'checkin' ? 'Check items in' : 'Check out items';
    }
}
