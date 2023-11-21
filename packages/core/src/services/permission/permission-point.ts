import { PermissionPoint } from '../../shared';

export const UniverEditablePermissionPoint = 'univer.editable';
export class UniverEditablePermission extends PermissionPoint<boolean> {
    id = UniverEditablePermissionPoint;
    value = true;
    unitID: string;
    constructor(unitID: string) {
        super();
        this.unitID = unitID;
    }
}
