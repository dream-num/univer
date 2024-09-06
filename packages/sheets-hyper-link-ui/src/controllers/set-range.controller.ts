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
import { Disposable, Inject, Injector, IUniverInstanceService, LifecycleStages, ObjectMatrix, OnLifecycle, Range } from '@univerjs/core';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { ClearSelectionAllCommand, ClearSelectionContentCommand, ClearSelectionFormatCommand, getSheetCommandTarget, SetRangeValuesCommand, SheetInterceptorService, SheetsSelectionsService } from '@univerjs/sheets';
import { AddHyperLinkMutation, HyperLinkModel, RemoveHyperLinkMutation } from '@univerjs/sheets-hyper-link';
import { IEditorBridgeService } from '@univerjs/sheets-ui';

@OnLifecycle(LifecycleStages.Starting, SheetHyperLinkSetRangeController)
export class SheetHyperLinkSetRangeController extends Disposable {
    constructor(
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(HyperLinkModel) private readonly _hyperLinkModel: HyperLinkModel,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService
    ) {
        super();

        this._initCommandInterceptor();
    }

    private _initCommandInterceptor() {
        this._initSetRangeValuesCommandInterceptor();
        this._initClearSelectionCommandInterceptor();
    }

    private _initSetRangeValuesCommandInterceptor() {
        this.disposeWithMe(this._sheetInterceptorService.interceptCommand({
            getMutations: (command) => {
                if (command.id === SetRangeValuesCommand.id) {
                    const params = command.params as ISetRangeValuesMutationParams;
                    const { unitId, subUnitId } = params;
                    const redos: IMutationInfo[] = [];
                    const undos: IMutationInfo[] = [];
                    if (params.cellValue) {
                        new ObjectMatrix(params.cellValue).forValue((row, col, cell) => {
                            const cellValueRaw = cell?.v;
                            const link = this._hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, row, col);
                            if (link) {
                                // rich-text can store link in custom-range, don't save to link model
                                if (cellValueRaw === '' || cell?.custom?.__link_url === '' || cell?.p) {
                                    redos.push({
                                        id: RemoveHyperLinkMutation.id,
                                        params: {
                                            unitId,
                                            subUnitId,
                                            id: link.id,
                                        },
                                    });

                                    undos.push({
                                        id: AddHyperLinkMutation.id,
                                        params: {
                                            unitId,
                                            subUnitId,
                                            link,
                                        },
                                    });
                                }
                            }
                        });
                    }

                    return {
                        undos,
                        redos,
                    };
                }
                return {
                    redos: [],
                    undos: [],
                };
            },
        }));
    }

    private _initClearSelectionCommandInterceptor() {
        this.disposeWithMe(this._sheetInterceptorService.interceptCommand({
            getMutations: (command) => {
                if (
                    command.id === ClearSelectionContentCommand.id ||
                    command.id === ClearSelectionAllCommand.id ||
                    command.id === ClearSelectionFormatCommand.id
                ) {
                    const redos: IMutationInfo[] = [];
                    const undos: IMutationInfo[] = [];
                    const selection = this._selectionManagerService.getCurrentLastSelection();
                    const target = getSheetCommandTarget(this._univerInstanceService);
                    if (selection && target) {
                        const { unitId, subUnitId } = target;
                        Range.foreach(selection.range, (row, col) => {
                            const link = this._hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, row, col);
                            if (link) {
                                redos.push({
                                    id: RemoveHyperLinkMutation.id,
                                    params: {
                                        unitId,
                                        subUnitId,
                                        id: link.id,
                                    },
                                });
                                undos.push({
                                    id: AddHyperLinkMutation.id,
                                    params: {
                                        unitId,
                                        subUnitId,
                                        link,
                                    },
                                });
                            }
                        });
                    }

                    return {
                        redos,
                        undos,
                    };
                }

                return {
                    redos: [],
                    undos: [],
                };
            },
        }));
    }
}
