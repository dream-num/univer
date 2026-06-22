import { IUniverInstanceService } from '@univerjs/core';
import { useDependency } from '@univerjs/ui';

const menu = [
    {
        label: 'Dispose Univer',
        value: 'univer',
    },
    {
        label: 'Dispose current unit',
        value: 'unit',
    },
];

export function useDispose() {
    const univerInstanceService = useDependency(IUniverInstanceService);

    const onSelect = (value: string) => {
        if (value === 'univer') {
            window.univer?.dispose();
            window.univer = undefined;
            window.univerAPI = undefined;
        } else if (value === 'unit') {
            const focused = univerInstanceService.getFocusedUnit();
            if (!focused) return false;

            return univerInstanceService.disposeUnit(focused.getUnitId());
        }
    };

    return {
        type: 'subItem' as const,
        children: '🗑️ Dispose',
        options: menu.map((item) => ({
            type: 'item' as const,
            children: item.label,
            onSelect: () => onSelect(item.value),
        })),
    };
}
