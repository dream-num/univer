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

import type { ICommandInfo } from '@univerjs/core';
import {
    Disposable,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    toDisposable,
} from '@univerjs/core';
import type { IWheelEvent } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SelectionManagerService } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';

import { SetZoomRatioCommand } from '../commands/commands/set-zoom-ratio.command';
import { SetZoomRatioOperation } from '../commands/operations/set-zoom-ratio.operation';
import { VIEWPORT_KEY } from '../common/keys';
import { ScrollManagerService } from '../services/scroll-manager.service';
import { ISelectionRenderService } from '../services/selection/selection-render.service';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';
import { getSheetObject } from './utils/component-tools';

interface ISetWorksheetMutationParams {
    unitId: string;
    subUnitId: string;
}

@OnLifecycle(LifecycleStages.Rendered, ZoomController)
export class ZoomController extends Disposable {
    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ISelectionRenderService
        private readonly _selectionRenderService: ISelectionRenderService,

        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @Inject(ScrollManagerService) private readonly _scrollManagerService: ScrollManagerService
    ) {
        super();

        this._initialize();
    }

    override dispose(): void {
        super.dispose();
    }

    private _initialize() {
        this._skeletonListener();
        this._commandExecutedListener();
        this._zoomEventBinding();
    }

    private _zoomEventBinding() {
        const scene = this._getSheetObject()?.scene;
        if (scene == null) {
            return;
        }

        const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        this.disposeWithMe(
            toDisposable(
                scene.onMouseWheelObserver.add((e: IWheelEvent, state) => {
                    if (!e.ctrlKey) {
                        return;
                    }

                    const deltaFactor = Math.abs(e.deltaX);
                    let ratioDelta = deltaFactor < 40 ? 0.2 : deltaFactor < 80 ? 0.4 : 0.2;
                    ratioDelta *= e.deltaY > 0 ? -1 : 1;
                    if (scene.scaleX < 1) {
                        ratioDelta /= 2;
                    }

                    const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
                    const sheet = workbook.getActiveSheet();
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
            )
        );
    }

    private _skeletonListener() {
        this.disposeWithMe(
            toDisposable(
                this._sheetSkeletonManagerService.currentSkeletonBefore$.subscribe((param) => {
                    if (param == null) {
                        return;
                    }

                    const workbook = this._currentUniverService.getCurrentUniverSheetInstance();

                    const worksheet = workbook.getActiveSheet();

                    const zoomRatio = worksheet.getZoomRatio() || 1;

                    this._updateViewZoom(zoomRatio);
                })
            )
        );
    }

    private _commandExecutedListener() {
        const updateCommandList = [SetZoomRatioOperation.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
                    const worksheet = workbook.getActiveSheet();

                    const params = command.params;
                    const { unitId, subUnitId } = params as ISetWorksheetMutationParams;
                    if (!(unitId === workbook.getUnitId() && subUnitId === worksheet.getSheetId())) {
                        return;
                    }

                    const zoomRatio = worksheet.getConfig().zoomRatio || 1;

                    this._updateViewZoom(zoomRatio);
                }
            })
        );
    }

    private _updateViewZoom(zoomRatio: number) {
        const sheetObject = this._getSheetObject();
        sheetObject?.scene.scale(zoomRatio, zoomRatio);
        sheetObject?.spreadsheet.makeForceDirty();
    }

    private _getSheetObject() {
        return getSheetObject(this._currentUniverService, this._renderManagerService);
    }
}
