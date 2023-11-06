// eslint-disable-next-line import/no-extraneous-dependencies
import { SheetPermissionService } from '@univerjs/base-sheets';
import { CommandType, ICommand, UniverPermissionService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetEditableCommandParams {
    value: 'sheet' | 'univer';
}

export const SetEditable: ICommand = {
    id: 'debugger.operation.set.editable',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor, params: ISetEditableCommandParams) => {
        if (params.value === 'sheet') {
            const sheetPermissionService = accessor.get(SheetPermissionService);
            const editable = sheetPermissionService.getSheetEditable();
            sheetPermissionService.setEditable(!editable);
        } else {
            const univerPermissionService = accessor.get(UniverPermissionService);
            const editable = univerPermissionService.getEditable();
            univerPermissionService.setEditable(!editable);
        }
        return true;
    },
};
