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
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useState } from 'react';

const defaultMenu = [
    {
        label: 'Create another sheet',
        value: 'create',
    },
];

export function useUnits() {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const [menu, setMenu] = useState<{ label: string; value: string }[]>([...defaultMenu]);
    const unitAdded = useObservable(univerInstanceService.unitAdded$);
    const unitDisposed = useObservable(univerInstanceService.unitDisposed$);

    useEffect(() => {
        const sheets = univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        const options = sheets.map((sheet) => ({
            label: sheet.getName() || sheet.getUnitId(),
            value: sheet.getUnitId(),
        }));

        setMenu([
            ...defaultMenu,
            ...(options as any[]),
        ]);
    }, [unitAdded, unitDisposed]);

    const onSelect = (value: string) => {
        if (value === 'create') {
            univerInstanceService.createUnit(UniverInstanceType.UNIVER_SHEET, {});
        } else {
            if (!univerInstanceService.getUnit(value)) return false;
            univerInstanceService.setCurrentUnitForType(value);
        }
    };

    return {
        type: 'subItem' as const,
        children: '🪸 Units',
        options: menu.map((item) => ({
            type: 'item' as const,
            children: item.label,
            onSelect: () => onSelect(item.value),
        })),
    };
}
