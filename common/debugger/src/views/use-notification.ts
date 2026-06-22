import type { INotificationOptions } from '@univerjs/ui';
import { INotificationService, useDependency } from '@univerjs/ui';

const menu = [
    {
        label: 'Notification success',
        value: 'success',
    },
    {
        label: 'Notification info',
        value: 'info',
    },
    {
        label: 'Notification warning',
        value: 'warning',
    },
    {
        label: 'Notification error',
        value: 'error',
    },
];

export function useNotification() {
    const notificationService = useDependency(INotificationService);

    const onSelect = (value: string) => {
        notificationService.show({
            type: value as INotificationOptions['type'],
            content: 'Lorem Ipusm dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            title: 'Notification Title',
        });
    };

    return {
        type: 'subItem' as const,
        children: '🔔 Notification',
        options: menu.map((item) => ({
            type: 'item' as const,
            children: item.label,
            onSelect: () => onSelect(item.value),
        })),
    };
}
