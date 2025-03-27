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

import type { IMutationInfo, Workbook } from '@univerjs/core';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { BuildTextUtils, CustomRangeType, Disposable, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, generateRandomId, Inject, IUniverInstanceService, ObjectMatrix, Range, TextX, Tools, UniverInstanceType } from '@univerjs/core';
import { AFTER_CELL_EDIT, ClearSelectionAllCommand, ClearSelectionContentCommand, ClearSelectionFormatCommand, getSheetCommandTarget, SetRangeValuesCommand, SheetInterceptorService, SheetsSelectionsService } from '@univerjs/sheets';
import { AddHyperLinkMutation } from '../commands/mutations/add-hyper-link.mutation';
import { RemoveHyperLinkMutation } from '../commands/mutations/remove-hyper-link.mutation';
import { HyperLinkModel } from '../models/hyper-link.model';

export class SheetHyperLinkSetRangeController extends Disposable {
    constructor(
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(HyperLinkModel) private readonly _hyperLinkModel: HyperLinkModel,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._initCommandInterceptor();
        this._initAfterEditor();
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
                        new ObjectMatrix(params.cellValue).forValue((row, col) => {
                            const link = this._hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, row, col);
                            if (link) {
                                // rich-text can store link in custom-range, don't save to link model
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

    private _initAfterEditor() {
        this.disposeWithMe(this._sheetInterceptorService.writeCellInterceptor.intercept(AFTER_CELL_EDIT, {
            handler: (cell, context, next) => {
                if (!cell || cell.p) {
                    return next(cell);
                }

                if (typeof cell.v === 'string' && Tools.isLegalUrl(cell.v) && cell.v[cell.v.length - 1] !== ' ') {
                    const { unitId, subUnitId } = context;

                    const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
                    const worksheet = workbook?.getSheetBySheetId(subUnitId);
                    if (!worksheet) {
                        return next(cell);
                    }
                    // const renderer = this._renderManagerService.getRenderById(unitId);
                    // const skeleton = renderer?.with(SheetSkeletonManagerService).getSkeletonParam(subUnitId);
                    // if (!skeleton) {
                    //     return next(cell);
                    // }
                    const doc = worksheet.getBlankCellDocumentModel(cell);
                    if (!doc.documentModel) {
                        return next(cell);
                    }
                    const textX = BuildTextUtils.selection.replace({
                        selection: {
                            startOffset: 0,
                            endOffset: cell.v.length,
                            collapsed: false,
                        },
                        body: {
                            dataStream: `${cell.v}`,
                            customRanges: [{
                                startIndex: 0,
                                endIndex: cell.v.length - 1,
                                rangeId: generateRandomId(),
                                rangeType: CustomRangeType.HYPERLINK,
                                properties: {
                                    url: cell.v,
                                },
                            }],
                        },
                        doc: doc.documentModel,
                    });
                    if (!textX) {
                        return next(cell);
                    }
                    const body = doc.documentModel.getBody()!;
                    TextX.apply(body, textX.serialize());
                    return next({
                        ...cell,
                        p: {
                            id: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
                            body,
                            documentStyle: {
                                pageSize: {
                                    width: Infinity,
                                    height: Infinity,
                                },
                            },
                        },
                    });
                }
                return next(cell);
            },
        }));
    }
}
