import { IDialogService } from '@univerjs/base-ui';
import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface IUIComponentCommandParams {
    value: string;
}

export const DialogOperation: ICommand = {
    id: 'debugger.operation.dialog',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: IUIComponentCommandParams) => {
        const dialogService = accessor.get(IDialogService);

        dialogService.open({
            visible: true,
            children: { title: 'Dialog Content' },
            footer: { title: 'Dialog Footer' },
            title: { title: 'Dialog Title' },
            draggable: true,
            onClose() {
                dialogService.close();
            },
        });

        return true;
    },
};
