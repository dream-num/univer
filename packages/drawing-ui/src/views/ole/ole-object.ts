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

import type { IImageProps, IViewportInfo, UniverRenderingContext } from '@univerjs/engine-render';
import { Image } from '@univerjs/engine-render';
import type { OleCanvasRenderer } from './ole-canvas-renderer';

/** OLE content is drawn as paths and text; Image supplies only geometry, clipping and hit testing. */
export class OleObject extends Image {
    private _renderer?: OleCanvasRenderer;

    constructor(id: string, config: IImageProps) {
        super(id, { ...config, image: undefined, url: undefined });
        this.transformerConfig = { ...this.transformerConfig, rotateEnabled: false };
    }

    setRenderer(renderer: OleCanvasRenderer): void {
        this._renderer = renderer;
        this.makeDirty(true);
    }

    protected override _draw(ctx: UniverRenderingContext, _bounds?: IViewportInfo, renderWidth?: number, renderHeight?: number): void {
        this._renderer?.draw(ctx, renderWidth ?? this.width, renderHeight ?? this.height);
    }

    override dispose(): void {
        this._renderer = undefined;
        super.dispose();
    }
}
