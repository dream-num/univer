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

import type { ICellData, Nullable } from '@univerjs/core';
import type { AutoFillService, IAutoFillLocation, IAutoFillRule, ICopyDataInTypeIndexInfo, ICopyDataPiece } from '@univerjs/sheets-ui';
import {
    Direction,
    Disposable,
    Inject,
    isFormulaId,
    isFormulaString,
    Tools,
} from '@univerjs/core';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { APPLY_TYPE, DATA_TYPE, IAutoFillService } from '@univerjs/sheets-ui';

export class FormulaAutoFillController extends Disposable {
    constructor(
        @IAutoFillService private readonly _autoFillService: AutoFillService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder
    ) {
        super();

        this._registerAutoFill();
    }

    private _registerAutoFill(): void {
        const formulaRule: IAutoFillRule = {
            type: DATA_TYPE.FORMULA,
            priority: 1001,
            match: (cellData) => isFormulaString(cellData?.f) || isFormulaId(cellData?.si),
            isContinue: (prev, cur) => {
                if (prev.type === DATA_TYPE.FORMULA) {
                    return true;
                }
                return false;
            },
            applyFunctions: {
                [APPLY_TYPE.COPY]: (dataWithIndex, len, direction, copyDataPiece, location) => {
                    const { data, index } = dataWithIndex;
                    return this._fillCopyFormula(data, len, direction, index, copyDataPiece, location as IAutoFillLocation);
                },
            },
        };
        this._autoFillService.registerRule(formulaRule);
    }

    private _fillCopyFormula(
        data: Array<Nullable<ICellData>>,
        len: number,
        direction: Direction,
        index: ICopyDataInTypeIndexInfo,
        copyDataPiece: ICopyDataPiece,
        location: IAutoFillLocation
    ) {
        const step = getDataLength(copyDataPiece);
        const applyData = [];
        const formulaIdMap = new Map<number, string>();

        for (let i = 1; i <= len; i++) {
            const dataIndex = (i - 1) % data.length;
            const sourceIndex = index[dataIndex];
            const d = Tools.deepClone(data[dataIndex]);

            if (d) {
                const originalFormula = data[dataIndex]?.f || '';
                const originalFormulaId = data[dataIndex]?.si || '';

                const checkFormula = isFormulaString(originalFormula);
                const checkFormulaId = isFormulaId(originalFormulaId);

                if (checkFormulaId) {
                    d.si = originalFormulaId;
                    d.f = null;
                    d.v = null;
                    d.p = null;
                    d.t = null;

                    applyData.push(d);
                } else if (checkFormula) {
                    // The first position setting formula and formulaId
                    let formulaId = formulaIdMap.get(dataIndex);

                    if (!formulaId) {
                        formulaId = Tools.generateRandomId(6);
                        formulaIdMap.set(dataIndex, formulaId);

                        const { offsetX, offsetY } = directionToOffset(step, len, direction, location, sourceIndex);
                        const shiftedFormula = this._lexerTreeBuilder.moveFormulaRefOffset(
                            originalFormula,
                            offsetX,
                            offsetY
                        );

                        d.si = formulaId;
                        d.f = shiftedFormula;
                        d.v = null;
                        d.p = null;
                        d.t = null;
                    } else {
                        // At the beginning of the second formula, set formulaId only
                        d.si = formulaId;
                        d.f = null;
                        d.v = null;
                        d.p = null;
                        d.t = null;
                    }

                    applyData.push(d);
                }
            }
        }

        return applyData;
    }
}

function directionToOffset(step: number, len: number, direction: Direction, location: IAutoFillLocation, sourceIndex: number) {
    const { source, target } = location;
    const { rows: targetRows } = target;
    const { rows: sourceRows } = source;

    let offsetX = 0;
    let offsetY = 0;

    switch (direction) {
        case Direction.UP:
            // The formula fills upwards, and the cell containing f and si must be at the top.
            // This happens when the step row is hidden, find the relative row that is not hidden.
            // For example, a hidden row caused by a sheets-filter.
            offsetY = targetRows[sourceIndex] - sourceRows[sourceIndex];
            break;
        case Direction.RIGHT:
            offsetX = step;
            break;
        case Direction.DOWN:
            // This happens when the step row is hidden, find the relative row that is not hidden.
            // For example, a hidden row caused by a sheets-filter.
            offsetY = targetRows[sourceIndex] - sourceRows[sourceIndex];
            break;
        case Direction.LEFT:
            offsetX = -step * len; // The formula fills leftwards, and the cell containing f and si must be at the left.
            break;
    }

    return { offsetX, offsetY };
}

function getDataLength(copyDataPiece: ICopyDataPiece) {
    let length = 0;
    for (const t in copyDataPiece) {
        copyDataPiece[t].forEach((item) => {
            length += item.data.length;
        });
    }

    return length;
}
