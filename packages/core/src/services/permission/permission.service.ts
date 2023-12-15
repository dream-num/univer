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

import { createIdentifier, Inject } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import type { PermissionPoint } from '../../shared';
import { Disposable, PermissionStatus, toDisposable } from '../../shared';
import type { Nullable } from '../../shared/types';
import { IUniverInstanceService } from '../instance/instance.service';
import { LifecycleStages, OnLifecycle } from '../lifecycle/lifecycle';
import { IResourceManagerService } from '../resource-manager/type';

export interface IPermissionService {
    deletePermissionPoint(unitID: string, id: string): void;
    addPermissionPoint(unitID: string, item: PermissionPoint): boolean;
    updatePermissionPoint(unitID: string, id: string, value: any): void;
    getPermissionPoint(unitID: string, id: string): Nullable<PermissionPoint>;
    composePermission$(unitID: string, permissionIdList: string[]): Observable<PermissionPoint[]>;
    composePermission(unitID: string, permissionIdList: string[]): PermissionPoint[];
}

export const IPermissionService = createIdentifier<IPermissionService>('univer.permission-service');
const resourceKey = 'PERMISSION';

@OnLifecycle(LifecycleStages.Starting, PermissionService)
export class PermissionService extends Disposable implements IPermissionService {
    private _permissionPointMap: Map<string, Map<string, BehaviorSubject<PermissionPoint>>> = new Map();

    constructor(
        @Inject(IResourceManagerService) private _resourceManagerService: IResourceManagerService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService
    ) {
        super();
        // this._init();
    }

    private _init() {
        this.disposeWithMe(
            toDisposable(
                this._univerInstanceService.sheetAdded$.subscribe((workbook) => {
                    this._resourceManagerService.registerPluginResource(workbook.getUnitId(), resourceKey, {
                        onChange: (unitID, value) => {
                            (value as PermissionPoint[]).forEach((permissionPoint) => {
                                if (this.getPermissionPoint(unitID, permissionPoint.id)) {
                                    this.updatePermissionPoint(unitID, permissionPoint.id, permissionPoint.value);
                                } else {
                                    this.addPermissionPoint(unitID, permissionPoint);
                                }
                            });
                        },
                        toJson: (unitID: string) => this._toJson(unitID),
                        parseJson: (json: string) => this._parseJson(json),
                    });
                })
            )
        );
        this.disposeWithMe(
            toDisposable(
                this._univerInstanceService.sheetDisposed$.subscribe((workbook) => {
                    this._resourceManagerService.disposePluginResource(workbook.getUnitId(), resourceKey);
                })
            )
        );
    }

    private _toJson(unitID: string) {
        const permissionMap = this._permissionPointMap.get(unitID);
        let list: PermissionPoint[] = [];
        if (permissionMap) {
            list = [...permissionMap.keys()].reduce((pre, key) => {
                const value = permissionMap.get(key);
                if (value) {
                    pre.push(value.getValue());
                }
                return pre;
            }, [] as PermissionPoint[]);
        }
        return JSON.stringify(list);
    }

    private _parseJson(json: string) {
        return JSON.parse(json);
    }

    deletePermissionPoint = (unitID: string, id: string) => {
        const permissionMap = this._permissionPointMap.get(unitID);
        if (permissionMap) {
            const subject = permissionMap.get(id);
            if (subject) {
                subject.complete();
                this._permissionPointMap.delete(id);
            }
        }
    };

    addPermissionPoint = (unitID: string, item: PermissionPoint) => {
        const permissionMap =
            this._permissionPointMap.get(unitID) || new Map<string, BehaviorSubject<PermissionPoint>>();
        if (!permissionMap.has(item.id)) {
            permissionMap.set(item.id, new BehaviorSubject(item));
            this._permissionPointMap.set(unitID, permissionMap);
            return true;
        }
        return false;
    };

    updatePermissionPoint = (unitID: string, permissionId: string, value: any) => {
        const permissionMap = this._permissionPointMap.get(unitID);
        if (!permissionMap) {
            return;
        }
        const permissionSubject = permissionMap.get(permissionId);
        if (permissionSubject) {
            const subject = permissionSubject.getValue() as PermissionPoint;
            subject.value = value;
            subject.status = PermissionStatus.DONE;
            permissionSubject.next(subject);
        }
    };

    getPermissionPoint = (unitID: string, permissionId: string) => {
        const permissionMap = this._permissionPointMap.get(unitID);
        if (!permissionMap) return;
        const item = permissionMap.get(permissionId);
        if (item) {
            return item.getValue();
        }
    };

    composePermission$(unitID: string, permissionIdList: string[]) {
        const permissionMap = this._permissionPointMap.get(unitID);
        const subjectList = permissionIdList.map((id) => {
            const subject = permissionMap?.get(id);
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

    composePermission(unitID: string, permissionIdList: string[]) {
        const permissionMap = this._permissionPointMap.get(unitID);

        const valueList = permissionIdList.map((id) => {
            const subject = permissionMap?.get(id);
            if (!subject) {
                throw new Error(`${id} permissionPoint is not exist`);
            }
            return subject.getValue();
        });
        return valueList;
    }
}
