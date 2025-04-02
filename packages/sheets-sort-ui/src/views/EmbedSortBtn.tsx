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

import type { IRange } from '@univerjs/core';
import { IUniverInstanceService, LocaleService } from '@univerjs/core';
import { clsx } from '@univerjs/design';
import { AscendingSingle, DescendingSingle } from '@univerjs/icons';
import { getSheetCommandTarget } from '@univerjs/sheets';
import { useDependency } from '@univerjs/ui';
import { useCallback } from 'react';
import { SheetsSortUIService } from '../services/sheets-sort-ui.service';

export interface IEmbedSortBtnProps {
    range: IRange;
    colIndex: number;
    onClose: () => void;
}

export default function EmbedSortBtn(props: IEmbedSortBtnProps) {
    const { range, colIndex, onClose } = props;

    const sheetsSortUIService = useDependency(SheetsSortUIService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const localeService = useDependency(LocaleService);

    const apply = useCallback((asc: boolean) => {
        const { unitId, subUnitId } = getSheetCommandTarget(univerInstanceService) || {};
        if (range && unitId && subUnitId) {
            const noTitleRange = { ...range, startRow: range.startRow + 1 };
            sheetsSortUIService.triggerSortDirectly(asc, false, { unitId, subUnitId, range: noTitleRange, colIndex });
        } else {
            console.warn(`Cannot find the target to sort. unitId: ${unitId}, subUnitId: ${subUnitId}, range: ${range}, colIndex: ${colIndex}`);
        }
        onClose();
    }, [range, colIndex, sheetsSortUIService, univerInstanceService, onClose]);

    const btnClassName = `
        univer-flex univer-w-[140px] univer-items-center univer-justify-center univer-gap-1 univer-border
        univer-border-solid univer-border-gray-200 univer-py-1.5 univer-text-[13px] univer-cursor-pointer
        univer-transition-colors
        active:univer-bg-gray-900/10
        hover:univer-bg-gray-900/10
    `;

    return (
        <div className="univer-mb-3 univer-flex">
            <a
                className={clsx(btnClassName, 'univer-rounded-l-[6px]')}
                onClick={() => apply(true)}
            >
                <AscendingSingle className="univer-mr-1 univer-text-base univer-text-gray-900" />
                {localeService.t('sheets-sort.general.sort-asc')}
            </a>
            <a
                className={clsx(btnClassName, '-univer-ml-px univer-rounded-r-[6px]')}
                onClick={() => apply(false)}
            >
                <DescendingSingle className="univer-mr-1 univer-text-base univer-text-gray-900" />
                {localeService.t('sheets-sort.general.sort-desc')}
            </a>
        </div>
    );
}
