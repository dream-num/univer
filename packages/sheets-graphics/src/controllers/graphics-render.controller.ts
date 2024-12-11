/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ISelectionCellWithMergeInfo } from '@univerjs/core';
import type { IRenderContext, IRenderModule, Spreadsheet, SpreadsheetSkeleton, UniverRenderingContext } from '@univerjs/engine-render';
import { Disposable } from '@univerjs/core';
import { UNIQUE_KEY } from '../common/const';
import { Graphics } from '../views/extensions/graphics.extension';

export class SheetGraphicsRenderController extends Disposable implements IRenderModule {
    private _graphicsExtensionInstance: Graphics | null = null;

    constructor(
        private readonly _context: IRenderContext
    ) {
        super();
        this._initRender();
    }

    private _initRender() {
        const spreadsheet = this._context.mainComponent as Spreadsheet;
        if (spreadsheet && !spreadsheet.getExtensionByKey(UNIQUE_KEY)) {
            this._graphicsExtensionInstance = new Graphics();
            spreadsheet.register(this._graphicsExtensionInstance);
        }
    }

    registerRenderer(key: string, renderer: (ctx: UniverRenderingContext, skeleton: SpreadsheetSkeleton, coordInfo: ISelectionCellWithMergeInfo) => void) {
        this._graphicsExtensionInstance?.registerRenderer(key, renderer);
    }
}
