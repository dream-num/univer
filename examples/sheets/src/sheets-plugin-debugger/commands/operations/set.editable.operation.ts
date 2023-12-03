// eslint-disable-next-line import/no-extraneous-dependencies
import { SheetPermissionService } from '@univerjs/sheets';
import { CommandType, ICommand, IUniverInstanceService, UniverPermissionService } from '@univerjs/core';
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
            sheetPermissionService.setSheetEditable(!editable);
        } else {
            const univerPermissionService = accessor.get(UniverPermissionService);
            const univerInstanceService = accessor.get(IUniverInstanceService);
            const unitId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
            const editable = univerPermissionService.getEditable(unitId);
            univerPermissionService.setEditable(unitId, !editable);
        }
        return true;
    },
};
