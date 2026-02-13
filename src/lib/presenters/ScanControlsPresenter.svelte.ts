import type { VideoElementProvider } from '$lib/VideoElementProvider.svelte';

type ZoomCapabilities = MediaTrackCapabilities & { zoom: { min: number; max: number } };

export class ScanControlsPresenter {
    private _videoElementProvider: VideoElementProvider = $state()!;
    private _videoTrack = $derived.by(() => {
        console.log('Running video track derived');
        const srcObject = this._videoElementProvider?.videoElementRef?.videoElement?.srcObject;
        if (!srcObject) {
            console.log('srcObject undefined');
            return undefined;
        }
        if (!(srcObject instanceof MediaStream)) {
            console.log('not media stream');
            return undefined;
        }

        const videoTracks = srcObject.getVideoTracks();
        if (videoTracks.length === 0) {
            console.log('video tracks length 0');
            return undefined;
        }

        console.log('[ScanControlsPresenter] setting video track: ', JSON.stringify(videoTracks[0]));
        return videoTracks[0];
    });

    private _capabilities = $derived(this._videoTrack?.getCapabilities());

    private _supportsZoom = $derived('zoom' in (this._capabilities ?? {}));
    public get supportsZoom() {
        return this._supportsZoom;
    }

    private isZoomCapabilities(cap: MediaTrackCapabilities): cap is ZoomCapabilities {
        return (
            'zoom' in cap &&
            'min' in (cap as any).zoom &&
            'max' in (cap as any).zoom &&
            typeof (cap as any).zoom.min === 'number' &&
            typeof (cap as any).zoom.max === 'number'
        );
    }

    private _zoomCapabilities = $derived.by(() => {
        if (!this._capabilities || !this.isZoomCapabilities(this._capabilities)) {
            return undefined;
        }
        return { min: this._capabilities.zoom.min, max: this._capabilities.zoom.max };
    });
    public get zoomCapabilities() {
        return this._zoomCapabilities;
    }

    private _ready = $derived(!!this._zoomCapabilities);
    public get ready() {
        return this._ready;
    }

    constructor(videoElementProvider: VideoElementProvider) {
        this._videoElementProvider = videoElementProvider;
    }

    public setZoom(zoom: number) {
        if (!this._videoTrack)
            throw new Error('[ScanControlsPresenter.setZoom] videoTrack is not defined');
        if (!this._zoomCapabilities)
            throw new Error('[ScanControlsPresenter.setZoom] No zoom capabilities');
        if (zoom < this._zoomCapabilities.min || zoom > this._zoomCapabilities.max) {
            throw new Error('[ScanControlsPresenter.setZoom] zoom is out of min max range');
        }

        this._videoTrack.applyConstraints({ advanced: [{ zoom: zoom } as any] });
    }
}
