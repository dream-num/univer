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

import type { Nullable, Workbook } from '@univerjs/core';
import { IUniverInstanceService, RxDisposable, UniverInstanceType } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ContextMenuPosition, IContextMenuService } from '@univerjs/ui';

export class DrawingContextMenuController extends RxDisposable {
    constructor(
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IContextMenuService private readonly _contextMenuService: IContextMenuService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET).forEach((workbook) => this._contextMenuListener(workbook));
    }

    private _contextMenuListener(workbook: Nullable<Workbook>) {
        if (!workbook) {
            return;
        }

        const scene = this._renderManagerService.getRenderById(workbook.getUnitId())?.scene;
        if (!scene) {
            return;
        }

        const transformer = scene.getTransformerByCreate();
        if (!transformer) {
            return;
        }

        this.disposeWithMe(transformer.changeEnd$.subscribe((params) => {
            const { event } = params;
            if (event.button !== 2) return;

            const selectedObjects = transformer.getSelectedObjectMap();
            if (selectedObjects.size === 0) return;

            for (const object of selectedObjects.values()) {
                const oKey = object.oKey;
                const drawingParam = this._drawingManagerService.getDrawingOKey(oKey);

                if (!drawingParam) return;
            }

            this._contextMenuService.triggerContextMenu(event, ContextMenuPosition.DRAWING);
        }));
    }
}
