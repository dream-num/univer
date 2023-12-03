import { PermissionPoint } from '@univerjs/core';

const SheetEditablePermissionPoint = 'univer.sheet.editable';

export class SheetEditablePermission extends PermissionPoint<boolean> {
    id = SheetEditablePermissionPoint;
    value = true;
    unitID: string;

    constructor(
        private _workbookId: string,
        private _worksheetId: string
    ) {
        super();
        this.unitID = _workbookId;
        this.id = `${SheetEditablePermissionPoint}_${_workbookId}_${_worksheetId}`;
    }
}
