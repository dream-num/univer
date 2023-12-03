import { ISidebarService } from '@univerjs/ui';
import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface IUIComponentCommandParams {
    value: string;
}

export const SidebarOperation: ICommand = {
    id: 'debugger.operation.sidebar',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: IUIComponentCommandParams) => {
        const sidebarService = accessor.get(ISidebarService);

        switch (params.value) {
            case 'open':
                sidebarService.open({
                    header: { title: 'debugger.sidebar.title' },
                    children: { title: 'Sidebar Content' },
                    footer: { title: 'Sidebar Footer' },
                });
                break;

            case 'close':
            default:
                sidebarService.close();
                break;
        }
        return true;
    },
};
