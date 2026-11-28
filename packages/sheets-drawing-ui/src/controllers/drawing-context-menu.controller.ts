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
import {
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    EDITOR_ACTIVATED,
    IContextService,
    IUniverInstanceService,
    Optional,
    RxDisposable,
    SheetTypes,
    UniverInstanceType,
} from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { getTransformBoundingBox, IRenderManagerService } from '@univerjs/engine-render';
import { REF_SELECTIONS_ENABLED } from '@univerjs/sheets';
import { SheetSkeletonManagerService, transformPosition2Offset } from '@univerjs/sheets-ui';
import { ContextMenuPosition, IContextMenuService, IContextMenuShortcutService } from '@univerjs/ui';
import { IDrawingContextMenuService } from '../services/drawing-context-menu.service';

export class DrawingContextMenuController extends RxDisposable {
    constructor(
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IContextMenuService private readonly _contextMenuService: IContextMenuService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IDrawingContextMenuService private readonly _drawingContextMenuService: IDrawingContextMenuService,
        @IContextService private readonly _contextService: IContextService,
        @Optional(IContextMenuShortcutService) shortcutService?: IContextMenuShortcutService
    ) {
        super();

        this._init();
        if (shortcutService) {
            this.disposeWithMe(shortcutService.register((target) => this._resolveKeyboardMenu(target), 100));
        }
    }

    private _resolveKeyboardMenu(target: HTMLElement): (() => boolean) | undefined {
        const unit = this._univerInstanceService.getFocusedUnit();
        if (unit?.type !== UniverInstanceType.UNIVER_SHEET || this._contextMenuService.disabled) {
            return;
        }
        const worksheet = (unit as Workbook).getActiveSheet();
        if (!worksheet || worksheet.getConfig().type === SheetTypes.CHART || this._contextService.getContextValue(EDITOR_ACTIVATED)
            || this._contextService.getContextValue(REF_SELECTIONS_ENABLED)) {
            return;
        }
        const render = this._renderManagerService.getRenderUnitById(unit.getUnitId());
        if (!render || (target !== render.engine.getCanvasElement() && target.id !== `__editor_${DOCS_NORMAL_EDITOR_UNIT_ID_KEY}`)) {
            return;
        }
        const objects = render.scene.getTransformer()?.getSelectedObjectMap();
        const position = objects && this._getSelectedMenuPosition(objects.values());
        const skeleton = position && render.with(SheetSkeletonManagerService).getCurrentSkeleton();
        if (!objects || !position || !skeleton) {
            return;
        }
        return () => {
            let left = Infinity;
            let top = Infinity;
            let right = -Infinity;
            let bottom = -Infinity;
            for (const object of objects.values()) {
                const bounds = getTransformBoundingBox(object.transformerConfig?.controlStateResolver?.(object) ?? object.getState());
                left = Math.min(left, bounds.left);
                top = Math.min(top, bounds.top);
                right = Math.max(right, bounds.left + bounds.width);
                bottom = Math.max(bottom, bounds.top + bounds.height);
            }
            const point = transformPosition2Offset((left + right) / 2, (top + bottom) / 2, render.scene, skeleton, worksheet);
            const canvas = render.engine.getCanvasElement();
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.clientWidth ? rect.width / canvas.clientWidth : 1;
            const scaleY = canvas.clientHeight ? rect.height / canvas.clientHeight : 1;
            const clientX = rect.left + Math.max(0, Math.min(rect.width, point.x * scaleX));
            const clientY = rect.top + Math.max(0, Math.min(rect.height, point.y * scaleY));
            this._contextMenuService.triggerContextMenu({ clientX, clientY, stopPropagation() {} }, position, { autoFocus: true, unitId: unit.getUnitId() });
            return true;
        };
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
