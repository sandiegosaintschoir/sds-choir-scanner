export class ChoirItem {
    constructor(
        public itemId: string,
        public name: string
    ) { }

    public encodeAsString(): string {
        return JSON.stringify({
            itemId: this.itemId,
            name: this.name
        });
    }

    public static decodeFromString(str: string): ChoirItem {
        const obj = JSON.parse(str);
        if (obj && 'itemId' in obj && 'name' in obj) {
            return new ChoirItem(obj.itemId, obj.name);
        } else {
            throw new Error('String not formatted correctly');
        }
    }
}
