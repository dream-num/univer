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

import type { IRange, Workbook } from '@univerjs/core';
import type { RenderManagerService } from '@univerjs/engine-render';
import type {
    IMoveRangeCommandParams,
    IReorderRangeMutationParams,
    ISetRangeValuesRangeMutationParams,
    ISetStyleCommandParams,
    ISetWorksheetRowAutoHeightMutationParams,
    ISetWorksheetRowIsAutoHeightMutationParams,
} from '@univerjs/sheets';
import type { IUniverSheetsUIConfig } from './config.schema';
import { Disposable, IConfigService, Inject, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import {
    getSheetCommandTarget,
    MoveRangeCommand,
    ReorderRangeCommand,
    SetRangeValuesCommand,
    SetStyleCommand,
    SetWorksheetRowAutoHeightMutation,
    SetWorksheetRowAutoHeightMutationFactory,
    SetWorksheetRowIsAutoHeightCommand,
    SheetInterceptorService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';
import { SHEETS_UI_PLUGIN_CONFIG_KEY } from './config.schema';

export const AFFECT_LAYOUT_STYLES = ['ff', 'fs', 'tr', 'tb'];

export class AutoHeightController extends Disposable {
    constructor(
        @IRenderManagerService private readonly _renderManagerService: RenderManagerService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();
        this._initialize();
    }

    private _getRangesScope(ranges: IRange[]): number {
        let start: number | undefined;
        let end: number | undefined;
        for (const { startRow, endRow } of ranges) {
            start = start === undefined ? startRow : Math.min(start, startRow);
            end = end === undefined ? endRow : Math.max(end, endRow);
        }
        return (end as number) - (start as number) + 1;
    }

    getUndoRedoParamsOfAutoHeight(ranges: IRange[], subUnitIdParam?: string): { redos: any[]; undos: any[] } {
        const { _univerInstanceService: univerInstanceService, _configService: configService } = this;
        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;

        // Better NOT use `getActiveWorksheet` method, because users may manipulate another worksheet in active sheet.
        const unitId = workbook.getUnitId();
        let worksheet = workbook.getActiveSheet();
        let subUnitId = worksheet.getSheetId();
        if (subUnitIdParam) {
            const target = getSheetCommandTarget(univerInstanceService, { unitId, subUnitId: subUnitIdParam });
            if (target) {
                worksheet = target.worksheet;
                subUnitId = worksheet.getSheetId();
            }
        }
        const sheetSkeletonService = this._renderManagerService.getRenderById(unitId)!.with<SheetSkeletonManagerService>(SheetSkeletonManagerService);

        // Better NOT use `getCurrentParam` method, because users may manipulate another worksheet in active sheet.
        // const { skeleton } = sheetSkeletonService.getCurrentParam()!;
        const skeleton = sheetSkeletonService.ensureSkeleton(subUnitId);
        if (!skeleton) {
            return {
                redos: [],
                undos: [],
            };
        };

        const config = configService.getConfig<IUniverSheetsUIConfig>(SHEETS_UI_PLUGIN_CONFIG_KEY);
        let rangeList = ranges;
        if (!Array.isArray(ranges)) {
            // TODO: @weird94 after we resolve the performance issue of auto hight, we can remove this code.
            // The code "const params = command.params as ISetRangeValuesRangeMutationParams;" of _initialize() method may make IRange as IRange[]. so need adjust here.
            if (ranges && (ranges as IRange).startRow !== undefined && (ranges as IRange).startRow !== undefined) {
                rangeList = [ranges];
            } else {
                rangeList = [];
            }
        }
        const count = this._getRangesScope(rangeList);
        const maxLimit = config?.maxAutoHeightCount ?? 1000;
        if (maxLimit < count) {
            return {
                redos: [],
                undos: [],
            };
        }

        const rowsAutoHeightInfo = skeleton.calculateAutoHeightInRange(ranges);

        const redoParams: ISetWorksheetRowAutoHeightMutationParams = {
            subUnitId,
            unitId,
            rowsAutoHeightInfo,
        };
        const undoParams: ISetWorksheetRowAutoHeightMutationParams = SetWorksheetRowAutoHeightMutationFactory(redoParams, worksheet);
        return {
            undos: [
                {
                    id: SetWorksheetRowAutoHeightMutation.id,
                    params: undoParams,
                },
            ],
            redos: [
                {
                    id: SetWorksheetRowAutoHeightMutation.id,
                    params: redoParams,
                },
            ],
        };
    }

    // eslint-disable-next-line max-lines-per-function
    private _initialize() {
        const { _sheetInterceptorService: sheetInterceptorService, _selectionManagerService: selectionManagerService } =
            this;
        // for intercept'SetRangeValuesCommand' command.
        this.disposeWithMe(sheetInterceptorService.interceptCommand({
            getMutations: (command) => {
                if (command.id === SetRangeValuesCommand.id) {
                    const params = command.params as ISetRangeValuesRangeMutationParams;
                    return this.getUndoRedoParamsOfAutoHeight(params.range, params.subUnitId);
                }

                return {
                    redos: [],
                    undos: [],
                };
            },
        }));

        // for intercept 'sheet.command.set-row-is-auto-height' command.
        this.disposeWithMe(sheetInterceptorService.interceptCommand({
            getMutations: (command: { id: string; params: ISetWorksheetRowIsAutoHeightMutationParams }) => {
                if (command.id !== SetWorksheetRowIsAutoHeightCommand.id) {
                    return {
                        redos: [],
                        undos: [],
                    };
                }

                return this.getUndoRedoParamsOfAutoHeight(command.params.ranges, command.params.subUnitId);
            },
        }));

        // for intercept set style command.
        this.disposeWithMe(sheetInterceptorService.interceptCommand({
            getMutations: (command: { id: string; params: ISetStyleCommandParams<number> }) => {
                if (command.id !== SetStyleCommand.id) {
                    return {
                        redos: [],
                        undos: [],
                    };
                }

                // TODO: @jocs, All styles that affect the size of the cell,
                // I don't know if the enumeration is complete, to be added in the future.

                if (!AFFECT_LAYOUT_STYLES.includes(command.params?.style.type)) {
                    return {
                        redos: [],
                        undos: [],
                    };
                }

                const selections = selectionManagerService.getCurrentSelections()?.map((s) => s.range);

                if (!selections?.length) {
                    return {
                        redos: [],
                        undos: [],
                    };
                }

                return this.getUndoRedoParamsOfAutoHeight(selections, command.params.subUnitId);
            },
        }));

        this.disposeWithMe(sheetInterceptorService.interceptAfterCommand({
            getMutations: (command) => {
                if (command.id === MoveRangeCommand.id) {
                    const params = command.params as IMoveRangeCommandParams;
                    return this.getUndoRedoParamsOfAutoHeight([params.fromRange, params.toRange]);
                }

                if (command.id === ReorderRangeCommand.id) {
                    const params = command.params as IReorderRangeMutationParams;
                    return this.getUndoRedoParamsOfAutoHeight([params.range]);
                }

                return {
                    redos: [],
                    undos: [],
                };
            },
        }));
    }
}
