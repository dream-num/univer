import type { Nullable } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';

export interface IImageRenderParam {
    unitId: string;
    subComponentId: string; //sheetId, pageId and so on, it has a default name in doc business
    imageId: string;
}

export interface IImageRenderService {
    dispose(): void;

    add(key: string, param: IImageRenderParam): void;

    remove(key: string): void;

    get(key: string): Nullable<IImageRenderParam>;
}

/**
 *
 */
export class ImageRenderService implements IDisposable, IImageRenderService {
    private _imageRenderInfo: Map<string, IImageRenderParam> = new Map();

    dispose(): void {
        this._imageRenderInfo.clear();
    }

    add(key: string, param: IImageRenderParam) {
        this._imageRenderInfo.set(key, param);
    }

    remove(key: string) {
        this._imageRenderInfo.delete(key);
    }

    get(key: string): Nullable<IImageRenderParam> {
        return this._imageRenderInfo.get(key);
    }
}

export const IImageRenderService = createIdentifier<IImageRenderService>('univer.plugin.image-render.service');
