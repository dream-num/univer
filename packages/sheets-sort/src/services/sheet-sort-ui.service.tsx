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

import { Disposable, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { IConfirmService } from '@univerjs/ui';
import { createIdentifier } from '@wendellhu/redi';
import React from 'react';
import type { ISheetRangeLocation } from '@univerjs/sheets-ui';
import { ExtendConfirm } from '../views/ExtendConfirm';
import { SortType } from '../commands/sheets-reorder.command';
import type { ISortOption } from './interface';
import { EXTEND_TYPE } from './interface';

export const ISheetsSortUIService = createIdentifier<SheetsSortUIService>('univer.sheets-sort-ui.service');


export interface ISheetsSortUIService {
    showMergeError(): Promise<boolean>;
    showExtendConfirm(): Promise<EXTEND_TYPE>;
    showCustomSortPanel(location: ISheetRangeLocation): Promise<ISortOption>;
}

@OnLifecycle(LifecycleStages.Ready, SheetsSortUIService)
export class SheetsSortUIService extends Disposable implements ISheetsSortUIService {
    constructor(
        @IConfirmService private readonly _confirmService: IConfirmService
    ) {
        super();
    }

    async showMergeError(): Promise<boolean> {
        return await this._confirmService.confirm({
            id: 'sort-range-merge-error',
            title: {
                title: 'Merge error',
            },
            children: {
                title: <div>Different size merge-cell detected, sort aborted!</div>,
            },
            confirmText: 'Confirm',
            cancelText: 'Cancel',
        });
    }

    async showExtendConfirm(): Promise<EXTEND_TYPE> {
        let shouldExtend = false;
        const confirm = await this._confirmService.confirm({
            id: 'extend-sort-range-dialog',
            title: {
                title: 'Extend or not',
            },
            children: {
                title: <ExtendConfirm
                    onChange={(value: string) => {
                        shouldExtend = value === '1';
                    }} />,
            },
            confirmText: 'Confirm',
            cancelText: 'Cancel',
        });
        if (confirm) {
            return shouldExtend ? EXTEND_TYPE.EXTEND : EXTEND_TYPE.KEEP;
        }
        return EXTEND_TYPE.CANCEL;
    }

    async showCustomSortPanel(location: ISheetRangeLocation): Promise<ISortOption> {
        return {
            range: location.range,
            //  mock temporary.
            orderRules: [{ type: SortType.ASC, colIndex: location.range.startColumn }, { type: SortType.DESC, colIndex: location.range.endColumn }],
        };
    }
}
