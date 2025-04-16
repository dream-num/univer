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

import type { Workbook } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import { Disposable, ICommandService, Inject, IUniverInstanceService, ThemeService, UniverInstanceType } from '@univerjs/core';
import { deserializeRangeWithSheet, IDefinedNamesService, isReferenceStrings, operatorToken } from '@univerjs/engine-formula';
import { getPrimaryForRange, ScrollToCellOperation, SetWorksheetActivateCommand, SheetsSelectionsService } from '@univerjs/sheets';
import { filter, merge } from 'rxjs';
import { genNormalSelectionStyle } from '../../services/selection/const';

export class SheetsDefinedNameController extends Disposable {
    constructor(
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService,
        @ICommandService private readonly _cmdSrv: ICommandService,
        @IDefinedNamesService private readonly _definedNamesService: IDefinedNamesService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this.disposeWithMe(merge(
            this._selectionManagerService.selectionMoveStart$,
            this._selectionManagerService.selectionMoving$,
            this._selectionManagerService.selectionMoveEnd$,
            this._selectionManagerService.selectionSet$
        )
            .pipe(filter((params) => !!params))
            .subscribe((params) => {
                this._syncDefinedNameRange(params as ISelectionWithStyle[]);
            }));

        this.disposeWithMe(this._definedNamesService.focusRange$.subscribe(async (item) => {
            if (item == null) return;

            const { unitId } = item;
            let { formulaOrRefString } = item;

            if (formulaOrRefString.substring(0, 1) === operatorToken.EQUALS) {
                formulaOrRefString = formulaOrRefString.substring(1);
            }

            const result = isReferenceStrings(formulaOrRefString);
            if (!result) {
                return;
            }

            const workbook = this._instanceSrv.getUnit<Workbook>(unitId)!;
            const selections = await this._getSelections(workbook, unitId, formulaOrRefString);

            this._selectionManagerService.setSelections(selections);

            this._cmdSrv.executeCommand(ScrollToCellOperation.id, {
                unitId,
                range: selections[0].range,
            });
        }));
    }

    private _syncDefinedNameRange(params: ISelectionWithStyle[]) {
        if (params.length === 0) {
            return;
        }

        const lastSelection = params[params.length - 1];
        const workbook = this._instanceSrv.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        const worksheet = workbook?.getActiveSheet();
        if (!worksheet) {
            return;
        }

        this._definedNamesService.setCurrentRange({
            range: lastSelection.range,
            unitId: workbook!.getUnitId(),
            sheetId: worksheet.getSheetId(),
        });
    }

    private async _getSelections(workbook: Workbook, unitId: string, formulaOrRefString: string) {
        const valueArray = formulaOrRefString.split(',');

        let worksheet = workbook.getActiveSheet();

        if (!worksheet) {
            return [];
        }

        const selections = [];

        for (let i = 0; i < valueArray.length; i++) {
            const refString = valueArray[i].trim();

            const unitRange = deserializeRangeWithSheet(refString.trim());

            // WTF@DR-Univer: side effects in get methods
            if (i === 0) {
                const worksheetCache = workbook.getSheetBySheetName(unitRange.sheetName);
                if (worksheetCache && worksheet.getSheetId() !== worksheetCache.getSheetId()) {
                    worksheet = worksheetCache;
                    await this._cmdSrv.executeCommand(SetWorksheetActivateCommand.id, {
                        subUnitId: worksheet.getSheetId(),
                        unitId,
                    });
                }
            }

            if (worksheet.getName() !== unitRange.sheetName) {
                continue;
            }

            let primary = null;
            if (i === valueArray.length - 1) {
                const range = unitRange.range;
                const { startRow, startColumn, endRow, endColumn } = range;
                primary = getPrimaryForRange({
                    startRow,
                    startColumn,
                    endRow,
                    endColumn,

                }, worksheet);
            }

            selections.push({
                range: unitRange.range,
                style: genNormalSelectionStyle(this._themeService),
                primary,
            });
        }

        return selections;
    }
}
