import { createIdentifier } from '@wendellhu/redi';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';

import { Disposable } from '../../shared/lifecycle';
import { PermissionPoint, PermissionStatus } from '../../shared/permission';
import { LifecycleStages, OnLifecycle } from '../lifecycle/lifecycle';

export interface IPermissionService {
    deletePermissionItem(id: string): void;
    addPermissionItem<T = any>(item: PermissionPoint<T>): boolean;
    updatePermissionItem(id: string, value: any): void;
    getPermissionItem<T = any>(id: string): PermissionPoint<T>;
    composePermission$(permissionIdList: string[]): Observable<PermissionPoint[]>;
    composePermission(permissionIdList: string[]): PermissionPoint[];
}
export const IPermissionService = createIdentifier<IPermissionService>('univer.permission-service');

@OnLifecycle(LifecycleStages.Starting, PermissionService)
export class PermissionService extends Disposable implements IPermissionService {
    constructor(initPermissionConfig: PermissionPoint[] = []) {
        super();
        initPermissionConfig.forEach((item) => {
            this.permissionItemMap.set(item.id, new BehaviorSubject<PermissionPoint>(item));
        });
    }

    private permissionItemMap: Map<string, BehaviorSubject<PermissionPoint>> = new Map();

    deletePermissionItem = (id: string) => {
        const subject = this.permissionItemMap.get(id);
        if (subject) {
            subject.complete();
            this.permissionItemMap.delete(id);
        }
    };

    addPermissionItem = (item: PermissionPoint) => {
        if (!this.permissionItemMap.has(item.id)) {
            this.permissionItemMap.set(item.id, new BehaviorSubject(item));
            return true;
        }
        return false;
    };

    updatePermissionItem = <T = any>(permissionId: string, value: T) => {
        const permissionSubject = this.permissionItemMap.get(permissionId);
        if (permissionSubject) {
            const subject = permissionSubject.getValue() as PermissionPoint<T>;
            subject.value = value;
            subject.status = PermissionStatus.DONE;
            permissionSubject.next(subject);
        }
    };

    getPermissionItem = (permissionId: string) => {
        const item = this.permissionItemMap.get(permissionId);
        if (item) {
            return item.getValue();
        }
        throw new Error(`${permissionId} permissionItem does not exist`);
    };

    composePermission$(permissionIdList: string[]) {
        const subjectList = permissionIdList.map((id) => {
            const subject = this.permissionItemMap.get(id);
            if (!subject) {
                throw new Error(`${id} permission is not exist`);
            }
            return subject.asObservable();
        });
        return combineLatest(subjectList);
    }

    composePermission(permissionIdList: string[]) {
        const valueList = permissionIdList.map((id) => {
            const subject = this.permissionItemMap.get(id);
            if (!subject) {
                throw new Error(`${id} permission is not exist`);
            }
            return subject.getValue();
        });
        return valueList;
    }
}
