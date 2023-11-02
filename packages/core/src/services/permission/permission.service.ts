import { createIdentifier, IDisposable } from '@wendellhu/redi';

import { Disposable, toDisposable } from '../../shared/lifecycle';
import { createPermissionId, PermissionItem } from '../../shared/permission';
import { LifecycleStages, OnLifecycle } from '../lifecycle/lifecycle';

export interface IPermissionService {
    createPermissionItem<T = any>(initValue: T, unitId: string, subComponentId: string): PermissionItem<T>;
    deletePermissionItem(id: string): void;
    addPermissionItem<T = any>(item: PermissionItem<T>): void;
    updatePermissionItem<T>(id: string, value: T): void;
    getPermissionItem<T = any>(id: string): PermissionItem<T>;
    onPermissionChange<T = any>(id: string, callback: (params: PermissionItem<T>) => void): IDisposable;
}
export const IPermissionService = createIdentifier<PermissionService>('univer.permission-service');

@OnLifecycle(LifecycleStages.Starting, PermissionService)
export class PermissionService extends Disposable implements IPermissionService {
    constructor(initPermissionConfig: PermissionItem[] = []) {
        super();
        this.permissionItemMap = initPermissionConfig.reduce((result, current) => {
            result.set(current.id, current);
            return result;
        }, new Map<string, PermissionItem>());
    }

    private permissionItemMap: Map<string, PermissionItem> = new Map();
    private permissionItemChangeCallback: Map<string, Set<(params: PermissionItem) => void>> = new Map();

    createPermissionItem = <T = any>(initValue: T, unitId: string, subComponentId: string) =>
        new PermissionItem({ id: createPermissionId(), value: initValue }, unitId, subComponentId);

    deletePermissionItem = (id: string) => {
        this.permissionItemMap.delete(id);
        this.permissionItemChangeCallback.delete(id);
    };

    addPermissionItem = (item: PermissionItem) => {
        if (!this.permissionItemMap.has(item.id)) {
            this.permissionItemMap.set(item.id, item);
        } else {
            throw new Error('permissionItem is exist');
        }
    };

    updatePermissionItem = <T = any>(id: string, value: T) => {
        const permissionItem = this.getPermissionItem(id, true);
        permissionItem.value = value;
        this.emitPermissionChange(id);
    };

    getPermissionItem = (id: string, isRef = false) => {
        const item = this.permissionItemMap.get(id);
        if (item) {
            return isRef ? item : item.clone();
        }
        throw new Error('permissionItem does not exist exist');
    };

    onPermissionChange = (id: string, callback: (params: PermissionItem) => void) => {
        let cbList = this.permissionItemChangeCallback.get(id);
        if (!cbList) {
            cbList = new Set();
        }
        cbList.add(callback);
        this.permissionItemChangeCallback.set(id, cbList);
        return toDisposable(() => {
            if (cbList) {
                cbList.delete(callback);
                if (!cbList.size) {
                    this.permissionItemChangeCallback.delete(id);
                }
            }
        });
    };

    private emitPermissionChange(id: string) {
        const cbList = this.permissionItemChangeCallback.get(id);
        const permissionItem = this.permissionItemMap.get(id);
        if (cbList && permissionItem) {
            cbList.forEach((fn) => fn(permissionItem));
        }
    }
}
