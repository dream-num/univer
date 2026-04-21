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

import type { Metadata } from '@grpc/grpc-js';
import type { Observable } from 'rxjs';
import type { IError } from '../../univer/constants/errors';
import type {
    IUnitPermissionStrategy,
    IUnitRoleKV,
    IUser,
    ObjectScope,
    UnitAction,
    UnitObject,
    UnitRole,
    UnitShareScope,
} from '../../univer/permission';

export interface ICollaborator {
    id: string;
    role: UnitRole;
    subject: IUser | undefined;
}

interface IObjScope {
    edit: ObjectScope;
    read: ObjectScope;
}

export interface IPermissionPoint {
    objectID: string;
    unitID: string;
    objectType: UnitObject;
    name: string;
    /** @deprecated */
    shareOn: boolean;
    shareRole: UnitRole;
    creator: IUser | undefined;
    strategies: IUnitPermissionStrategy[];
    actions: IActionInfo[];
    shareScope: UnitShareScope;
    scope: IObjScope | undefined;
}

export interface ICreateRequest {
    objectType: UnitObject;
    selectRangeObject?: ICreateRequestSelectRangeObject | undefined;
    worksheetObject?: ICreateRequestWorksheetObject | undefined;
}

export interface ICreateRequestSelectRangeObject {
    collaborators: ICollaborator[];
    unitID: string;
    name: string;
    scope: IObjScope | undefined;
}

interface ICreateRequestWorksheetObject {
    collaborators: ICollaborator[];
    unitID: string;
    name: string;
    strategies: IUnitPermissionStrategy[];
    scope: IObjScope | undefined;
}

export interface ICreateResponse {
    error: IError | undefined;
    objectID: string;
}

export interface IUpdatePermPointRequest {
    objectType: UnitObject;
    objectID: string;
    unitID: string;
    share: IUpdatePermPointRequestShare | undefined;
    name: string;
    strategies: IUnitPermissionStrategy[];
    scope: IObjScope | undefined;
    collaborators: IUpdatePermPointRequestCollaborators | undefined;
}

interface IUpdatePermPointRequestShare {
    /** @deprecated */
    on: boolean;
    role: UnitRole;
    scope: UnitShareScope;
}

interface IUpdatePermPointRequestCollaborators {
    collaborators: ICollaborator[];
}

interface IUpdatePermPointResponse {
    error: IError | undefined;
}

export interface IListPermPointRequest {
    unitID: string;
    objectIDs: string[];
    actions: UnitAction[];
}

export interface IListPermPointResponse {
    error: IError | undefined;
    objects: IPermissionPoint[];
}

export interface ICreateCollaboratorRequest {
    objectID: string;
    unitID: string;
    collaborators: ICollaborator[];
}

interface ICreateCollaboratorResponse {
    error: IError | undefined;
}

export interface IUpdateCollaboratorRequest {
    objectID: string;
    unitID: string;
    collaborator: ICollaborator | undefined;
}

export interface IUpdateCollaboratorResponse {
    error: IError | undefined;
}

export interface IDeleteCollaboratorRequest {
    objectID: string;
    unitID: string;
    collaboratorID: string;
}

export interface IDeleteCollaboratorResponse {
    error: IError | undefined;
}

export interface IListCollaboratorRequest {
    objectID: string;
    unitID: string;
}

export interface IListCollaboratorResponse {
    error: IError | undefined;
    collaborators: ICollaborator[];
    cfgEnableObjInherit: boolean;
}

export interface IPutCollaboratorsRequest {
    objectID: string;
    unitID: string;
    collaborators: ICollaborator[];
}

export interface IPutCollaboratorsResponse {
    error: IError | undefined;
}

export interface IAllowedRequest {
    objectID: string;
    objectType: UnitObject;
    unitID: string;
    actions: UnitAction[];
}

export interface IActionInfo {
    action?: UnitAction | undefined;
    allowed?: boolean | undefined;
}

export interface IAllowedResponse {
    error: IError | undefined;
    actions: IActionInfo[];
}

interface IBatchAllowedRequest {
    requests: IAllowedRequest[];
}

interface IObjectActionInfo {
    unitID: string;
    objectID: string;
    actions: IActionInfo[];
}

export interface IBatchAllowedResponse {
    error: IError | undefined;
    objectActions: IObjectActionInfo[];
}

export interface IListRolesRequest {
    objectType: UnitObject;
}

export interface IListRolesResponse {
    error: IError | undefined;
    roles: IUnitRoleKV[];
    actions: UnitAction[];
    defaultStrategies: IUnitPermissionStrategy[];
}

export interface IAuthzService {
    /** create a permission mount point for specified type of object */
    Create(request: ICreateRequest, metadata?: Metadata): Observable<ICreateResponse>;
    /**
     * update a permission mount point
     * selectrange and worksheet may not used if unit record the permission point in mutation by itself.
     * workbook and document use it to set share mode.
     */
    Update(request: IUpdatePermPointRequest, metadata?: Metadata): Observable<IUpdatePermPointResponse>;
    /**
     * list all permission mount points for unit
     * it may not used if unit record the permission point in mutation by itself
     */
    List(request: IListPermPointRequest, metadata?: Metadata): Observable<IListPermPointResponse>;
    /** request a couple of actions, return the allowed actions */
    Allowed(request: IAllowedRequest, metadata?: Metadata): Observable<IAllowedResponse>;
    /** barch check if the actions are allowed */
    BatchAllowed(request: IBatchAllowedRequest, metadata?: Metadata): Observable<IBatchAllowedResponse>;
    /** list object roles for specified object */
    ListRoles(request: IListRolesRequest, metadata?: Metadata): Observable<IListRolesResponse>;
    /** new collaborator for specified object */
    CreateCollaborator(request: ICreateCollaboratorRequest, metadata?: Metadata): Observable<ICreateCollaboratorResponse>;
    /** list all collaborators for specified object */
    ListCollaborators(request: IListCollaboratorRequest, metadata?: Metadata): Observable<IListCollaboratorResponse>;
    /** update collaborator for specified object */
    UpdateCollaborator(request: IUpdateCollaboratorRequest, metadata?: Metadata): Observable<IUpdateCollaboratorResponse>;
    /** delete collaborator for specified object */
    DeleteCollaborator(request: IDeleteCollaboratorRequest, metadata?: Metadata): Observable<IDeleteCollaboratorResponse>;
    /** put collaborators for specified object */
    PutCollaborators(request: IPutCollaboratorsRequest, metadata?: Metadata): Observable<IPutCollaboratorsResponse>;
}
