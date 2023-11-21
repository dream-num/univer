import { createIdentifier, Inject } from '@wendellhu/redi';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Disposable, PermissionPoint, PermissionStatus } from '../../shared';
import { LifecycleStages, OnLifecycle } from '../lifecycle/lifecycle';
import { IResourceManagerService } from '../resource-manager/type';

export interface IPermissionService {
    deletePermissionPoint(id: string): void;
    addPermissionPoint(item: PermissionPoint): boolean;
    updatePermissionPoint(id: string, value: any): void;
    getPermissionPoint(id: string): PermissionPoint;
    composePermission$(permissionIdList: string[]): Observable<PermissionPoint[]>;
    composePermission(permissionIdList: string[]): PermissionPoint[];
}
export const IPermissionService = createIdentifier<IPermissionService>('univer.permission-service');

@OnLifecycle(LifecycleStages.Starting, PermissionService)
export class PermissionService extends Disposable implements IPermissionService {
    private _permissionPointMap: Map<string, BehaviorSubject<PermissionPoint>> = new Map();

    constructor(@Inject(IResourceManagerService) private _resourceManagerService: IResourceManagerService) {
        super();
        this._init();
    }

    private _init() {
        this._resourceManagerService.registerPluginResource<PermissionPoint[]>('permission', {
            onChange: (value) => {
                value.forEach((permissionPoint) => {
                    this.addPermissionPoint(permissionPoint);
                });
            },
            toJson: () => this._toJson(),
            parseJson: (json: string) => this._parseJson(json),
        });
    }

    private _toJson() {
        const list = [...this._permissionPointMap.keys()].reduce((pre, key) => {
            const value = this._permissionPointMap.get(key);
            if (value) {
                pre.push(value.getValue());
            }
            return pre;
        }, [] as PermissionPoint[]);
        return JSON.stringify(list);
    }

    private _parseJson(json: string) {
        return JSON.parse(json);
    }

    deletePermissionPoint = (id: string) => {
        const subject = this._permissionPointMap.get(id);
        if (subject) {
            subject.complete();
            this._permissionPointMap.delete(id);
        }
    };

    addPermissionPoint = (item: PermissionPoint) => {
        if (!this._permissionPointMap.has(item.id)) {
            this._permissionPointMap.set(item.id, new BehaviorSubject(item));
            return true;
        }
        return false;
    };

    updatePermissionPoint = (permissionId: string, value: any) => {
        const permissionSubject = this._permissionPointMap.get(permissionId);
        if (permissionSubject) {
            const subject = permissionSubject.getValue() as PermissionPoint;
            subject.value = value;
            subject.status = PermissionStatus.DONE;
            permissionSubject.next(subject);
        }
    };

    getPermissionPoint = (permissionId: string) => {
        const item = this._permissionPointMap.get(permissionId);
        if (item) {
            return item.getValue();
        }
        throw new Error(`${permissionId} permissionPoint does not exist`);
    };

    composePermission$(permissionIdList: string[]) {
        const subjectList = permissionIdList.map((id) => {
            const subject = this._permissionPointMap.get(id);
            if (!subject) {
                throw new Error(`${id} permissionPoint is not exist`);
            }
            return subject.asObservable();
        });
        return combineLatest(subjectList).pipe(
            // Check that all permissions exist
            map((list) => {
                if (list.every((item) => this._permissionPointMap.get(item.id))) {
                    return list;
                }
                return list;
            })
        );
    }

    composePermission(permissionIdList: string[]) {
        const valueList = permissionIdList.map((id) => {
            const subject = this._permissionPointMap.get(id);
            if (!subject) {
                throw new Error(`${id} permissionPoint is not exist`);
            }
            return subject.getValue();
        });
        return valueList;
    }
}
