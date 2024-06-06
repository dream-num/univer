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

import type { IRange, Workbook } from '@univerjs/core';
import { Disposable, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import type {
    ISetRangeValuesRangeMutationParams,
    ISetStyleCommandParams,
    ISetWorksheetRowAutoHeightMutationParams,
    ISetWorksheetRowIsAutoHeightMutationParams,
} from '@univerjs/sheets';
import {
    SelectionManagerService,
    SetRangeValuesCommand,
    SetStyleCommand,
    SetWorksheetRowAutoHeightMutation,
    SetWorksheetRowAutoHeightMutationFactory,
    SetWorksheetRowIsAutoHeightCommand,
    SheetInterceptorService,
} from '@univerjs/sheets';
import { Inject, Injector } from '@wendellhu/redi';
import type { RenderManagerService } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

@OnLifecycle(LifecycleStages.Ready, AutoHeightController)
export class AutoHeightController extends Disposable {
    constructor(
        @IRenderManagerService private readonly _renderManagerService: RenderManagerService,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._initialize();
    }

    getUndoRedoParamsOfAutoHeight(ranges: IRange[]) {
        const {
            _univerInstanceService: univerInstanceService,
            _injector: injector,
        } = this;

        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const unitId = workbook.getUnitId();
        const subUnitId = workbook.getActiveSheet().getSheetId();

        const sheetSkeletonService = this._renderManagerService.getRenderById(unitId)!.with(SheetSkeletonManagerService);
        const { skeleton } = sheetSkeletonService.getCurrent()!;
        const rowsAutoHeightInfo = skeleton.calculateAutoHeightInRange(ranges);

        const redoParams: ISetWorksheetRowAutoHeightMutationParams = {
            subUnitId,
            unitId,
            rowsAutoHeightInfo,
        };
        const undoParams: ISetWorksheetRowAutoHeightMutationParams = SetWorksheetRowAutoHeightMutationFactory(
            injector,
            redoParams
        );
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

    private _initialize() {
        const { _sheetInterceptorService: sheetInterceptorService, _selectionManagerService: selectionManagerService } =
            this;
        // for intercept'SetRangeValuesCommand' command.
        this.disposeWithMe(sheetInterceptorService.interceptCommand({
            getMutations: (command: { id: string; params: ISetRangeValuesRangeMutationParams }) => {
                if (command.id !== SetRangeValuesCommand.id) {
                    return {
                        redos: [],
                        undos: [],
                    };
                }

                return this.getUndoRedoParamsOfAutoHeight(command.params.range);
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

                return this.getUndoRedoParamsOfAutoHeight(command.params.ranges);
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
                const AFFECT_LAYOUT_STYLES = ['ff', 'fs', 'tr', 'tb'];

                if (!AFFECT_LAYOUT_STYLES.includes(command.params?.style.type)) {
                    return {
                        redos: [],
                        undos: [],
                    };
                }

                const selections = selectionManagerService.getSelectionRanges();

                if (!selections?.length) {
                    return {
                        redos: [],
                        undos: [],
                    };
                }

                return this.getUndoRedoParamsOfAutoHeight(selections);
            },
        }));
    }
}
