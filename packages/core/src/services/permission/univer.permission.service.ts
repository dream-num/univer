import { Inject } from '@wendellhu/redi';

import { Disposable } from '../../Shared/lifecycle';
import { IUniverInstanceService } from '../instance/instance.service';
import { LifecycleStages, OnLifecycle } from '../lifecycle/lifecycle';
import { IPermissionService } from './permission.service';
import { UniverEditablePermission } from './permissionEnum';

@OnLifecycle(LifecycleStages.Starting, UniverPermissionService)
export class UniverPermissionService extends Disposable {
    constructor(
        @Inject(IPermissionService) private _permissionService: IPermissionService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._init();
    }

    private _init() {
        const univerEditablePermission = new UniverEditablePermission();
        this._permissionService.addPermissionItem(univerEditablePermission);
    }

    getEditable() {
        const univerEditablePermission = new UniverEditablePermission();
        const permission = this._permissionService.getPermissionItem(univerEditablePermission.id);
        return permission.value;
    }

    setEditable(v: boolean) {
        const univerEditablePermission = new UniverEditablePermission();
        this._permissionService.updatePermissionItem(univerEditablePermission.id, v);
    }
}
