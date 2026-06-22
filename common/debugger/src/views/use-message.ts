import { MessageType } from '@univerjs/design';
import { IMessageService, useDependency } from '@univerjs/ui';

const menu = [
    {
        label: 'Open message',
        value: '',
    },
    {
        label: 'Open loading message',
        value: 'loading',
    },
];

export function useMessage() {
    const messageService = useDependency(IMessageService);

    const onSelect = (value: string) => {
        if (value === 'loading') {
            messageService.show({
                type: MessageType.Loading,
                content: 'Loading message',
                duration: 3000,
            });
        } else {
            messageService.show({
                type: MessageType.Success,
                content: 'Demo message',
                duration: 1500,
            });
        }
    };

    return {
        type: 'subItem' as const,
        children: '✉️ Message',
        options: menu.map((item) => ({
            type: 'item' as const,
            children: item.label,
            onSelect: () => onSelect(item.value),
        })),
    };
}
