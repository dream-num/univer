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

import type { IColAutoWidthInfo, IRange, Workbook } from '@univerjs/core';
import type { RenderManagerService } from '@univerjs/engine-render';
import type {
    ISetStyleCommandParams,
    ISetWorksheetColAutoWidthMutationParams,
    ISetWorksheetColIsAutoWidthMutationParams,
} from '@univerjs/sheets';
import { Disposable, Inject, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import {
    SetStyleCommand,
    SetWorksheetColAutoWidthMutation,
    SetWorksheetColAutoWidthMutationFactory,
    SetWorksheetColIsAutoWidthCommand,
    SheetInterceptorService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

export const AFFECT_LAYOUT_STYLES = ['ff', 'fs', 'tr', 'tb'];

export class AutoWidthController extends Disposable {
    constructor(
        @IRenderManagerService private readonly _renderManagerService: RenderManagerService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._initialize();
    }

    getUndoRedoParamsOfColWidth(ranges: IRange[]) {
        const { _univerInstanceService: univerInstanceService } = this;

        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();

        const sheetSkeletonService = this._renderManagerService.getRenderById(unitId)!.with<SheetSkeletonManagerService>(SheetSkeletonManagerService);
        if (!subUnitId || !sheetSkeletonService.getCurrent()) {
            return {
                redos: [],
                undos: [],
            };
        }
        const { skeleton } = sheetSkeletonService.getCurrent()!;
        const colsAutoWidthInfo: IColAutoWidthInfo[] = skeleton.calculateAutoWidthInRange(ranges);

        const redoParams: ISetWorksheetColAutoWidthMutationParams = {
            subUnitId,
            unitId,
            colsAutoWidthInfo,
        };
        const undoParams: ISetWorksheetColAutoWidthMutationParams = SetWorksheetColAutoWidthMutationFactory(redoParams, worksheet);
        return {
            undos: [
                {
                    id: SetWorksheetColAutoWidthMutation.id,
                    params: undoParams,
                },
            ],
            redos: [
                {
                    id: SetWorksheetColAutoWidthMutation.id,
                    params: redoParams,
                },
            ],
        };
    }

    private _initialize() {
        const { _sheetInterceptorService: sheetInterceptorService, _selectionManagerService: selectionManagerService } =
            this;

        // for intercept 'sheet.command.set-col-is-auto-width' command.
        this.disposeWithMe(sheetInterceptorService.interceptCommand({
            getMutations: (command: { id: string; params: ISetWorksheetColIsAutoWidthMutationParams }) => {
                if (command.id !== SetWorksheetColIsAutoWidthCommand.id) {
                    return {
                        redos: [],
                        undos: [],
                    };
                }

                return this.getUndoRedoParamsOfColWidth(command.params.ranges);
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

                return this.getUndoRedoParamsOfColWidth(selections);
            },
        }));
    }
}
