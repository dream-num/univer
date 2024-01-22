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

import type { IMutationInfo } from '@univerjs/core';
import {
    Disposable,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    Rectangle,
} from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import type {
    IAddWorksheetMergeMutationParams,
    IRemoveWorksheetMergeMutationParams,
} from '../../basics/interfaces/mutation-interface';
import { ClearSelectionAllCommand } from '../../commands/commands/clear-selection-all.command';
import { ClearSelectionFormatCommand } from '../../commands/commands/clear-selection-format.command';
import { AddWorksheetMergeMutation } from '../../commands/mutations/add-worksheet-merge.mutation';
import {
    RemoveMergeUndoMutationFactory,
    RemoveWorksheetMergeMutation,
} from '../../commands/mutations/remove-worksheet-merge.mutation';
import { MergeCellService } from '../../services/merge-cell/merge-cell.service';
import { RefRangeService } from '../../services/ref-range/ref-range.service';
import { SelectionManagerService } from '../../services/selection-manager.service';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';

@OnLifecycle(LifecycleStages.Steady, MergeCellInterceptorController)
export class MergeCellInterceptorController extends Disposable {
    constructor(
        @Inject(ICommandService) private readonly _commandService: ICommandService,
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private _injector: Injector,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(SelectionManagerService) private _selectionManagerService: SelectionManagerService,
        @Inject(MergeCellService) private _mergeCellService: MergeCellService
    ) {
        super();
        this._initCommandInterceptor();
    }

    private _initCommandInterceptor() {
        const self = this;
        this._sheetInterceptorService.interceptCommand({
            getMutations(commandInfo) {
                switch (commandInfo.id) {
                    case ClearSelectionAllCommand.id:
                    case ClearSelectionFormatCommand.id: {
                        const workbook = self._univerInstanceService.getCurrentUniverSheetInstance();
                        const unitId = workbook.getUnitId();
                        const worksheet = workbook.getActiveSheet();
                        const subUnitId = worksheet.getSheetId();
                        const mergeData = self._mergeCellService.getMergeData(unitId, subUnitId);
                        const selections = self._selectionManagerService.getSelectionRanges();
                        if (selections && selections.length > 0) {
                            const isHasMerge = selections.some((range) =>
                                mergeData.some((item) => Rectangle.intersects(item, range))
                            );
                            if (isHasMerge) {
                                const removeMergeParams: IRemoveWorksheetMergeMutationParams = {
                                    unitId,
                                    subUnitId,
                                    ranges: selections,
                                };
                                const undoRemoveMergeParams: IAddWorksheetMergeMutationParams =
                                    RemoveMergeUndoMutationFactory(self._injector, removeMergeParams);
                                const redos: IMutationInfo[] = [
                                    { id: RemoveWorksheetMergeMutation.id, params: removeMergeParams },
                                ];
                                const undos: IMutationInfo[] = [
                                    { id: AddWorksheetMergeMutation.id, params: undoRemoveMergeParams },
                                ];
                                return { redos, undos };
                            }
                        }
                    }
                }

                return { redos: [], undos: [] };
            },
        });
    }
}
