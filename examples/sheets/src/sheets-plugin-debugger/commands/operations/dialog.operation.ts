import type { ICommand } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import { IDialogService } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';

export interface IUIComponentCommandParams {
    value: string;
}

export const DialogOperation: ICommand = {
    id: 'debugger.operation.dialog',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: IUIComponentCommandParams) => {
        const dialogService = accessor.get(IDialogService);

        dialogService.open({
            id: 'dialog1',
            children: { title: 'Dialog Content' },
            footer: { title: 'Dialog Footer' },
            title: { title: 'Dialog Title' },
            draggable: false,
            onClose() {
                dialogService.close('dialog1');
            },
        });

        dialogService.open({
            id: 'dialog2',
            children: { title: 'Dialog2 Content' },
            footer: { title: 'Dialog2 Footer' },
            title: { title: 'Dialog2 Title' },
            draggable: true,
            onClose() {
                dialogService.close('dialog2');
            },
        });

        return true;
    },
};
