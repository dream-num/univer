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
import { Button, ButtonGroup } from '@univerjs/design';
import { AscendingIcon, DescendingIcon } from '@univerjs/icons';
import { getSheetCommandTarget } from '@univerjs/sheets';
import { SheetsSortService } from '@univerjs/sheets-sort';
import { useDependency, useObservable } from '@univerjs/ui';
import { useCallback } from 'react';
import { map, startWith } from 'rxjs';
import type { LocaleKey } from '../locale/types';
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
    const sheetsSortService = useDependency(SheetsSortService);
    const disabled = useObservable(() => sheetsSortService.sortGuardsChanged$.pipe(
        startWith(0),
        map(() => {
            const target = getSheetCommandTarget(univerInstanceService);
            return !target || !range || !sheetsSortService.canSort({ ...target, range });
        })
    ), false, true, [sheetsSortService, univerInstanceService, range]);

    const apply = useCallback(async (asc: boolean) => {
        const { unitId, subUnitId } = getSheetCommandTarget(univerInstanceService) || {};
        if (!range || !unitId || !subUnitId || !sheetsSortService.canSort({ unitId, subUnitId, range })) {
            return;
        }
        const noTitleRange = { ...range, startRow: range.startRow + 1 };
        await sheetsSortUIService.triggerSortDirectly(asc, false, { unitId, subUnitId, range: noTitleRange, colIndex });

        onClose();
    }, [range, colIndex, sheetsSortService, sheetsSortUIService, univerInstanceService, onClose]);

    return (
        <ButtonGroup className="univer-mb-3 univer-w-full univer-grid-cols-2">
            <Button disabled={disabled} onClick={() => apply(true)}>
                <AscendingIcon />
                {localeService.t<LocaleKey>('sheets-sort-ui.general.sort-asc')}
            </Button>
            <Button disabled={disabled} onClick={() => apply(false)}>
                <DescendingIcon />
                {localeService.t<LocaleKey>('sheets-sort-ui.general.sort-desc')}
            </Button>
        </ButtonGroup>
    );
}
