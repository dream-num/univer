/**
 * Copyright 2023-present DreamNum Inc.
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
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Disposable } from '../../shared';
import type { IPermissionPoint, IPermissionService } from './type';
import { PermissionStatus } from './type';

export class PermissionService extends Disposable implements IPermissionService {
    private _permissionPointMap: Map<string, BehaviorSubject<IPermissionPoint<unknown>>> = new Map();

    private _permissionPointUpdate$ = new Subject<IPermissionPoint<unknown>>();

    public permissionPointUpdate$ = this._permissionPointUpdate$.asObservable();

    deletePermissionPoint = (permissionId: string) => {
        const permissionPoint = this._permissionPointMap.get(permissionId);
        if (permissionPoint) {
            permissionPoint.complete();
            this._permissionPointMap.delete(permissionId);
        }
    };

    addPermissionPoint = <T = boolean>(item: IPermissionPoint<T>) => {
        if (!item.id) {
            return false;
        }
        this._permissionPointMap.set(item.id, new BehaviorSubject<IPermissionPoint<unknown>>(item));
        this._permissionPointUpdate$.next(item);
        return true;
    };

    updatePermissionPoint = <T = boolean>(permissionId: string, value: T) => {
        const permissionPoint = this._permissionPointMap.get(permissionId);
        if (!permissionPoint) {
            return;
        }
        const subject = permissionPoint.getValue() as IPermissionPoint<T>;
        subject.value = value;
        subject.status = PermissionStatus.DONE;
        permissionPoint.next({ ...subject });
        this._permissionPointUpdate$.next(subject);
    };

    clearPermissionMap = () => {
        this._permissionPointMap.clear();
    };

    getPermissionPoint = <T = boolean>(permissionId: string) => {
        const permissionPoint = this._permissionPointMap.get(permissionId);
        if (!permissionPoint) return;
        return permissionPoint.getValue() as IPermissionPoint<T>;
    };

    getPermissionPoint$ = <T = boolean>(permissionId: string) => {
        const permissionPoint = this._permissionPointMap.get(permissionId);
        if (!permissionPoint) return;
        return permissionPoint as Observable<IPermissionPoint<T>>;
    };

    composePermission$(permissionIdList: string[]) {
        const subjectList = permissionIdList.map((id) => {
            const subject = this._permissionPointMap?.get(id);
            if (!subject) {
                throw new Error(`${id} permissionPoint is not exist`);
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
                throw new Error(`${id} permissionPoint is not exist`);
            }
            return subject.getValue();
        });
        return valueList;
    }
}
