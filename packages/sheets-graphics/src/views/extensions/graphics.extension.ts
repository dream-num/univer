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

import type { IObjectMatrixPrimitiveType, IRange, IScale, ISelectionCellWithMergeInfo } from '@univerjs/core';
import type { IDrawInfo, SpreadsheetSkeleton, UniverRenderingContext } from '@univerjs/engine-render';
import { Range } from '@univerjs/core';
import { SheetExtension } from '@univerjs/engine-render';
import { GRAPHICS_EXTENSION_INDEX, UNIQUE_KEY } from '../../common/const';

type IGraphicsCache = IObjectMatrixPrimitiveType<ISelectionCellWithMergeInfo>;

type IGraphicsRenderer = (ctx: UniverRenderingContext, skeleton: SpreadsheetSkeleton, coordInfo: ISelectionCellWithMergeInfo) => void;
type IGraphicsRenderMap = Map<string, IGraphicsRenderer>;

export class Graphics extends SheetExtension {
    override uKey = UNIQUE_KEY;
    protected override Z_INDEX = GRAPHICS_EXTENSION_INDEX;

    private _graphicsRenderMap: IGraphicsRenderMap = new Map();

    public registerRenderer(key: string, renderer: IGraphicsRenderer) {
        this._graphicsRenderMap.set(key, renderer);
    }

    override draw(ctx: UniverRenderingContext, _parentScale: IScale, skeleton: SpreadsheetSkeleton, diffBounds: IRange[], { viewRanges }: IDrawInfo): void {
        const featureTypes = Array.from(this._graphicsRenderMap.keys());
        viewRanges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                const cellPosition = skeleton.getCellByIndexWithNoHeader(row, col);
                if (!cellPosition) {
                    return;
                }
                featureTypes.forEach((featureType) => {
                    const renderer = this._graphicsRenderMap.get(featureType);
                    renderer?.(ctx, skeleton, cellPosition);
                });
            });
        });
    }

    override dispose(): void {
        this._graphicsRenderMap.clear();
    }

    copy() {
        const newGraphics = new Graphics();
        this._graphicsRenderMap.forEach((renderer, key) => {
            newGraphics.registerRenderer(key, renderer);
        });
        return newGraphics;
    }
}
