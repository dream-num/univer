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

import type { IMutationInfo, IRange, Nullable } from '@univerjs/core';
import type { IDiscreteRange, IPasteHookValueType, ISheetDiscreteRangeLocation } from '@univerjs/sheets-ui';
import { Disposable, Inject, Injector, ObjectMatrix, Range, Rectangle, Tools } from '@univerjs/core';
import { rangeToDiscreteRange } from '@univerjs/sheets';
import { AddHyperLinkMutation, HyperLinkModel, RemoveHyperLinkMutation } from '@univerjs/sheets-hyper-link';
import { COPY_TYPE, getRepeatRange, ISheetClipboardService, PREDEFINED_HOOK_NAME, virtualizeDiscreteRanges } from '@univerjs/sheets-ui';
import { isLegalLink } from '../common/util';
import { SheetsHyperLinkResolverService } from '../services/resolver.service';
import { SHEET_HYPER_LINK_UI_PLUGIN } from '../types/const';

export class SheetsHyperLinkCopyPasteController extends Disposable {
    private _plainTextFilter = new Set<(text: string) => boolean>();

    registerPlainTextFilter(filter: (text: string) => boolean) {
        this._plainTextFilter.add(filter);
    }

    removePlainTextFilter(filter: (text: string) => boolean) {
        this._plainTextFilter.delete(filter);
    }

    /* If return false the process of paste text will be stop */
    private _filterPlainText(text: string) {
        return Array.from(this._plainTextFilter).every((filter) => filter(text));
    }

    private _copyInfo: Nullable<{
        matrix: ObjectMatrix<string>;
        unitId: string;
        subUnitId: string;
    }>;

    constructor(
        @ISheetClipboardService private _sheetClipboardService: ISheetClipboardService,
        @Inject(HyperLinkModel) private _hyperLinkModel: HyperLinkModel,
        @Inject(Injector) private _injector: Injector,
        @Inject(SheetsHyperLinkResolverService) private _resolverService: SheetsHyperLinkResolverService
    ) {
        super();
        this._initCopyPaste();
        this.disposeWithMe(() => {
            this._plainTextFilter.clear();
        });
    }

    private _initCopyPaste() {
        this._sheetClipboardService.addClipboardHook({
            id: SHEET_HYPER_LINK_UI_PLUGIN,
            onBeforeCopy: (unitId, subUnitId, range) => this._collect(unitId, subUnitId, range),
            onPasteCells: (pasteFrom, pasteTo, data, payload) => {
                const { copyType = COPY_TYPE.COPY, pasteType } = payload;
                const { range: copyRange } = pasteFrom || {};
                const { range: pastedRange, unitId, subUnitId } = pasteTo;
                return this._generateMutations(pastedRange, { copyType, pasteType, copyRange, unitId, subUnitId });
            },
            onPastePlainText: (pasteTo: ISheetDiscreteRangeLocation, clipText: string) => {
                const filterResult = this._filterPlainText(clipText);

                if (isLegalLink(clipText) && filterResult) {
                    const { range, unitId, subUnitId } = pasteTo;
                    const { ranges: [pasteToRange], mapFunc } = virtualizeDiscreteRanges([range]);
                    const redos: IMutationInfo[] = [];
                    const undos: IMutationInfo[] = [];
                    Range.foreach(pasteToRange, (originRow, originCol) => {
                        const { row, col: column } = mapFunc(originRow, originCol);
                        const link = this._hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, row, column);
                        if (link) {
                            redos.push({
                                id: RemoveHyperLinkMutation.id,
                                params: {
                                    unitId,
                                    subUnitId,
                                    id: link.id,
                                },
                            });
                        }
                        if (link) {
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
                    return { redos, undos };
                }

                return { undos: [], redos: [] };
            },
            priority: 99,
        });
    }

    private _collect(unitId: string, subUnitId: string, range: IRange) {
        const matrix = new ObjectMatrix<string>();
        this._copyInfo = {
            unitId,
            subUnitId,
            matrix,
        };

        const discreteRange = this._injector.invoke((accessor) => {
            return rangeToDiscreteRange(range, accessor, unitId, subUnitId);
        });
        if (!discreteRange) {
            return;
        }
        const { rows, cols } = discreteRange;
        rows.forEach((row, rowIndex) => {
            cols.forEach((col, colIndex) => {
                const link = this._hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, row, col);

                matrix.setValue(rowIndex, colIndex, link?.id ?? '');
            });
        });
    }

    // eslint-disable-next-line max-lines-per-function
    private _generateMutations(
        pastedRange: IDiscreteRange,
        copyInfo: {
            copyType: COPY_TYPE;
            copyRange?: IDiscreteRange;
            pasteType: IPasteHookValueType;
            unitId: string;
            subUnitId: string;
        }
    ) {
        if (!this._copyInfo) {
            return { redos: [], undos: [] };
        }

        if (!this._copyInfo || !this._copyInfo.matrix.getSizeOf() || !copyInfo.copyRange) {
            return { redos: [], undos: [] };
        }

        const specialPastes: IPasteHookValueType[] = [
            PREDEFINED_HOOK_NAME.SPECIAL_PASTE_COL_WIDTH,
            PREDEFINED_HOOK_NAME.SPECIAL_PASTE_VALUE,
            PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMAT,
            PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMULA,
        ];

        if (specialPastes.includes(copyInfo.pasteType)) {
            return { redos: [], undos: [] };
        }

        const { unitId, subUnitId } = this._copyInfo;

        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];

        const { ranges: [vCopyRange, vPastedRange], mapFunc } = virtualizeDiscreteRanges([copyInfo.copyRange, pastedRange]);
        const repeatRange = getRepeatRange(vCopyRange, vPastedRange, true);

        repeatRange.forEach(({ startRange }) => {
            this._copyInfo?.matrix.forValue((row, col, ruleId) => {
                const range = Rectangle.getPositionRange(
                    {
                        startRow: row,
                        endRow: row,
                        startColumn: col,
                        endColumn: col,
                    },
                    startRange
                );
                const oldLink = this._hyperLinkModel.getHyperLink(unitId, subUnitId, ruleId);

                const { row: startRow, col: startColumn } = mapFunc(range.startRow, range.startColumn);
                const currentLink = this._hyperLinkModel.getHyperLinkByLocation(copyInfo.unitId, copyInfo.subUnitId, startRow, startColumn);
                const id = Tools.generateRandomId();
                if (currentLink) {
                    redos.push({
                        id: RemoveHyperLinkMutation.id,
                        params: {
                            unitId: copyInfo.unitId,
                            subUnitId: copyInfo.subUnitId,
                            id: currentLink.id,
                        },
                    });
                }
                if (oldLink) {
                    redos.push({
                        id: AddHyperLinkMutation.id,
                        params: {
                            unitId: copyInfo.unitId,
                            subUnitId: copyInfo.subUnitId,
                            link: {
                                ...oldLink,
                                id,
                                row: startRow,
                                column: startColumn,
                            },
                        },
                    });
                    undos.push({
                        id: RemoveHyperLinkMutation.id,
                        params: {
                            unitId: copyInfo.unitId,
                            subUnitId: copyInfo.subUnitId,
                            id,
                        },
                    });
                }

                if (currentLink) {
                    undos.push({
                        id: AddHyperLinkMutation.id,
                        params: {
                            unitId: copyInfo.unitId,
                            subUnitId: copyInfo.subUnitId,
                            link: currentLink,
                        },
                    });
                }
            });
        });

        return { redos, undos };
    }
}
