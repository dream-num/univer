import { Inject } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';

import { Disposable } from '../../Shared/lifecycle';
import { createPermissionItem } from '../../Shared/permission';
import { IUniverInstanceService } from '../instance/instance.service';
import { LifecycleStages, OnLifecycle } from '../lifecycle/lifecycle';
import { IPermissionService } from './permission.service';

@OnLifecycle(LifecycleStages.Starting, UniverPermissionService)
export class UniverPermissionService extends Disposable {
    constructor(
        @Inject(IPermissionService) private _permissionService: IPermissionService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._init();
    }

    private readonly _editable$ = new BehaviorSubject(createPermissionItem(false));
    readonly editable$ = this._editable$.asObservable();

    private _init() {
        // todo: 如何获得初始值.
        const getEditableFromJson = () => true;

        const editable = getEditableFromJson();
        const unitId = 'univer';
        const subComponentId = 'univer';

        const permission = this._permissionService.createPermissionItem(editable, unitId, subComponentId);
        this._permissionService.addPermissionItem(permission);
        this.disposeWithMe(
            this._permissionService.onPermissionChange(permission.id, (params) => {
                this._editable$.next(params);
            })
        );
        this._editable$.next(permission);
    }

    getEditable() {
        return this._editable$.getValue().value;
    }

    setEditable(v: boolean) {
        const currentValue = this._editable$.getValue();
        if (currentValue.value !== v) {
            this._permissionService.updatePermissionItem(currentValue.id, v);
        }
    }
}
