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

import type { IRange, Nullable, Workbook, Worksheet } from '@univerjs/core';
import type { ISheetRangeLocation } from '@univerjs/sheets';

import type { ISortOption } from '@univerjs/sheets-sort';
import {
    Disposable,
    ICommandService,
    ILogService,
    Inject,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';

import { expandToContinuousRange, getPrimaryForRange, SetSelectionsOperation, SheetsSelectionsService } from '@univerjs/sheets';
import { SheetsSortService, SortType } from '@univerjs/sheets-sort';
import { IConfirmService } from '@univerjs/ui';
import { BehaviorSubject } from 'rxjs';
import { ExtendConfirm } from '../views/ExtendConfirm';

export enum EXTEND_TYPE {
    KEEP = 'keep',
    EXTEND = 'extend',
    CANCEL = 'cancel',
}

export interface ICustomSortState {
    location?: ISheetSortLocation;
    show: boolean;
}

export interface ISheetSortLocation extends ISheetRangeLocation {
    colIndex: number;
}

const SORT_ERROR_MESSAGE = {
    MERGE_ERROR: 'sheets-sort.error.merge-size',
    EMPTY_ERROR: 'sheets-sort.error.empty',
    SINGLE_ERROR: 'sheets-sort.error.single',
    FORMULA_ARRAY: 'sheets-sort.error.formula-array',
};

export class SheetsSortUIService extends Disposable {
    private readonly _customSortState$ = new BehaviorSubject<Nullable<ICustomSortState>>(null);
    readonly customSortState$ = this._customSortState$.asObservable();

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IConfirmService private readonly _confirmService: IConfirmService,
        @ILogService private readonly _logService: ILogService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @Inject(SheetsSortService) private readonly _sheetsSortService: SheetsSortService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
    }

    async triggerSortDirectly(asc: boolean, extend: boolean, sheetRangeLocation?: ISheetSortLocation): Promise<boolean> {
        const location = sheetRangeLocation || await this._detectSortLocation(extend);
        if (!location) {
            return false;
        }

        const check = this._check(location);
        if (!check) {
            return false;
        }

        const sortOption: ISortOption = {
            orderRules: [{
                type: asc ? SortType.ASC : SortType.DESC,
                colIndex: location.colIndex,
            }],
            range: location.range,
        };
        this._sheetsSortService.applySort(sortOption, location.unitId, location.subUnitId);
        return true;
    }

    async triggerSortCustomize() {
        const location = await this._detectSortLocation();
        if (!location) {
            return false;
        }

        const check = this._check(location);
        if (!check) {
            return false;
        }

        // open customize dialog
        this.showCustomSortPanel(location);
        return true;
    }

    customSortState() {
        return this._customSortState$.getValue();
    }

    getTitles(hasTitle: boolean) {
        const location = this.customSortState()?.location;
        if (!location) {
            return [];
        }

        const { unitId, subUnitId, range } = location;
        const worksheet = (this._univerInstanceService.getUnit(unitId) as Workbook)?.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            return [];
        }

        const colTranslator = colIndexTranslator(this._localeService);

        return Array.from({ length: range.endColumn - range.startColumn + 1 }, (_, i) => {
            const cellValue = worksheet.getCell(range.startRow, i + range.startColumn)?.v;
            return {
                index: i + range.startColumn,
                label: hasTitle ?
                    `${cellValue ?? colTranslator(i + range.startColumn)}` :
                    colTranslator(i + range.startColumn),
            };
        });
    }

    setSelection(unitId: string, subUnitId: string, range: IRange) {
        const worksheet = (this._univerInstanceService.getUnit(unitId) as Workbook)?.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            return;
        }
        const setSelectionsOperationParams = {
            unitId,
            subUnitId,

            selections: [{ range, primary: getPrimaryForRange(range, worksheet), style: null }],

        };
        this._commandService.executeCommand(SetSelectionsOperation.id, setSelectionsOperationParams);
    }

    async showCheckError(content: string): Promise<boolean> {
        return await this._confirmService.confirm({
            id: 'sort-range-check-error',
            title: {
                title: this._localeService.t('info.tooltip'),
            },
            children: {
                title: <div>{this._localeService.t(content)}</div>,
            },
        });
    }

    async showExtendConfirm(): Promise<EXTEND_TYPE> {
        let shouldExtend = false;
        const confirm = await this._confirmService.confirm({
            id: 'extend-sort-range-dialog',
            title: {
                title: this._localeService.t('sheets-sort.dialog.sort-reminder'),
            },
            children: {
                title: (
                    <ExtendConfirm
                        onChange={(value: string) => {
                            shouldExtend = value === '1';
                        }}
                    />
                ),
            },
            width: 400,

        });
        if (confirm) {
            return shouldExtend ? EXTEND_TYPE.EXTEND : EXTEND_TYPE.KEEP;
        }
        return EXTEND_TYPE.CANCEL;
    }

    showCustomSortPanel(location: ISheetSortLocation) {
        this._customSortState$.next({ location, show: true });
    }

    closeCustomSortPanel() {
        this._customSortState$.next({ show: false });
    }

    private _check(location: ISheetSortLocation) {
        const singleCheck = this._sheetsSortService.singleCheck(location);
        if (!singleCheck) {
            this.showCheckError(SORT_ERROR_MESSAGE.SINGLE_ERROR);
            return false;
        }

        const mergeCheck = this._sheetsSortService.mergeCheck(location);
        if (!mergeCheck) {
            this.showCheckError(SORT_ERROR_MESSAGE.MERGE_ERROR);
            return false;
        }

        const formulaCheck = this._sheetsSortService.formulaCheck(location);
        if (!formulaCheck) {
            this.showCheckError(SORT_ERROR_MESSAGE.FORMULA_ARRAY);
            return false;
        }

        const emptyCheck = this._sheetsSortService.emptyCheck(location);
        if (!emptyCheck) {
            this.showCheckError(SORT_ERROR_MESSAGE.EMPTY_ERROR);
            return false;
        }
        return true;
    }

    private async _detectSortLocation(extend?: boolean): Promise<Nullable<ISheetSortLocation>> {
        const workbook = this._univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_SHEET) as Workbook;
        const worksheet = workbook.getActiveSheet() as Worksheet;
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const selection = this._selectionManagerService.getCurrentLastSelection();
        if (!selection) {
            return null;
        }
        let range: IRange;
        if (extend === true) {
            range = expandToContinuousRange(selection.range, { up: true, down: true, left: true, right: true }, worksheet);
            this.setSelection(unitId, subUnitId, range);
        } else if (extend === false) {
            range = selection.range;
        } else {
            const confirmRes = await this.showExtendConfirm();
            if (confirmRes === EXTEND_TYPE.CANCEL) {
                return null;
            }
            if (confirmRes === EXTEND_TYPE.KEEP) {
                range = selection.range;
            } else {
                range = expandToContinuousRange(selection.range, { up: true, down: true, left: true, right: true }, worksheet);
                this.setSelection(unitId, subUnitId, range);
            }
        }

        return {
            range,
            unitId,
            subUnitId,
            colIndex: selection.primary.actualColumn,
        };
    }
}

function colIndexTranslator(localeService: LocaleService) {
    return (colIndex: number) => {
        const colName = Tools.chatAtABC(colIndex);
        const currentLocale = localeService.getCurrentLocale();
        switch (currentLocale) {
            case LocaleType.ZH_CN:
                return `"${colName}"列`;
            case LocaleType.EN_US:
                return `Column "${colName}"`;
            default:
                return `Column "${colName}"`;
        }
    };
}
