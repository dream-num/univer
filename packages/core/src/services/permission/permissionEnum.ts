import { PermissionPoint } from '../../Shared/permission';

export const UniverEditablePermissionPoint = 'univer.editable';
export class UniverEditablePermission extends PermissionPoint<boolean> {
    id = UniverEditablePermissionPoint;
    value = true;
}
