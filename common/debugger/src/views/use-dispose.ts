import type { Univer } from '@univerjs/core';
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
            const debuggerWindow = window as typeof window & { univer?: Univer };
            debuggerWindow.univer?.dispose();
            Reflect.deleteProperty(debuggerWindow, 'univer');
            Reflect.deleteProperty(debuggerWindow, 'univerAPI');
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
