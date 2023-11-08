import { createIdentifier } from '@wendellhu/redi';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Disposable } from '../../shared/lifecycle';
import { PermissionPoint, PermissionStatus } from '../../shared/permission';
import { LifecycleStages, OnLifecycle } from '../lifecycle/lifecycle';

export interface IPermissionService {
    deletePermissionPoint(id: string): void;
    addPermissionPoint<T = any>(item: PermissionPoint<T>): boolean;
    updatePermissionPoint(id: string, value: any): void;
    getPermissionPoint<T = any>(id: string): PermissionPoint<T>;
    composePermission$(permissionIdList: string[]): Observable<PermissionPoint[]>;
    composePermission(permissionIdList: string[]): PermissionPoint[];
}
export const IPermissionService = createIdentifier<IPermissionService>('univer.permission-service');

@OnLifecycle(LifecycleStages.Starting, PermissionService)
export class PermissionService extends Disposable implements IPermissionService {
    constructor(initPermissionConfig: PermissionPoint[] = []) {
        super();
        initPermissionConfig.forEach((item) => {
            this.permissionPointMap.set(item.id, new BehaviorSubject<PermissionPoint>(item));
        });
    }

    private permissionPointMap: Map<string, BehaviorSubject<PermissionPoint>> = new Map();

    deletePermissionPoint = (id: string) => {
        const subject = this.permissionPointMap.get(id);
        if (subject) {
            subject.complete();
            this.permissionPointMap.delete(id);
        }
    };

    addPermissionPoint = (item: PermissionPoint) => {
        if (!this.permissionPointMap.has(item.id)) {
            this.permissionPointMap.set(item.id, new BehaviorSubject(item));
            return true;
        }
        return false;
    };

    updatePermissionPoint = <T = any>(permissionId: string, value: T) => {
        const permissionSubject = this.permissionPointMap.get(permissionId);
        if (permissionSubject) {
            const subject = permissionSubject.getValue() as PermissionPoint<T>;
            subject.value = value;
            subject.status = PermissionStatus.DONE;
            permissionSubject.next(subject);
        }
    };

    getPermissionPoint = (permissionId: string) => {
        const item = this.permissionPointMap.get(permissionId);
        if (item) {
            return item.getValue();
        }
        throw new Error(`${permissionId} permissionPoint does not exist`);
    };

    composePermission$(permissionIdList: string[]) {
        const subjectList = permissionIdList.map((id) => {
            const subject = this.permissionPointMap.get(id);
            if (!subject) {
                throw new Error(`${id} permissionPoint is not exist`);
            }
            return subject.asObservable();
        });
        return combineLatest(subjectList).pipe(
            // Check that all permissions exist
            map((list) => {
                if (list.every((item) => this.permissionPointMap.get(item.id))) {
                    return list;
                }
                return list;
            })
        );
    }

    composePermission(permissionIdList: string[]) {
        const valueList = permissionIdList.map((id) => {
            const subject = this.permissionPointMap.get(id);
            if (!subject) {
                throw new Error(`${id} permissionPoint is not exist`);
            }
            return subject.getValue();
        });
        return valueList;
    }
}
