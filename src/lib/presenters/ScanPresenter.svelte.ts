import QrScanner from 'qr-scanner';
import { SvelteMap } from 'svelte/reactivity';
import { BASE_PATH, HOST_NAME, type ScanMode } from '$lib/config';
import { ChoirItem } from '$lib/ChoirItem';
import { ScannedItemsStorage } from '$lib/ScannedItemsStorage.svelte';
import { FormService } from '$lib/FormService';

export class ScanPresenter {
    private scannedItemsStorage: ScannedItemsStorage;
    public get scannedItems(): SvelteMap<string, ChoirItem> {
        return this.scannedItemsStorage.scannedItems;
    }

    private _hasItems = $derived(this.scannedItems.size > 0);
    public get hasItems(): boolean {
        return this._hasItems;
    }

    public readonly maxItems = 20;

    private _submitDisabled = $derived(!this.hasItems || this.scannedItems.size > this.maxItems);
    public get submitDisabled() {
        return this._submitDisabled;
    }

    private _checkKey = $state(-1);
    public get checkKey() {
        return this._checkKey;
    }
    public incrementCheckKey() {
        this._checkKey += 1;
    }

    private _errorMessage = $state<string | null>();
    public get errorMessage() {
        return this._errorMessage;
    }
    public setErrorMessage(message: string) {
        this._errorMessage = message;
    }
    public clearErrorMessage() {
        this._errorMessage = null;
    }

    private formService = new FormService();

    private scanner: QrScanner | null = null;
    public readonly mode: ScanMode;

    constructor(initialURL: string, mode: ScanMode = 'checkout') {
        this.mode = mode;
        this.scannedItemsStorage = ScannedItemsStorage.initializeFromLocalStorage();
        // Add any initial items from the url
        const initialItems = this.validateAndExtractBarcodeData(initialURL);
        console.log(`[ScanPresenter] constructor adding initial items ${JSON.stringify(initialItems)}`);
        initialItems?.forEach((item) => this.addScannedItem(item));
    }

    public stripItemsFromUrl(url: URL): URL {
        const copy = new URL(url);
        copy.searchParams.delete('item');
        copy.searchParams.delete('name');
        return copy;
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

            const ids = itemParam
                .split(',')
                .map((id) => id.trim())
                .filter((id) => id.length > 0);

            const names = nameParam.split(',').map(decodeURIComponent);

            if (ids.length !== names.length) {
                console.error(
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
        const items = this.validateAndExtractBarcodeData(data);
        if (!items) return; // Invalid URL, silently ignore

        const newItems = items.filter((item) => !this.scannedItems.has(item.itemId));

        if (newItems.length === 0) return;

        if (this.scannedItems.size + newItems.length > this.maxItems) {
            this.setErrorMessage(`Max number of items (${this.maxItems}) has already been reached`);
            return;
        }

        console.log('[ScanPresenter] processQrCode adding items!');

        this.incrementCheckKey();
        newItems.forEach((item) => {
            this.addScannedItem(item);
        });
    }

    setup(videoElement: HTMLVideoElement): void {
        this.scanner = new QrScanner(videoElement, (result) => this.processQrCode(result.data), {
            preferredCamera: 'environment',
            onDecodeError: (error) => {
                if (typeof error === 'string' && error.toLowerCase().includes('no qr code found')) return;
                console.error(error);
            },
            // highlightCodeOutline: true,
            highlightScanRegion: true
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

    goToCheckoutOrCheckin(): void {
        const items = [...this.scannedItems.values()];
        this.scannedItemsStorage.clear();
        window.location.href = this.getCheckoutOrCheckinUrl(items);
    }

    getCheckoutOrCheckinUrl(items: ChoirItem[]): string {
        return this.formService.buildFormUrl([...items], this.mode);
    }

    getButtonText(): string {
        return this.mode === 'checkin' ? 'Check items in' : 'Check out items';
    }
}
