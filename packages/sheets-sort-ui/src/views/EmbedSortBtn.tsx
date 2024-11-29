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

import { type IRange, IUniverInstanceService, LocaleService } from '@univerjs/core';
import { useDependency } from '@univerjs/core';
import { AscendingSingle, DescendingSingle } from '@univerjs/icons';
import { getSheetCommandTarget } from '@univerjs/sheets';
import React, { useCallback } from 'react';
import { SheetsSortUIService } from '../services/sheets-sort-ui.service';
import styles from './index.module.less';

export interface IEmbedSortBtnProps {
    range: IRange;
    colIndex: number;
    onClose: () => void;
}

export default function EmbedSortBtn(props: any) {
    const { range, colIndex, onClose } = props as IEmbedSortBtnProps;

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

    return (
        <div className={styles.embedSortBtnContainer}>
            <div
                className={`
                  ${styles.embedSortBtn}
                  ${styles.embedSortBtnAsc}
                `}
                onClick={() => apply(true)}
            >
                <AscendingSingle className={styles.embedSortBtnIcon} />
                {localeService.t('sheets-sort.general.sort-asc')}
            </div>
            <div
                className={`
                  ${styles.embedSortBtn}
                  ${styles.embedSortBtnDesc}
                `}
                onClick={() => apply(false)}
            >
                <DescendingSingle className={styles.embedSortBtnIcon} />
                {localeService.t('sheets-sort.general.sort-desc')}
            </div>
        </div>
    );
}
