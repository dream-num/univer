import { IConfirmService } from '@univerjs/core';
import { IDialogService, useDependency } from '@univerjs/ui';

const menu = [
    {
        label: 'Open dialog',
        value: 'dialog',
    },
    {
        label: 'Draggable dialog',
        value: 'draggable',
    },
    {
        label: 'Open confirm',
        value: 'confirm',
    },
];

export function useDialog() {
    const dialogService = useDependency(IDialogService);
    const confirmService = useDependency(IConfirmService);

    const onSelect = (value: string) => {
        if (value === 'draggable') {
            dialogService.open({
                id: 'draggable',
                children: { title: 'Draggable Dialog Content' },
                title: { title: 'Draggable Dialog' },
                draggable: true,
                destroyOnClose: true,
                preservePositionOnDestroy: true,
                width: 350,
                onClose() {
                    // dialogService.close('draggable');
                },
                onOpenChange(open: boolean) {
                    if (!open) {
                        dialogService.close('draggable');
                    }
                },
            });
        } else if (value === 'dialog') {
            dialogService.open({
                id: 'dialog1',
                children: { title: 'Dialog Content' },
                footer: { title: 'Dialog Footer' },
                title: { title: 'Dialog Title' },
                draggable: false,
                onClose() {
                    // dialogService.close('dialog1');
                },
                onOpenChange(open: boolean) {
                    if (!open) {
                        dialogService.close('dialog1');
                    }
                },
            });
        } else if (value === 'confirm') {
            confirmService.open({
                id: 'confirm1',
                children: { title: 'Confirm Content' },
                title: { title: 'Confirm Title' },
                confirmText: 'hello',
                cancelText: 'world',
                onClose() {
                    confirmService.close('confirm1');
                },
            });

            confirmService.open({
                id: 'confirm2',
                children: { title: 'Confirm2 Content' },
                title: { title: 'Confirm2 Title' },
                onClose() {
                    confirmService.close('confirm2');
                },
            });
        }
    };

    return {
        type: 'subItem' as const,
        children: '💬 Dialog & Confirm',
        options: menu.map((item) => ({
            type: 'item' as const,
            children: item.label,
            onSelect: () => onSelect(item.value),
        })),
    };
}
