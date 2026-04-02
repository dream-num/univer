/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IDisposable, Nullable } from '@univerjs/core';
import type { IImageShapeClipService, IShapeClipBounds, UniverRenderingContext } from '@univerjs/engine-render';
import { Disposable, toDisposable } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';

export const IMAGE_CLIP_SHAPE_PICKER_COMPONENT = 'sheet.image-clip.shape.picker.component';

/**
 * Delegate function type for building a shape clip path.
 * The function should call ctx.beginPath(), build the shape outline path, and call ctx.clip().
 * Coordinate system: (0,0) is at the top-left of the shape area.
 * @returns The actual bounding rect of the clip region, or false if no clip was built
 */
export type ImageShapeClipDelegate = (ctx: UniverRenderingContext, prstGeom: string, width: number, height: number, adjustValues?: Nullable<Record<string, number>>) => IShapeClipBounds | false;

/**
 * Bridge service that enables shape-based image clipping.
 * This service lives in the open-source drawing-ui package and delegates
 * to a registered clip implementation (provided by pro engine-shape package).
 *
 * When no delegate is registered, applyShapeClip returns false and images render normally without shape clipping.
 */
export class DrawingImageClipService extends Disposable implements IImageShapeClipService {
    private _clipDelegate: Nullable<ImageShapeClipDelegate> = null;
    private readonly _canUseShapeClip$ = new BehaviorSubject<boolean>(false);
    readonly canUseShapeClip$ = this._canUseShapeClip$.asObservable();

    constructor() {
        super();
    }

    setCanUseShapeClip(canUse: boolean) {
        this._canUseShapeClip$.next(canUse);
    }

    /**
     * Register a clip delegate that knows how to build shape clip paths.
     * Typically called by the pro-side plugin with a ShapeModel-based implementation.
     * @returns IDisposable to unregister the delegate
     */
    registerClipDelegate(delegate: ImageShapeClipDelegate): IDisposable {
        this._clipDelegate = delegate;
        return toDisposable(() => {
            if (this._clipDelegate === delegate) {
                this._clipDelegate = null;
            }
        });
    }

    applyShapeClip(ctx: UniverRenderingContext, prstGeom: string, width: number, height: number, adjustValues?: Nullable<Record<string, number>>): IShapeClipBounds | false {
        if (this._clipDelegate) {
            return this._clipDelegate(ctx, prstGeom, width, height, adjustValues);
        }
        return false;
    }

    override dispose(): void {
        this._clipDelegate = null;
        this._canUseShapeClip$.complete();
        super.dispose();
    }
}
