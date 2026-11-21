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

import type { DrawingTypeEnum, IDrawingParam, Nullable, Workbook } from '@univerjs/core';
import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY, IUniverInstanceService, Optional, RxDisposable, UniverInstanceType } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ContextMenuPosition, ContextMenuShortcutService, IContextMenuService } from '@univerjs/ui';
import { IDrawingContextMenuService } from '../services/drawing-context-menu.service';

export class DrawingContextMenuController extends RxDisposable {
    constructor(
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IContextMenuService private readonly _contextMenuService: IContextMenuService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IDrawingContextMenuService private readonly _drawingContextMenuService: IDrawingContextMenuService,
        @Optional(ContextMenuShortcutService) shortcutService?: ContextMenuShortcutService
    ) {
        super();

        this._init();
        if (shortcutService) {
            this.disposeWithMe(shortcutService.register((target) => {
                const unit = this._univerInstanceService.getFocusedUnit();
                if (unit?.type !== UniverInstanceType.UNIVER_SHEET || this._contextMenuService.disabled) {
                    return;
                }
                const render = this._renderManagerService.getRenderUnitById(unit.getUnitId());
                if (!render || (target !== render.engine.getCanvasElement() && target.id !== `__editor_${DOCS_NORMAL_EDITOR_UNIT_ID_KEY}`)) {
                    return;
                }
                const transformer = render.scene.getTransformer();
                const position = transformer && this._getSelectedMenuPosition(transformer.getSelectedObjectMap().values());
                if (!position) {
                    return;
                }
                return (event) => {
                    this._contextMenuService.triggerContextMenu(event, position, { autoFocus: true, unitId: unit.getUnitId() });
                    return true;
                };
            }, 100));
        }
    }

    private _init(): void {
        this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET).forEach((workbook) => this._contextMenuListener(workbook));
    }

    private _contextMenuListener(workbook: Nullable<Workbook>) {
        if (!workbook) {
            return;
        }

        const scene = this._renderManagerService.getRenderUnitById(workbook.getUnitId())?.scene;
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

            const position = this._getSelectedMenuPosition(transformer.getSelectedObjectMap().values());
            if (position) {
                this._contextMenuService.triggerContextMenu(event, position);
            }
        }));
    }

    private _getSelectedMenuPosition(objects: Iterable<{ oKey: string }>): string | undefined {
        const drawings: IDrawingParam[] = [];
        for (const object of objects) {
            const drawing = this._drawingManagerService.getDrawingOKey(object.oKey);
            if (!drawing) {
                return;
            }
            drawings.push(drawing);
        }
        if (!drawings.length) {
            return;
        }

        if (drawings.length !== 1) {
            return ContextMenuPosition.DRAWING;
        }

        const [drawing] = drawings;

        return this._drawingContextMenuService.getContextMenuPosition({
            unitId: drawing.unitId,
            subUnitId: drawing.subUnitId,
            drawingId: drawing.drawingId,
            drawingType: drawing.drawingType as DrawingTypeEnum,
            drawing,
        }) ?? ContextMenuPosition.DRAWING;
    }
}
