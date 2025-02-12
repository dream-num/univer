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

import type { IMutationInfo } from '@univerjs/core';
import type { IAutoFillLocation, ISheetAutoFillHook } from '@univerjs/sheets-ui';
import { Disposable, Inject, Range, Rectangle, Tools } from '@univerjs/core';
import { AddHyperLinkMutation, HyperLinkModel, RemoveHyperLinkMutation } from '@univerjs/sheets-hyper-link';
import { APPLY_TYPE, getAutoFillRepeatRange, IAutoFillService, virtualizeDiscreteRanges } from '@univerjs/sheets-ui';
import { SHEET_HYPER_LINK_UI_PLUGIN } from '../types/const';

export class SheetsHyperLinkAutoFillController extends Disposable {
    constructor(
        @IAutoFillService private readonly _autoFillService: IAutoFillService,
        @Inject(HyperLinkModel) private readonly _hyperLinkModel: HyperLinkModel
    ) {
        super();
        this._initAutoFill();
    }

    // eslint-disable-next-line max-lines-per-function
    private _initAutoFill() {
        const noopReturnFunc = () => ({ redos: [], undos: [] });

        // eslint-disable-next-line max-lines-per-function
        const generalApplyFunc = (location: IAutoFillLocation, applyType: APPLY_TYPE) => {
            const { source: sourceRange, target: targetRange, unitId, subUnitId } = location;

            const virtualRange = virtualizeDiscreteRanges([sourceRange, targetRange]);
            const [vSourceRange, vTargetRange] = virtualRange.ranges;
            const { mapFunc } = virtualRange;
            const sourceStartCell = {
                row: vSourceRange.startRow,
                col: vSourceRange.startColumn,
            };
            const repeats = getAutoFillRepeatRange(vSourceRange, vTargetRange);
            const redos: IMutationInfo[] = [];
            const undos: IMutationInfo[] = [];

            // eslint-disable-next-line max-lines-per-function
            repeats.forEach((repeat) => {
                const targetStartCell = repeat.repeatStartCell;
                const relativeRange = repeat.relativeRange;
                const sourceRange = {
                    startRow: sourceStartCell.row,
                    startColumn: sourceStartCell.col,
                    endColumn: sourceStartCell.col,
                    endRow: sourceStartCell.row,
                };
                const targetRange = {
                    startRow: targetStartCell.row,
                    startColumn: targetStartCell.col,
                    endColumn: targetStartCell.col,
                    endRow: targetStartCell.row,
                };
                Range.foreach(relativeRange, (row, col) => {
                    const sourcePositionRange = Rectangle.getPositionRange(
                        {
                            startRow: row,
                            startColumn: col,
                            endColumn: col,
                            endRow: row,
                        },
                        sourceRange
                    );
                    const { row: sourceRow, col: sourceCol } = mapFunc(sourcePositionRange.startRow, sourcePositionRange.startColumn);
                    const link = this._hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, sourceRow, sourceCol);
                    const targetPositionRange = Rectangle.getPositionRange(
                        {
                            startRow: row,
                            startColumn: col,
                            endColumn: col,
                            endRow: row,
                        },
                        targetRange
                    );
                    const { row: targetRow, col: targetCol } = mapFunc(targetPositionRange.startRow, targetPositionRange.startColumn);
                    const id = Tools.generateRandomId();
                    const currentLink = this._hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, targetRow, targetCol);
                    if (currentLink) {
                        redos.push({
                            id: RemoveHyperLinkMutation.id,
                            params: {
                                unitId,
                                subUnitId,
                                id: currentLink.id,
                            },
                        });
                    }
                    if ((APPLY_TYPE.COPY === applyType || APPLY_TYPE.SERIES === applyType) && link) {
                        redos.push({
                            id: AddHyperLinkMutation.id,
                            params: {
                                unitId,
                                subUnitId,
                                link: {
                                    ...link,
                                    id,
                                    row: targetRow,
                                    column: targetCol,
                                },
                            },
                        });
                        undos.push({
                            id: RemoveHyperLinkMutation.id,
                            params: {
                                unitId,
                                subUnitId,
                                id,
                            },
                        });
                    }
                    if (currentLink) {
                        undos.push({
                            id: AddHyperLinkMutation.id,
                            params: {
                                unitId,
                                subUnitId,
                                link: currentLink,
                            },
                        });
                    }
                });
            });
            return {
                undos,
                redos,
            };
        };
        const hook: ISheetAutoFillHook = {
            id: SHEET_HYPER_LINK_UI_PLUGIN,
            onFillData: (location, direction, applyType) => {
                if (
                    applyType === APPLY_TYPE.COPY ||
                    applyType === APPLY_TYPE.ONLY_FORMAT ||
                    applyType === APPLY_TYPE.SERIES
                ) {
                    return generalApplyFunc(location, applyType);
                }

                return noopReturnFunc();
            },
        };
        this.disposeWithMe(this._autoFillService.addHook(hook));
    }
}
