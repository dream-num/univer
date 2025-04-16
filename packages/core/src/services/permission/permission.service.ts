/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Observable } from 'rxjs';
import type { IPermissionPoint, IPermissionService } from './type';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Disposable } from '../../shared';
import { PermissionStatus } from './type';

export class PermissionService extends Disposable implements IPermissionService {
    private _permissionPointMap: Map<string, BehaviorSubject<IPermissionPoint<any>>> = new Map();

    private _permissionPointUpdate$ = new Subject<IPermissionPoint<unknown>>();
    public permissionPointUpdate$ = this._permissionPointUpdate$.asObservable();

    private _showComponents = true;

    setShowComponents(showComponents: boolean) {
        this._showComponents = showComponents;
    }

    getShowComponents() {
        return this._showComponents;
    }

    deletePermissionPoint(permissionId: string) {
        const permissionPoint = this._permissionPointMap.get(permissionId);
        if (permissionPoint) {
            permissionPoint.complete();
            this._permissionPointMap.delete(permissionId);
        }
    };

    addPermissionPoint<T = boolean>(_item: IPermissionPoint<T> | BehaviorSubject<IPermissionPoint<T>>) {
        const isSubject = _item instanceof BehaviorSubject;
        const item = isSubject ? _item.getValue() : _item;
        if (!item.id) {
            return false;
        }
        const permissionPoint = this._permissionPointMap.get(item.id);
        if (permissionPoint) {
            throw new Error(`${item.id} PermissionPoint already exists`);
        }
        this._permissionPointMap.set(item.id, isSubject ? _item : new BehaviorSubject<IPermissionPoint<unknown>>(item));
        this._permissionPointUpdate$.next(item);
        return true;
    };

    updatePermissionPoint<T = boolean>(permissionId: string, value: T) {
        const permissionPoint = this._permissionPointMap.get(permissionId);
        if (!permissionPoint) {
            return;
        }
        const subject = permissionPoint.getValue() as IPermissionPoint<T>;
        subject.value = value;
        subject.status = PermissionStatus.DONE;
        permissionPoint.next(subject);
        this._permissionPointUpdate$.next(subject);
    };

    clearPermissionMap() {
        this._permissionPointMap.clear();
    };

    getPermissionPoint<T = boolean>(permissionId: string) {
        const permissionPoint = this._permissionPointMap.get(permissionId);
        if (!permissionPoint) return;
        return permissionPoint.getValue() as IPermissionPoint<T>;
    };

    getPermissionPoint$<T = boolean>(permissionId: string) {
        const permissionPoint = this._permissionPointMap.get(permissionId);
        if (!permissionPoint) return;
        return permissionPoint as Observable<IPermissionPoint<T>>;
    };

    composePermission$(permissionIdList: string[]) {
        const subjectList = permissionIdList.map((id) => {
            const subject = this._permissionPointMap?.get(id);
            if (!subject) {
                throw new Error(`[PermissionService]: ${id} permissionPoint does not exist!`);
            }
            return subject.asObservable();
        });

        return combineLatest(subjectList).pipe(
            // Check that all permissions exist
            map((list) => {
                return list;
            })
        );
    }

    composePermission(permissionIdList: string[]) {
        const valueList = permissionIdList.map((id) => {
            const subject = this._permissionPointMap?.get(id);
            if (!subject) {
                throw new Error(`[PermissionService]: ${id} permissionPoint does not exist!`);
            }
            return subject.getValue();
        });

        return valueList;
    }

    getAllPermissionPoint() {
        const cacheMap = new Map<string, BehaviorSubject<IPermissionPoint<unknown>>>();
        this._permissionPointMap.forEach((v, key) => {
            cacheMap.set(key, v);
        });
        return cacheMap;
    }
}
