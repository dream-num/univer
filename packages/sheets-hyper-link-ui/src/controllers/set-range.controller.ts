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

import type { IMutationInfo, Workbook } from '@univerjs/core';
import { CellValueType, CustomRangeType, Disposable, Inject, Injector, IUniverInstanceService, LifecycleStages, ObjectMatrix, OnLifecycle, Range, Tools, UniverInstanceType } from '@univerjs/core';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { ClearSelectionAllCommand, ClearSelectionContentCommand, ClearSelectionFormatCommand, getSheetCommandTarget, SetRangeValuesCommand, SetRangeValuesMutation, SetRangeValuesUndoMutationFactory, SheetInterceptorService, SheetsSelectionsService } from '@univerjs/sheets';
import { AddHyperLinkMutation, HyperLinkModel, RemoveHyperLinkMutation } from '@univerjs/sheets-hyper-link';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { DOC_HYPER_LINK_PLUGIN } from '@univerjs/docs-hyper-link';
import { getPlainTextFormDocument } from '@univerjs/docs';
import { isLegalLink, serializeUrl } from '../common/util';
import type { IAddHyperLinkCommandParams } from '../commands/commands/add-hyper-link.command';
import { AddHyperLinkCommand } from '../commands/commands/add-hyper-link.command';
import type { IUpdateHyperLinkCommandParams } from '../commands/commands/update-hyper-link.command';
import { UpdateHyperLinkCommand } from '../commands/commands/update-hyper-link.command';

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
        this._initAddHyperLinkCommandInterceptor();
        this._initSetRangeValuesCommandInterceptor();
        this._initUpdateHyperLinkCommandInterceptor();
        this._initClearSelectionCommandInterceptor();
        this._initRichTextEditorInterceptor();
    }

    private _getCurrentCell(unitId: string, subUnitId: string, row: number, col: number) {
        return this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET)?.getSheetBySheetId(subUnitId)?.getCell(row, col);
    }

    private _initAddHyperLinkCommandInterceptor() {
        this.disposeWithMe(this._sheetInterceptorService.interceptCommand({

            getMutations: (command) => {
                if (command.id === AddHyperLinkCommand.id) {
                    const params = command.params as IAddHyperLinkCommandParams;
                    const { unitId, subUnitId, link } = params;
                    const currentCell = this._getCurrentCell(unitId, subUnitId, link.row, link.column);
                    const redoParams: ISetRangeValuesMutationParams = {
                        unitId,
                        subUnitId,
                        cellValue: {
                            [link.row]: {
                                [link.column]: {
                                    v: link.display,
                                    // t: CellValueType.STRING, // Setting a link to a number is still a number
                                    p: null,
                                    t: currentCell?.t ?? undefined, // Keep force string type
                                },
                            },
                        },
                    };

                    return {
                        redos: [{
                            id: SetRangeValuesMutation.id,
                            params: redoParams,
                        }],
                        undos: [{
                            id: SetRangeValuesMutation.id,
                            params: SetRangeValuesUndoMutationFactory(this._injector, redoParams),

                        }],
                    };
                }

                return {
                    redos: [],
                    undos: [],
                };
            },
        }));
    }

    private _initUpdateHyperLinkCommandInterceptor() {
        this.disposeWithMe(this._sheetInterceptorService.interceptCommand({
            getMutations: (command) => {
                if (command.id === UpdateHyperLinkCommand.id) {
                    const params = command.params as IUpdateHyperLinkCommandParams;
                    const { unitId, subUnitId, id, payload } = params;
                    const current = this._hyperLinkModel.getHyperLink(unitId, subUnitId, id);
                    if (current && current.display !== payload.display) {
                        const redoParams: ISetRangeValuesMutationParams = {
                            unitId,
                            subUnitId,
                            cellValue: {
                                [current.row]: {
                                    [current.column]: {
                                        v: payload.display,
                                        t: CellValueType.STRING,
                                        p: null,
                                    },
                                },
                            },
                        };

                        return {
                            redos: [{
                                id: SetRangeValuesMutation.id,
                                params: redoParams,
                            }],
                            undos: [{
                                id: SetRangeValuesMutation.id,
                                params: SetRangeValuesUndoMutationFactory(this._injector, redoParams),

                            }],
                        };
                    }
                }

                return {
                    redos: [],
                    undos: [],
                };
            },
        }));
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
                            const cellValueRaw = cell?.v ?? cell?.p?.body?.dataStream.slice(0, -2);
                            const cellValue = (cellValueRaw ?? '').toString();
                            const link = this._hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, row, col);
                            if (!link) {
                                if (isLegalLink(cellValue) || cell?.custom?.__link_url) {
                                    const url = cell?.custom?.__link_url ?? cellValue;
                                    const id = Tools.generateRandomId();
                                    undos.push({
                                        id: RemoveHyperLinkMutation.id,
                                        params: {
                                            unitId,
                                            subUnitId,
                                            id,
                                        },
                                    });
                                    redos.push({
                                        id: AddHyperLinkMutation.id,
                                        params: {
                                            unitId,
                                            subUnitId,
                                            link: {
                                                id,
                                                row,
                                                column: col,
                                                display: cellValue,
                                                payload: serializeUrl(url),
                                            },
                                        },
                                    });
                                }
                                return;
                            }

                            if (cellValueRaw === '' || cell?.custom?.__link_url === '') {
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

    private _initRichTextEditorInterceptor() {
        this.disposeWithMe(
            this._editorBridgeService.interceptor.intercept(
                this._editorBridgeService.interceptor.getInterceptPoints().AFTER_CELL_EDIT,
                {
                    handler: (data, context, next) => {
                        if (data?.p) {
                            const range = data.p.body?.customRanges?.find((i) => i.rangeType === CustomRangeType.HYPERLINK);
                            const resource = data.p.resources?.find((i) => i.name === DOC_HYPER_LINK_PLUGIN);
                            if (range && resource) {
                                const rangeId = range.rangeId;
                                const url = JSON.parse(resource.data)?.links?.find((i: { id: string; payload: string }) => i.id === rangeId)?.payload;

                                return next({
                                    ...data,
                                    p: null,
                                    v: getPlainTextFormDocument(data.p),
                                    t: CellValueType.STRING,
                                    custom: {
                                        __link_url: url,
                                    },
                                });
                            }
                        }

                        return next(data);
                    },
                }
            )
        );
    }
}
