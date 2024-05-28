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

import type { IRange, Nullable, Workbook } from '@univerjs/core';
import { Disposable, ICommandService,
    ILogService,
    IUniverInstanceService,
    LifecycleStages,
    LocaleService,
    OnLifecycle,
    UniverInstanceType,
} from '@univerjs/core';

import { SelectionManagerService } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';
import type { ISheetRangeLocation } from '@univerjs/sheets-ui';
import { expandToContinuousRange } from '@univerjs/sheets-ui';

import type { ISortOption } from '@univerjs/sheets-sort';
import { SheetsSortService, SortType } from '@univerjs/sheets-sort';
import React from 'react';
import { IConfirmService } from '@univerjs/ui';
import { BehaviorSubject } from 'rxjs';
import { ExtendConfirm } from '../views/ExtendConfirm';

export enum EXTEND_TYPE {
    KEEP = 'keep',
    EXTEND = 'extend',
    CANCEL = 'cancel',
}

export interface ICustomSortState {
    range: IRange;
}

@OnLifecycle(LifecycleStages.Ready, SheetsSortService)
export class SheetsSortUIService extends Disposable {
    private readonly _customSortState$ = new BehaviorSubject<Nullable<ICustomSortState>>(null);
    readonly customSortState$ = this._customSortState$.asObservable();
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IConfirmService private readonly _confirmService: IConfirmService,
        @ILogService private readonly _logService: ILogService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @Inject(SheetsSortService) private readonly _sheetsSortService: SheetsSortService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @ICommandService private readonly _commandService: ICommandService) {
        super();
    }

    async triggerSortDirectly(asc: boolean, extend?: boolean): Promise<boolean> {
        const location = await this._detectSortLocation(extend);
        if (!location) {
            return false;
        }

        const mergeCheck = this._sheetsSortService.mergeCheck(location);
        if (!mergeCheck) {
            this.showMergeError();
            return false;
        }
        const primary = this._selectionManagerService.getLast()?.primary;
        if (!primary) {
            return false;
        }
        const sortOption: ISortOption = {
            orderRules: [{
                type: asc ? SortType.ASC : SortType.DESC,
                colIndex: primary.actualColumn,
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

        const mergeCheck = this._sheetsSortService.mergeCheck(location);
        if (!mergeCheck) {
            this.showMergeError();
            return false;
        }
        // open customize dialog
        this.showCustomSortPanel(location);
        // if (!sortOption) {
        //     return false;
        // }
        // this._sheetsSortService.applySort(sortOption, location.unitId, location.subUnitId);
        // return true;
    }

    private async _detectSortLocation(extend?: boolean): Promise<Nullable<ISheetRangeLocation >> {
        const workbook = this._univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_SHEET) as Workbook;
        const worksheet = workbook.getActiveSheet();
        const matrix = worksheet.getCellMatrix();
        const selection = this._selectionManagerService.getLast();
        if (!selection) {
            return null;
        }
        let range;
        if (extend === true) {
            range = expandToContinuousRange(selection.range, { up: true, down: true, left: true, right: true }, worksheet);
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
            }
        }

        return {
            range,
            unitId: workbook.getUnitId(),
            subUnitId: worksheet.getSheetId(),
        };
    }

    async showMergeError(): Promise<boolean> {
        return await this._confirmService.confirm({
            id: 'sort-range-merge-error',
            title: {
                title: this._localeService.t('sheets-sort.error.merge-size'),
            },
            children: {
                title: <div>Different size merge-cell detected, sort aborted!</div>,
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

    showCustomSortPanel(location: ISheetRangeLocation) {
        this._customSortState$.next({ range: location.range });

        // let list: IOrderRule[] = [];
        // const confirm = await this._confirmService.confirm({
        //     id: 'custom-sort-panel',
        //     title: {
        //         title: 'Custom Sort',
        //     },
        //     children: {
        //         title: (
        //             <CustomSortPanel
        //                 range={location.range}
        //                 onListChange={(value) => {
        //                     list = value;
        //                 }}
        //             />
        //         ),
        //     },
        //     confirmText: 'Sort',
        //     cancelText: 'Cancel',
        // });
        // if (confirm) {
        //     return {
        //         range: location.range,
        //         orderRules: list,
        //     };
        // }
        // return null;
    }
}
