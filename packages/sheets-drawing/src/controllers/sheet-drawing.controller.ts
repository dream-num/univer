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

import type { Workbook } from '@univerjs/core';
import type { IDrawingJsonUndo1, IDrawingSubunitMap } from '@univerjs/drawing';
import type { ICopySheetCommandInterceptorParams, IRemoveSheetCommandParams } from '@univerjs/sheets';
import type { ISheetDrawing } from '../services/sheet-drawing.service';
import { Disposable, ICommandService, Inject, IResourceManagerService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { getOrCreateDrawingCopyPlan, IDrawingManagerService } from '@univerjs/drawing';
import { CopySheetCommand, RemoveSheetCommand, SheetInterceptorService } from '@univerjs/sheets';
import { InsertSheetDrawingCommand } from '../commands/commands/insert-sheet-drawing.command';
import { RemoveSheetDrawingCommand } from '../commands/commands/remove-sheet-drawing.command';
import { SetDrawingArrangeCommand } from '../commands/commands/set-drawing-arrange.command';
import { SetSheetDrawingCommand } from '../commands/commands/set-sheet-drawing.command';
import { DrawingApplyType, SetDrawingApplyMutation } from '../commands/mutations/set-drawing-apply.mutation';
import { ClearSheetDrawingTransformerOperation } from '../commands/operations/clear-drawing-transformer.operation';
import { ISheetDrawingService } from '../services/sheet-drawing.service';

export const SHEET_DRAWING_PLUGIN = 'SHEET_DRAWING_PLUGIN';

function getDrawingsInOrder(drawingData: Record<string, ISheetDrawing>, drawingOrder: string[]): ISheetDrawing[] {
    const visited = new Set<string>();
    const drawings: ISheetDrawing[] = [];

    drawingOrder.forEach((drawingId) => {
        const drawing = drawingData[drawingId];
        if (drawing) {
            visited.add(drawingId);
            drawings.push(drawing);
        }
    });

    Object.values(drawingData).forEach((drawing) => {
        if (!visited.has(drawing.drawingId)) {
            drawings.push(drawing);
        }
    });

    return drawings;
}

export class SheetsDrawingLoadController extends Disposable {
    constructor(
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @ISheetDrawingService private readonly _sheetDrawingService: ISheetDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IResourceManagerService private _resourceManagerService: IResourceManagerService
    ) {
        super();

        this._initCommands();
        this._initSnapshot();
        this._initSheetChange();

        this.disposeWithMe(this._commandService.registerCommand(SetDrawingApplyMutation));
    }

    private _initCommands() {
        [
            SetSheetDrawingCommand,
            InsertSheetDrawingCommand,
            RemoveSheetDrawingCommand,
            SetDrawingArrangeCommand,
            ClearSheetDrawingTransformerOperation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _initSnapshot() {
        const toJson = (unitId: string, model?: IDrawingSubunitMap<ISheetDrawing>) => {
            const map = model || this._sheetDrawingService.getDrawingDataForUnit(unitId);
            if (map) {
                return JSON.stringify(map);
            }

            return '';
        };

        const parseJson = (json: string): IDrawingSubunitMap<ISheetDrawing> => {
            if (!json) {
                return {};
            }

            try {
                return JSON.parse(json);
            } catch {
                return {};
            }
        };

        this.disposeWithMe(
            this._resourceManagerService.registerPluginResource<IDrawingSubunitMap<ISheetDrawing>>({
                pluginName: SHEET_DRAWING_PLUGIN,
                businesses: [UniverInstanceType.UNIVER_SHEET],
                toJson: (unitId, model) => toJson(unitId, model),
                parseJson: (json) => parseJson(json),
                onUnLoad: (unitId) => {
                    this._sheetDrawingService.removeDrawingDataForUnit(unitId);
                    this._drawingManagerService.removeDrawingDataForUnit(unitId);
                },
                onLoad: (unitId, value) => {
                    this._sheetDrawingService.registerDrawingData(unitId, value);
                    this._drawingManagerService.registerDrawingData(unitId, value);
                },
            })
        );
    }

    // eslint-disable-next-line max-lines-per-function
    private _initSheetChange() {
        this.disposeWithMe(
            this._sheetInterceptorService.interceptCommand({
                // eslint-disable-next-line max-lines-per-function
                getMutations: (commandInfo) => {
                    if (commandInfo.id === RemoveSheetCommand.id) {
                        const params = commandInfo.params as IRemoveSheetCommandParams;
                        const unitId = params.unitId || this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
                        const subUnitId = params.subUnitId || this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()?.getSheetId();

                        if (!unitId || !subUnitId) {
                            return { redos: [], undos: [] };
                        }

                        const drawingData = this._sheetDrawingService.getDrawingData(unitId, subUnitId);
                        const drawings = Object.values(drawingData);

                        if (drawings.length === 0) {
                            return { redos: [], undos: [] };
                        }

                        const jsonOp = this._sheetDrawingService.getBatchRemoveOp(drawings) as IDrawingJsonUndo1;
                        const { unitId: jsonOpUnitId, subUnitId: jsonOpSubUnitId, undo, redo, objects } = jsonOp;

                        if (Array.isArray(objects) && objects.length === 0) {
                            return { redos: [], undos: [] };
                        }

                        return {
                            redos: [
                                {
                                    id: SetDrawingApplyMutation.id,
                                    params: {
                                        op: redo,
                                        unitId: jsonOpUnitId,
                                        subUnitId: jsonOpSubUnitId,
                                        objects,
                                        type: DrawingApplyType.REMOVE,
                                    },
                                },
                            ],
                            undos: [
                                {
                                    id: SetDrawingApplyMutation.id,
                                    params: {
                                        op: undo,
                                        unitId: jsonOpUnitId,
                                        subUnitId: jsonOpSubUnitId,
                                        objects,
                                        type: DrawingApplyType.INSERT,
                                    },
                                },
                            ],
                        };
                    } else if (commandInfo.id === CopySheetCommand.id) {
                        const params = commandInfo.params as ICopySheetCommandInterceptorParams;
                        const { unitId, subUnitId, targetSubUnitId, copyContext } = params;

                        if (!unitId || !subUnitId || !targetSubUnitId) {
                            return { redos: [], undos: [] };
                        }

                        const drawingData = this._sheetDrawingService.getDrawingData(unitId, subUnitId);
                        const sourceDrawings = getDrawingsInOrder(drawingData, this._sheetDrawingService.getDrawingOrder(unitId, subUnitId));
                        const copyPlan = getOrCreateDrawingCopyPlan(copyContext, sourceDrawings, {
                            unitId,
                            sourceSubUnitId: subUnitId,
                            targetSubUnitId,
                        });
                        const drawings = copyPlan.drawings;

                        if (drawings.length === 0) {
                            return { redos: [], undos: [] };
                        }

                        const jsonOp = this._sheetDrawingService.getBatchAddOp(drawings) as IDrawingJsonUndo1;
                        const { unitId: jsonOpUnitId, subUnitId: jsonOpSubUnitId, undo, redo, objects } = jsonOp;

                        return {
                            redos: [
                                {
                                    id: SetDrawingApplyMutation.id,
                                    params: {
                                        op: redo,
                                        unitId: jsonOpUnitId,
                                        subUnitId: jsonOpSubUnitId,
                                        objects,
                                        type: DrawingApplyType.INSERT,
                                    },
                                },
                            ],
                            undos: [
                                {
                                    id: SetDrawingApplyMutation.id,
                                    params: {
                                        op: undo,
                                        unitId: jsonOpUnitId,
                                        subUnitId: jsonOpSubUnitId,
                                        objects,
                                        type: DrawingApplyType.REMOVE,
                                    },
                                },
                            ],
                        };
                    }
                    return { redos: [], undos: [] };
                },
            })
        );
    }
}
