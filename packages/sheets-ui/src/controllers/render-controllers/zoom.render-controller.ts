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

import type { Workbook } from '@univerjs/core';
import type { IRenderContext, IRenderModule, IWheelEvent } from '@univerjs/engine-render';
import { Disposable, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, FOCUSING_SHEET, ICommandService, IContextService, Inject, Optional } from '@univerjs/core';
import { SetZoomRatioCommand } from '../../commands/commands/set-zoom-ratio.command';
import { IEditorBridgeService } from '../../services/editor-bridge.service';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';
import { getSheetObject } from '../utils/component-tools';

export class SheetsZoomRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @IContextService private readonly _contextService: IContextService,
        @Optional(IEditorBridgeService) private readonly _editorBridgeService?: IEditorBridgeService
    ) {
        super();

        this._initSkeletonListener();
        this._initZoomEventListener();
    }

    updateZoom(worksheetId: string, zoomRatio: number): boolean {
        const worksheet = this._context.unit.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        worksheet.getConfig().zoomRatio = zoomRatio;
        if (worksheet === this._context.unit.getActiveSheet()) {
            this._updateViewZoom(zoomRatio);
        }

        return true;
    }

    private _initZoomEventListener() {
        const scene = this._getSheetObject().scene;

        this.disposeWithMe(
            scene.onMouseWheel$.subscribeEvent((e: IWheelEvent) => {
                if (!e.ctrlKey || !this._contextService.getContextValue(FOCUSING_SHEET)) {
                    return;
                }

                if (this._editorBridgeService) {
                    const state = this._editorBridgeService.isVisible();
                    if ((state.unitId === this._context.unitId || state.unitId === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY) && state.visible) {
                        return;
                    }
                }

                const deltaFactor = Math.abs(e.deltaX);
                let ratioDelta = deltaFactor < 40 ? 0.2 : deltaFactor < 80 ? 0.4 : 0.2;
                ratioDelta *= e.deltaY > 0 ? -1 : 1;
                if (scene.scaleX < 1) {
                    ratioDelta /= 2;
                }

                const workbook = this._context.unit;
                const sheet = workbook.getActiveSheet();
                if (!sheet) return;

                const currentRatio = sheet.getZoomRatio();
                let nextRatio = +Number.parseFloat(`${currentRatio + ratioDelta}`).toFixed(1);
                nextRatio = nextRatio >= 4 ? 4 : nextRatio <= 0.1 ? 0.1 : nextRatio;

                this._commandService.executeCommand(SetZoomRatioCommand.id, {
                    zoomRatio: Math.round(nextRatio * 10) / 10,
                    unitId: workbook.getUnitId(),
                    subUnitId: sheet.getSheetId(),
                });

                e.preventDefault();
            })
        );
    }

    private _initSkeletonListener() {
        this.disposeWithMe(this._sheetSkeletonManagerService.currentSkeletonBefore$.subscribe((param) => {
            if (param == null) {
                return;
            }

            const workbook = this._context.unit;
            const worksheet = workbook.getActiveSheet();
            if (!worksheet) return;

            const zoomRatio = worksheet.getZoomRatio() || 1;
            this._updateViewZoom(zoomRatio);
        }));
    }

    /**
     * Zoom scene, resize viewport and then setScrollInfo
     * @param zoomRatio
     */
    private _updateViewZoom(zoomRatio: number) {
        const sheetObject = this._getSheetObject();
        sheetObject?.scene.scale(zoomRatio, zoomRatio);
        sheetObject?.spreadsheet.makeForceDirty();
    }

    private _getSheetObject() {
        return getSheetObject(this._context.unit, this._context)!;
    }
}
