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

import type { UnitAction, UnitObject } from '@univerjs/protocol';
import type { BehaviorSubject, Observable } from 'rxjs';
import type { Nullable } from '../../shared/types';
import type { IRange } from '../../sheets/typedef';
import { createIdentifier } from '../../common/di';

export enum PermissionStatus {
    INIT = 'init',
    FETCHING = 'fetching',
    DONE = 'done',
}

export type WorkbookPermissionPointConstructor = new (unitId: string) => IPermissionPoint;
export type WorkSheetPermissionPointConstructor = new (unitId: string, subUnitId: string) => IPermissionPoint;
export type RangePermissionPointConstructor = new (unitId: string, subUnitId: string, permissionId: string) => IPermissionPoint;

export interface IPermissionTypes {
    rangeTypes?: RangePermissionPointConstructor[];
    worksheetTypes?: WorkSheetPermissionPointConstructor[];
    workbookTypes?: WorkbookPermissionPointConstructor[];
}

export interface IPermissionPoint<V = boolean> {
    type: UnitObject;
    id: string;
    status: PermissionStatus;
    subType: UnitAction;
    value: V;
}

export interface IPermissionParam {
    unitId: string;
    subUnitId: string;
    range?: IRange;
}

export interface IPermissionService {
    permissionPointUpdate$: Observable<IPermissionPoint<unknown>>;
    deletePermissionPoint(permissionId: string): void;
    addPermissionPoint<T = boolean>(permissionPoint: IPermissionPoint<T> | BehaviorSubject<IPermissionPoint<T>>): boolean;
    updatePermissionPoint<T = boolean>(permissionId: string, value: T): void;
    getPermissionPoint<T = boolean>(permissionId: string): Nullable<IPermissionPoint<T>>;
    getPermissionPoint$<T = boolean>(permissionId: string): Nullable<Observable<IPermissionPoint<T>>>;
    clearPermissionMap(): void;

    composePermission$(permissionId: string[]): Observable<IPermissionPoint<unknown>[]>;
    composePermission(permissionId: string[]): IPermissionPoint<unknown>[];
    getAllPermissionPoint(): Map<string, Observable<IPermissionPoint<unknown>>>;

    getShowComponents(): boolean;
    setShowComponents(showComponents: boolean): void;
}

export const IPermissionService = createIdentifier<IPermissionService>('univer.permission-service');
