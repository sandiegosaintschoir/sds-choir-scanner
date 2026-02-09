export class VideoElementProvider {
    public videoElementBinding = $state<HTMLVideoElement>();
    private _version = $state(0);
    private _videoElementRef = $derived({
        videoElement: this.videoElementBinding,
        version: this._version
    });
    public get videoElementRef() {
        return this._videoElementRef;
    }

    constructor() { }

    public incrementVersion() {
        this._version++;
    }
}
