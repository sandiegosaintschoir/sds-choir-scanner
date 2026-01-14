import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import { ChoirItem } from './ChoirItem';

export class ScannedItemsStorage {
    private static EXPIRATION_MS = 86400000; // 1 Day = 86,400,000 ms

    public scannedItems = new SvelteMap<string, ChoirItem>();

    constructor(
        items: ChoirItem[],
        public lastUpdated: Date,
        public version: string
    ) {
        items.forEach((item) => this.addItem(item));
    }

    public encodeAsString(): string {
        return JSON.stringify({
            items: [...this.scannedItems.values()].map((item) => item.encodeAsString()),
            lastUpdated: this.lastUpdated.toISOString(),
            version: this.version
        });
    }

    private static scannedItemStorageKey(): string {
        return 'sds-choir-scanner-scanned-items-v1';
    }

    private static scannedItemStorageVersion(): string {
        return '0.0.0';
    }

    private static writeToStorage(scannedItemsStorage: ScannedItemsStorage): void {
        const encoded = scannedItemsStorage.encodeAsString();
        console.log(
            `[writeToStorage] Writing ${encoded} to storage at ${this.scannedItemStorageKey()}`
        );
        localStorage.setItem(this.scannedItemStorageKey(), scannedItemsStorage.encodeAsString());
    }

    private static createAndWriteDefault(): ScannedItemsStorage {
        const scannedItemsStorage = new ScannedItemsStorage(
            [],
            new Date(Date.now()),
            this.scannedItemStorageVersion()
        );
        this.writeToStorage(scannedItemsStorage);
        return scannedItemsStorage;
    }

    public static initializeFromLocalStorage(): ScannedItemsStorage {
        console.log(
            `[ScannedItemsStorage.initializeFromLocalStorage] Initializing from local storage...`
        );
        const storedString = localStorage.getItem(this.scannedItemStorageKey());
        console.log(
            `[ScannedItemsStorage.initializeFromLocalStorage] Found existing string: ${storedString}`
        );
        if (!storedString) {
            return this.createAndWriteDefault();
        }
        const scannedItemsStorage = this.decodeFromString(storedString);
        console.log(
            `[ScannedItemsStorage.initializeFromLocalStorage] Parsed stored string and got: ${JSON.stringify(scannedItemsStorage)}`
        );
        if (
            scannedItemsStorage.version === '0.0.0' &&
            Date.now() - scannedItemsStorage.lastUpdated.getTime() < this.EXPIRATION_MS
        ) {
            return scannedItemsStorage;
        } else {
            return this.createAndWriteDefault();
        }
    }

    public static decodeFromString(str: string): ScannedItemsStorage {
        const obj = JSON.parse(str);
        if (obj && 'items' in obj && 'lastUpdated' in obj && 'version' in obj) {
            return new ScannedItemsStorage(
                obj.items.map((item: string) => ChoirItem.decodeFromString(item)),
                new Date(obj.lastUpdated),
                obj.version
            );
        } else {
            throw new Error(`String ${str} could not be parsed as a ScannedItemsStorage`);
        }
    }

    public addItem(item: ChoirItem): void {
        console.log(`[ScannedItemsStorage.addItem] adding item ${item.encodeAsString()}`);
        this.scannedItems.set(item.itemId, item);
        ScannedItemsStorage.writeToStorage(this);
    }

    public deleteItem(item: ChoirItem): void {
        console.log(`[ScannedItemsStorage.deleteItem] Deleting item ${item.encodeAsString()}`);
        this.scannedItems.delete(item.itemId);
        ScannedItemsStorage.writeToStorage(this);
    }
}
