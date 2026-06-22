import { ISidebarService, useDependency } from '@univerjs/ui';
import { TEST_EDITOR_CONTAINER_COMPONENT } from './test-editor/component-name';

const menu = [
    {
        label: 'Open sidebar',
        value: 'open',
    },
    {
        label: 'Close sidebar',
        value: 'close',
    },
];

export function useSidebar() {
    const sidebarService = useDependency(ISidebarService);

    const onSelect = (value: string) => {
        if (value === 'open') {
            sidebarService.open({
                header: { title: 'Sidebar title' },
                children: { label: TEST_EDITOR_CONTAINER_COMPONENT },
                footer: { title: 'Sidebar Footer' },
                onClose: () => {
                },
            });
        } else if (value === 'close') {
            sidebarService.close();
        }
    };

    return {
        type: 'subItem' as const,
        children: '🧩 Sidebar',
        options: menu.map((item) => ({
            type: 'item' as const,
            children: item.label,
            onSelect: () => onSelect(item.value),
        })),
    };
}
