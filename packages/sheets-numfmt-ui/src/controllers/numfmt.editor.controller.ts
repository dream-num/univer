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

import type { IDocumentBody, IRange, Nullable, Workbook } from '@univerjs/core';
import type {
    INumfmtItemWithCache,
    IRemoveNumfmtMutationParams,
    ISetCellsNumfmt,
    ISetNumfmtMutationParams,
} from '@univerjs/sheets';
import {
    CellValueType,
    Disposable,
    Inject,
    Injector,
    IUniverInstanceService,
    numfmt,
    Optional,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { isTextFormat } from '@univerjs/engine-numfmt';
import {
    AFTER_CELL_EDIT,
    BEFORE_CELL_EDIT,
    factoryRemoveNumfmtUndoMutation,
    factorySetNumfmtUndoMutation,
    INumfmtService,
    RemoveNumfmtMutation,
    SetNumfmtMutation,
    SetRangeValuesCommand,
    SheetInterceptorService,
    transformCellsToRange,
} from '@univerjs/sheets';

import { getPatternType } from '@univerjs/sheets-numfmt';
import { IEditorBridgeService } from '@univerjs/sheets-ui';

const createCollectEffectMutation = () => {
    interface IConfig {
        unitId: string;
        subUnitId: string;
        row: number;
        col: number;
        value: Nullable<INumfmtItemWithCache>;
    }
    let list: IConfig[] = [];
    const add = (unitId: string, subUnitId: string, row: number, col: number, value: Nullable<INumfmtItemWithCache>) =>
        list.push({ unitId, subUnitId, row, col, value });
    const getEffects = () => list;
    const clean = () => {
        list = [];
    };
    return {
        add,
        getEffects,
        clean,
    };
};

export class NumfmtEditorController extends Disposable {
    // collect effect mutations when edit end and push this to  commands stack in next commands progress
    private _collectEffectMutation = createCollectEffectMutation();

    constructor(
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(INumfmtService) private _numfmtService: INumfmtService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private _injector: Injector,
        @Optional(IEditorBridgeService) private _editorBridgeService?: IEditorBridgeService
    ) {
        super();
        this._initInterceptorEditorStart();
        this._initInterceptorEditorEnd();
        this._initInterceptorCommands();
    }

    private _initInterceptorEditorStart() {
        if (!this._editorBridgeService) {
            return;
        }

        this.disposeWithMe(
            toDisposable(
                this._sheetInterceptorService.writeCellInterceptor.intercept(BEFORE_CELL_EDIT, {
                    handler: (value, context, next) => {
                        const row = context.row;
                        const col = context.col;
                        const numfmtCell = this._numfmtService.getValue(
                            context.unitId,
                            context.subUnitId,
                            row,
                            col
                        );
                        if (numfmtCell) {
                            const type = getPatternType(numfmtCell.pattern);
                            switch (type) {
                                case 'scientific':
                                case 'currency':
                                case 'grouped':
                                case 'number': {
                                    const cell = context.worksheet.getCellRaw(row, col);
                                    return next && next(cell);
                                }
                                case 'percent':
                                case 'date':
                                case 'time':
                                case 'datetime':
                                default: {
                                    return next && next(value);
                                }
                            }
                        }
                        return next(value);
                    },
                })
            )
        );
    }

    /**
     * Process the  values after  edit
     * @private
     * @memberof NumfmtService
     */

    private _initInterceptorEditorEnd() {
        this.disposeWithMe(
            toDisposable(
                this._sheetInterceptorService.writeCellInterceptor.intercept(AFTER_CELL_EDIT, {
                        // eslint-disable-next-line complexity
                    handler: (value, context, next) => {
                            // clear the effect
                        this._collectEffectMutation.clean();
                        const currentNumfmtValue = this._numfmtService.getValue(
                            context.unitId,
                            context.subUnitId,
                            context.row,
                            context.col
                        );
                        // const currentNumfmtType = (currentNumfmtValue && getPatternType(currentNumfmtValue.pattern)) ?? '';
                        // const clean = () => {
                        //     currentNumfmtValue &&
                        //             this._collectEffectMutation.add(
                        //                 context.unitId,
                        //                 context.subUnitId,
                        //                 context.row,
                        //                 context.col,
                        //                 null
                        //             );
                        // };
                        if (!value?.v && !value?.p) {
                            return next(value);
                        }

                            // if the cell is text format or force string, do not convert the value
                        if (isTextFormat(currentNumfmtValue?.pattern) || value.t === CellValueType.FORCE_STRING) {
                            return next(value);
                        }

                        const body = value.p?.body;
                        const content = value?.p?.body?.dataStream ? value.p.body.dataStream.replace(/\r\n$/, '') : String(value.v);
                        const numfmtInfo = numfmt.parseDate(content) || numfmt.parseTime(content) || numfmt.parseNumber(content);

                        if (body) {
                            if (!canConvertRichTextToNumfmt(body)) {
                                return next(value);
                            } else {
                                const { dataStream } = body;
                                const dataStreamWithoutEnd = dataStream.replace(/\r\n$/, '');
                                const num = Number(dataStreamWithoutEnd);
                                if (Number.isNaN(num) && !numfmtInfo) {
                                    return next(value);
                                }
                            }
                        }

                        if (numfmtInfo) {
                            if (numfmtInfo.z) {
                                this._collectEffectMutation.add(
                                    context.unitId,
                                    context.subUnitId,
                                    context.row,
                                    context.col,
                                    {
                                        pattern: numfmtInfo.z,
                                    }
                                );
                            }
                            const v = Number(numfmtInfo.v);
                            return next({ ...value, p: undefined, v, t: CellValueType.NUMBER });
                        }
                        // else if (['date', 'time', 'datetime', 'percent'].includes(currentNumfmtType) || !isNumeric(content)) {
                        //     clean();
                        // }
                        return next(value);
                    },
                })
            )
        );
    }

    private _initInterceptorCommands() {
        const self = this;
        this.disposeWithMe(
            this._sheetInterceptorService.interceptCommand({
                getMutations(command) {
                    switch (command.id) {
                        case SetRangeValuesCommand.id: {
                            const workbook = self._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                            const unitId = workbook.getUnitId();
                            const subUnitId = workbook.getActiveSheet()?.getSheetId();
                            if (!subUnitId) {
                                return {
                                    redos: [],
                                    undos: [],
                                };
                            }
                            const list = self._collectEffectMutation.getEffects();
                            self._collectEffectMutation.clean();
                            if (!list.length) {
                                return {
                                    redos: [],
                                    undos: [],
                                };
                            }
                            const cells: ISetCellsNumfmt = list
                                .filter((item) => !!item.value?.pattern)
                                .map((item) => ({
                                    row: item.row,
                                    col: item.col,
                                    pattern: item.value!.pattern,
                                }));
                            const removeCells: IRange[] = list
                                .filter((item) => !item.value?.pattern)
                                .map((item) => ({
                                    startRow: item.row,
                                    endColumn: item.col,
                                    startColumn: item.col,
                                    endRow: item.row,
                                }));
                            const redos = [];
                            const undos = [];
                            if (cells.length) {
                                const redo = {
                                    id: SetNumfmtMutation.id,
                                    params: transformCellsToRange(unitId, subUnitId, cells) as ISetNumfmtMutationParams,
                                };
                                redos.push(redo);
                                undos.push(...factorySetNumfmtUndoMutation(self._injector, redo.params));
                            }
                            if (removeCells.length) {
                                const redo = {
                                    id: RemoveNumfmtMutation.id,
                                    params: {
                                        unitId,
                                        subUnitId,
                                        ranges: removeCells,
                                    } as IRemoveNumfmtMutationParams,
                                };
                                redos.push(redo);
                                undos.push(...factoryRemoveNumfmtUndoMutation(self._injector, redo.params));
                            }
                            return {
                                redos,
                                undos: undos.reverse(),
                            };
                        }
                    }
                    return {
                        redos: [],
                        undos: [],
                    };
                },
            })
        );
    }
}

function isNumeric(str: string) {
    return /^-?\d+(\.\d+)?$/.test(str);
}

function canConvertRichTextToNumfmt(body: IDocumentBody): boolean {
    const { textRuns = [], paragraphs = [], customRanges, customBlocks = [] } = body;

    // Some styles are unique to rich text. When this style appears, we consider the value to be rich text.
    const richTextStyle = ['va'];

    return !(
        textRuns.some((textRun) => {
            const hasRichTextStyle = Boolean(textRun.ts && Object.keys(textRun.ts).some((property) => {
                return richTextStyle.includes(property);
            }));
            return hasRichTextStyle;
        }) ||
        paragraphs.some((paragraph) => paragraph.bullet) ||
        paragraphs.length >= 2 ||
        Boolean(customRanges?.length) ||
        customBlocks.length > 0
    );
}
