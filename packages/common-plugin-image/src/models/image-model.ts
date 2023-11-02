import { Nullable } from '@univerjs/core';

export interface IImageData {
    imageId: string;
    contentUrl: string;
}

export class ImageModel {
    private _imageShapeKey: Nullable<string>;

    constructor(private _imageData: IImageData) {}

    getImageData() {
        return this._imageData;
    }

    getUrl() {
        return this._imageData.contentUrl;
    }

    getId() {
        return this._imageData.imageId;
    }

    setKey(key: string) {
        this._imageShapeKey = key;
    }

    getKey() {
        return this._imageShapeKey;
    }

    hasRender() {
        return this._imageShapeKey != null;
    }
}
