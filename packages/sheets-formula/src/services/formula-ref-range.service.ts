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

import type { IMutationInfo, IRange, Workbook } from '@univerjs/core';
import { Disposable, DisposableCollection, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { deserializeRangeWithSheet, ErrorType, generateStringWithSequence, LexerTreeBuilder, sequenceNodeType, serializeRange, serializeRangeWithSheet, serializeRangeWithSpreadsheet } from '@univerjs/engine-formula';
import type { EffectRefRangeParams } from '@univerjs/sheets';
import { handleDefaultRangeChangeWithEffectRefCommands, RefRangeService } from '@univerjs/sheets';
import type { IDisposable } from '@wendellhu/redi';
import { Inject } from '@wendellhu/redi';

export type FormulaChangeMap = Record<string, Record<string, Record<string, string>>>;

export type FormulaChangeCallback = (formulaString: string) => {
    redos: IMutationInfo[];
    undos: IMutationInfo[];
};

export class FormulaRefRangeService extends Disposable {
    constructor(
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
    }

    registerFormula(formula: string, callback: FormulaChangeCallback): IDisposable {
        const rangeMap = new Map<string, { unitId: string; subUnitId: string; range: IRange; sheetName: string }>();
        const sequenceNodes = this._lexerTreeBuilder.sequenceNodesBuilder(formula);
        const disposableCollection = new DisposableCollection();
        const handleChange = (params: EffectRefRangeParams) => {
            const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            const worksheet = workbook.getActiveSheet();
            const unitId = workbook.getUnitId();
            const subUnitId = worksheet.getSheetId();

            const transformSequenceNodes = sequenceNodes?.map((node) => {
                if (typeof node === 'object' && node.nodeType === sequenceNodeType.REFERENCE) {
                    const rangeInfo = rangeMap.get(node.token)!;
                    if ((rangeInfo.unitId && rangeInfo.unitId !== unitId) && (rangeInfo.subUnitId && rangeInfo.subUnitId !== subUnitId)) {
                        return node;
                    }
                    const newRange = handleDefaultRangeChangeWithEffectRefCommands(rangeInfo.range, params);

                    let newToken = '';
                    if (rangeInfo.unitId && rangeInfo.sheetName) {
                        newToken = serializeRangeWithSpreadsheet(rangeInfo.unitId, rangeInfo.sheetName, rangeInfo.range);
                    } else if (rangeInfo.sheetName) {
                        newToken = serializeRangeWithSheet(rangeInfo.sheetName, rangeInfo.range);
                    } else {
                        newToken = newRange ? serializeRange(newRange) : ErrorType.ERROR;
                    }

                    return {
                        ...node,
                        token: newToken,
                    };
                } else {
                    return node;
                }
                ;
            });
            const newFormulaString = transformSequenceNodes && generateStringWithSequence(transformSequenceNodes);
            return callback(`=${newFormulaString}`);
        };
        sequenceNodes?.forEach((node) => {
            if (typeof node === 'object' && node.nodeType === sequenceNodeType.REFERENCE) {
                const gridRangeName = deserializeRangeWithSheet(node.token);
                const { range, unitId, sheetName } = gridRangeName;
                const workbook = unitId ? this._univerInstanceService.getUniverSheetInstance(unitId) : this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                const worksheet = sheetName ? workbook?.getSheetBySheetName(sheetName) : workbook?.getActiveSheet();
                if (!worksheet) {
                    return;
                }
                const sheetId = worksheet.getSheetId();
                const item = {
                    unitId,
                    subUnitId: sheetId,
                    range,
                    sheetName,
                };
                rangeMap.set(node.token, item);
                disposableCollection.add(this._refRangeService.registerRefRange(range, handleChange, unitId, sheetId));
            }
        });

        return disposableCollection;
    }
}
