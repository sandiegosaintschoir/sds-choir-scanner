import QrScanner from 'qr-scanner';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import { BASE_PATH, HOST_NAME, type ScanMode } from '$lib/config';
import { ChoirItem } from '$lib/ChoirItem';
import { ScannedItemsStorage } from '$lib/ScannedItemsStorage.svelte';
import { FormService } from '$lib/FormService';

export class ScanPresenter {
    private scannedItemsStorage: ScannedItemsStorage;
    public get scannedItems(): SvelteMap<string, ChoirItem> {
        return this.scannedItemsStorage.scannedItems;
    }

    private formService = new FormService();

    private scanner: QrScanner | null = null;
    // TODO: Maybe we should track detected item ids so that we can skip "adding" duplicates
    // to the set... however there is not a huge benefit because we have to decode them anyway
    // to see which items have been detected, and items can be scanned in bulk through the same
    // QR code, but removed individually
    // private detected: Set<string> = new Set();
    private readonly mode: ScanMode;

    constructor(initialURL: string, mode: ScanMode = 'checkout') {
        this.mode = mode;
        this.scannedItemsStorage = ScannedItemsStorage.initializeFromLocalStorage();
        // Add any initial items from the url
        const initialItems = this.validateAndExtractBarcodeData(initialURL);
        initialItems?.forEach((item) => this.addScannedItem(item));
    }

    private validateAndExtractBarcodeData(data: string): ChoirItem[] | null {
        try {
            console.log(`[ScanPresenter.validateAndExtractBarcodeData] Validating url: ${data}`);
            const url = new URL(data);

            // Validate hostname and pathname
            // TODO: Re-enable in production and/or set up a way for this to work in dev also
            // if (url.hostname !== HOST_NAME || url.pathname !== BASE_PATH) {
            //     return null;
            // }

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
                console.log(
                    `[ScanPresenter] Tried to decode a QR code with value ${data} but the length of the ids and names params were not equal`
                );
                return null;
            }

            const barcodes = ids.map((id, idx) => new ChoirItem(id, names[idx]));

            return ids.length > 0 ? barcodes : null;
        } catch {
            return null; // Invalid URL
        }
    }

    private processQrCode(data: string): void {
        // Validate and extract IDs
        const items = this.validateAndExtractBarcodeData(data);
        if (!items) return; // Invalid URL, silently ignore

        // Add each new ID
        items.forEach((item) => {
            this.addScannedItem(item);
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

    addScannedItem(item: ChoirItem): void {
        this.scannedItemsStorage.addItem(item);
    }

    removeScannedItem(item: ChoirItem): void {
        this.scannedItemsStorage.deleteItem(item);
    }

    getCheckoutUrl(): string {
        return this.formService.buildFormUrl([...this.scannedItems.values()], this.mode);
    }

    getButtonText(): string {
        return this.mode === 'checkin' ? 'Check items in' : 'Check out items';
    }
}
