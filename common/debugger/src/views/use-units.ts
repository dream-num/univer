import type { Workbook } from '@univerjs/core';
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { useDependency, useObservable } from '@univerjs/ui';

const defaultMenu = [
    {
        label: 'Create another sheet',
        value: 'create',
    },
];

export function useUnits() {
    const univerInstanceService = useDependency(IUniverInstanceService);
    useObservable(univerInstanceService.unitAdded$);
    useObservable(univerInstanceService.unitDisposed$);

    const sheets = univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
    const menu = [
        ...defaultMenu,
        ...sheets.map((sheet) => ({
            label: sheet.name || sheet.getUnitId(),
            value: sheet.getUnitId(),
        })),
    ];

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
