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

import type { ISelectionWithStyle } from '@univerjs/sheets';
import type { IMenuItemFrozenProps } from './interface';
import { LocaleService, Tools } from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { IContextMenuService, useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';

const defaultValue = {
    row: '1',
    col: 'A',
};

export const MenuItemFrozen = (props: IMenuItemFrozenProps) => {
    const { type } = props;

    const localeService = useDependency(LocaleService);
    const contextMenuService = useDependency(IContextMenuService);
    const selectionManagerService = useDependency(SheetsSelectionsService);

    const [value, setValue] = useState<{
        row: string;
        col: string;
    }>(defaultValue);

    const updateValue = (selection: ISelectionWithStyle) => {
        if (!selection) {
            return;
        }

        const { primary, range } = selection;
        const row = primary?.startRow ?? range.startRow;
        const col = primary?.startColumn ?? range.startColumn;

        setValue({
            row: row === 0 ? '1' : String(row),
            col: col === 0 ? 'A' : Tools.chatAtABC(col - 1),
        });
    };

    useEffect(() => {
        if (contextMenuService.visible) {
            updateValue(selectionManagerService.getCurrentLastSelection() as ISelectionWithStyle);
        }
    }, [contextMenuService.visible]);

    return (
        <>
            {type === 'row' && localeService.t('rightClick.freezeRow', value.row)}
            {type === 'col' && localeService.t('rightClick.freezeCol', value.col)}
            {type === 'all' && localeService.t('rightClick.freezeCell', value.row, value.col)}
        </>
    );
};
