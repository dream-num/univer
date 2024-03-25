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

import type { Worksheet } from '@univerjs/core';
import { Disposable, DisposableCollection, ICommandService, IUniverInstanceService, Rectangle } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { BaseObject, IBoundRectNoAngle, IRender, SpreadsheetSkeleton, Viewport } from '@univerjs/engine-render';
import { ICanvasPopupService } from '@univerjs/ui';
import type { IDisposable } from '@wendellhu/redi';
import { Inject } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';
import type { IRemoveColMutationParams, IRemoveRowsMutationParams, ISetWorksheetRowAutoHeightMutationParams } from '@univerjs/sheets';
import { COMMAND_LISTENER_SKELETON_CHANGE, RemoveColMutation, RemoveRowMutation, SetWorksheetRowAutoHeightMutation } from '@univerjs/sheets';
import { getViewportByCell, transformBound2OffsetBound } from '../common/utils';
import { SetScrollOperation } from '../commands/operations/scroll.operation';
import { SetZoomRatioOperation } from '..';
import { SheetSkeletonManagerService } from './sheet-skeleton-manager.service';

interface ICanvasPopup {
    componentKey: string;
    mask?: boolean;
    onClickOutside?: (e: MouseEvent) => void;
    direction?: 'vertical' | 'horizontal';
    offset?: [number, number];
}

export class SheetCanvasPopManagerService extends Disposable {
    constructor(
        @Inject(ICanvasPopupService) private readonly _globalPopupManagerService: ICanvasPopupService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
    }

    private _calcCellPosition(
        row: number,
        col: number,
        currentRender: IRender,
        skeleton: SpreadsheetSkeleton,
        activeViewport: Viewport
    ) {
        const { scene, engine } = currentRender;

        const cellInfo = skeleton.getCellByIndex(row, col);

        const { scaleX, scaleY } = scene.getAncestorScale();

        const scrollXY = {
            x: activeViewport.actualScrollX,
            y: activeViewport.actualScrollY,
        };

        const bounding = engine.getCanvasElement().getBoundingClientRect();

        const position: IBoundRectNoAngle = {
            left: ((cellInfo.startX - scrollXY.x) * scaleX),
            right: (cellInfo.endX - scrollXY.x) * scaleX,
            top: ((cellInfo.startY - scrollXY.y) * scaleY) + bounding.top,
            bottom: ((cellInfo.endY - scrollXY.y) * scaleY) + bounding.top,
        };

        return position;
    }

    private _createCellPositionObserver(
        row: number,
        col: number,
        currentRender: IRender,
        skeleton: SpreadsheetSkeleton,
        activeViewport: Viewport
    ) {
        const position = this._calcCellPosition(row, col, currentRender, skeleton, activeViewport);
        const position$ = new BehaviorSubject(position);

        const disposable = new DisposableCollection();
        disposable.add(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetWorksheetRowAutoHeightMutation.id) {
                const params = commandInfo.params as ISetWorksheetRowAutoHeightMutationParams;
                if (params.rowsAutoHeightInfo.findIndex((item) => item.row === row) > -1) {
                    position$.next(this._calcCellPosition(row, col, currentRender, skeleton, activeViewport));
                    return;
                }
            }

            if (
                COMMAND_LISTENER_SKELETON_CHANGE.indexOf(commandInfo.id) > -1 ||
                commandInfo.id === SetScrollOperation.id ||
                commandInfo.id === SetZoomRatioOperation.id
            ) {
                position$.next(this._calcCellPosition(row, col, currentRender, skeleton, activeViewport));
            }
        }));

        return {
            position$,
            disposable,
            position,
        };
    }

    private _createObjectPositionObserver(
        targetObject: BaseObject,
        currentRender: IRender,
        skeleton: SpreadsheetSkeleton,
        worksheet: Worksheet
    ) {
        const calc = () => {
            const { scene } = currentRender;
            const { left, top, width, height } = targetObject;

            const bound: IBoundRectNoAngle = {
                left,
                right: left + width,
                top,
                bottom: top + height,
            };

            const offsetBound = transformBound2OffsetBound(bound, scene, skeleton, worksheet);
            const bounding = currentRender.engine.getCanvasElement().getBoundingClientRect();

            const position = {
                left: offsetBound.left,
                right: offsetBound.right,
                top: offsetBound.top + bounding.top,
                bottom: offsetBound.bottom + bounding.top,
            };
            return position;
        };

        const position = calc();
        const position$ = new BehaviorSubject(position);
        const disposable = new DisposableCollection();

        disposable.add(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetScrollOperation.id || commandInfo.id === SetZoomRatioOperation.id) {
                position$.next(calc());
            }
        }));

        return {
            position,
            position$,
            disposable,
        };
    }

    /**
     * attach a popup to canvas object
     * @param targetObject target canvas object
     * @param popup popup item
     * @returns disposable
     */
    attachPopupToObject(targetObject: BaseObject, popup: ICanvasPopup): IDisposable {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const skeleton = this._sheetSkeletonManagerService.getOrCreateSkeleton({
            unitId,
            sheetId: subUnitId,
        });
        const currentRender = this._renderManagerService.getRenderById(unitId);

        if (!currentRender || !skeleton) {
            return {
                dispose: () => { },
            };
        }

        const { position, position$, disposable } = this._createObjectPositionObserver(targetObject, currentRender, skeleton, worksheet);

        const id = this._globalPopupManagerService.addPopup({
            ...popup,
            unitId,
            subUnitId,
            anchorRect: position,
            anchorRect$: position$,
        });

        return {
            dispose: () => {
                this._globalPopupManagerService.removePopup(id);
                position$.complete();
                disposable.dispose();
            },
        };
    }

    /**
     * attach a popup to given cell
     * @param row cell row index
     * @param col cell column index
     * @param popup popup item
     * @param viewport target viewport
     * @returns disposable
     */
    attachPopupToCell(row: number, col: number, popup: ICanvasPopup, viewport?: Viewport) {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const skeleton = this._sheetSkeletonManagerService.getOrCreateSkeleton({
            unitId,
            sheetId: subUnitId,
        });
        const currentRender = this._renderManagerService.getRenderById(unitId);

        if (!currentRender || !skeleton) {
            return {
                dispose: () => { },
            };
        }

        const activeViewport = viewport ?? getViewportByCell(row, col, currentRender.scene, worksheet);

        if (!activeViewport) {
            return {
                dispose: () => { },
            };
        }

        const { position, position$, disposable } = this._createCellPositionObserver(row, col, currentRender, skeleton, activeViewport);

        const id = this._globalPopupManagerService.addPopup({
            ...popup,
            unitId,
            subUnitId,
            anchorRect: position,
            anchorRect$: position$,
        });

        const onDispose = () => {
            this._globalPopupManagerService.removePopup(id);
            disposable.dispose();
            position$.complete();
        };

        const commandDisposable = this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === RemoveColMutation.id) {
                const params = commandInfo.params as IRemoveColMutationParams;

                if (Rectangle.contains(
                    params.range,
                    {
                        startColumn: col,
                        endColumn: col,
                        startRow: row,
                        endRow: row,
                    }
                )) {
                    onDispose();
                }
            }

            if (commandInfo.id === RemoveRowMutation.id) {
                const params = commandInfo.params as IRemoveRowsMutationParams;
                if (Rectangle.contains(
                    params.range,
                    {
                        startColumn: col,
                        endColumn: col,
                        startRow: row,
                        endRow: row,
                    }
                )) {
                    onDispose();
                }
            }
        });

        return {
            dispose: () => {
                commandDisposable.dispose();
                onDispose();
            },
        };
    }
}
