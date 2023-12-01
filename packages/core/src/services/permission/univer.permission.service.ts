import { Inject } from '@wendellhu/redi';

import { Disposable } from '../../shared';
import { IUniverInstanceService } from '../instance/instance.service';
import { LifecycleStages, OnLifecycle } from '../lifecycle/lifecycle';
import { IPermissionService } from './permission.service';
import { UniverEditablePermission } from './permission-point';

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
        this._univerInstanceService.sheetAdded$.subscribe((workbook) => {
            const univerEditablePermission = new UniverEditablePermission(workbook.getUnitId());
            this._permissionService.addPermissionPoint(workbook.getUnitId(), univerEditablePermission);
        });
    }

    getEditable(unitID?: string) {
        let workbookId = unitID;
        if (!workbookId) {
            workbookId = this._univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        }
        const univerEditablePermission = new UniverEditablePermission(workbookId);
        const permission = this._permissionService.getPermissionPoint(workbookId, univerEditablePermission.id);
        return permission?.value;
    }

    setEditable(unitID: string, v: boolean) {
        const univerEditablePermission = new UniverEditablePermission(unitID);
        this._permissionService.updatePermissionPoint(unitID, univerEditablePermission.id, v);
    }
}
