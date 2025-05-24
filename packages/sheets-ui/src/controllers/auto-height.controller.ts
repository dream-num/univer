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
    ISetWorksheetColWidthMutationParams,
    ISetWorksheetRowAutoHeightMutationParams,
    ISetWorksheetRowIsAutoHeightMutationParams,
} from '@univerjs/sheets';
import { Disposable, IConfigService, Inject, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import {
    DeltaColumnWidthCommand,
    getSheetCommandTarget,
    MoveRangeCommand,
    ReorderRangeCommand,
    SetColWidthCommand,
    SetRangeValuesCommand,
    SetStyleCommand,
    SetWorksheetRowAutoHeightMutation,
    SetWorksheetRowAutoHeightMutationFactory,
    SetWorksheetRowIsAutoHeightCommand,
    SheetInterceptorService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

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

    private _getSkeleton(subUnitId?: string) {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const unitId = workbook.getUnitId();
        const sheetSkeletonService = this._renderManagerService.getRenderById(unitId)!.with<SheetSkeletonManagerService>(SheetSkeletonManagerService);
        if (!subUnitId) {
            subUnitId = workbook.getActiveSheet().getSheetId();
        }
        return sheetSkeletonService.getSkeleton(subUnitId);
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

        this.disposeWithMe(sheetInterceptorService.interceptCommand({
            getMutations: (command) => {
                if (command.id === SetRangeValuesCommand.id) {
                    const params = command.params as ISetRangeValuesRangeMutationParams;
                    return this.getUndoRedoParamsOfAutoHeight(params.range, params.subUnitId);
                }

                if (command.id === DeltaColumnWidthCommand.id) {
                    const params = command.params as ISetWorksheetColWidthMutationParams;
                    const skeleton = this._getSkeleton();

                    if (skeleton) {
                        skeleton.makeDirtyAutoHeightCacheByRange(params.ranges);
                    }

                    return this.getUndoRedoParamsOfAutoHeight(params.ranges);
                }

                if (command.id === SetColWidthCommand.id) {
                    const params = command.params as ISetWorksheetColWidthMutationParams;
                    if (params.ranges) {
                        const skeleton = this._getSkeleton(params.subUnitId);
                        if (skeleton) {
                            skeleton.makeDirtyAutoHeightCacheByRange(params.ranges);
                        }
                        return this.getUndoRedoParamsOfAutoHeight(params.ranges, params.subUnitId);
                    }
                }

                if (command.id === SetWorksheetRowIsAutoHeightCommand.id) {
                    const params = command.params as ISetWorksheetRowIsAutoHeightMutationParams;
                    return this.getUndoRedoParamsOfAutoHeight(params.ranges, params.subUnitId);
                }

                if (command.id === SetStyleCommand.id) {
                    const params = command.params as ISetStyleCommandParams<number>;
                    if (!AFFECT_LAYOUT_STYLES.includes(params?.style.type)) {
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

                    return this.getUndoRedoParamsOfAutoHeight(selections, params.subUnitId);
                }

                return {
                    redos: [],
                    undos: [],
                };
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
