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

import type {
    IAllowedRequest,
    IAllowedResponse,
    IBatchAllowedResponse,
    ICreateCollaboratorRequest,
    ICreateRequest,
    ICreateResponse,
    IDeleteCollaboratorRequest,
    IListCollaboratorRequest,
    IListCollaboratorResponse,
    IListPermPointRequest,
    IListPermPointResponse,
    IListRolesRequest,
    IListRolesResponse,
    IPutCollaboratorsRequest,
    IUpdateCollaboratorRequest,
    IUpdatePermPointRequest,
    UnitObject,
} from '@univerjs/protocol';
import type { Observable } from 'rxjs';
import type { ILogContext } from '../log/context';
import { createIdentifier } from '../../common/di';

// FIXME: should not import ILogContext here

export interface IAuthzIoService {
    /** Optional notification channel for custom providers; collaboration providers use UPDATE_PERMISSION_OBJ. */
    objectPermissionChanges$?: Observable<{ unitID: string }>;
    /** Opt in only when stable object IDs support policy read/write and Unit enumeration. */
    supportsObjectPermissionManagement?(objectType: UnitObject): boolean;
    /**
     * All explicit policies in this Unit, including objects absent from the local viewport.
     *
     * Stable-object Authz contract (also used by the frontend mock):
     * - list/listUnitPermissions return explicit child policies only; absence means inherited access.
     * - update is an atomic upsert: creation requires CreatePermissionObject on the root Unit;
     *   updates require ManageCollaborator on the rule or its server-recorded creator.
     * - allowed/batchAllowed apply parent restrictions and cfgEnableObjInherit. The client must
     *   never infer effective Owner rights from the requested policy or the local object's author.
     * - every write rechecks authorization on the server and publishes objectPermissionChanges$.
     * Providers must implement these semantics before opting a product into object management.
     */
    listUnitPermissions?(unitID: string): Promise<IListPermPointResponse['objects']>;

    /**
     * Remove ONLY an explicit child permission rule, not the content object or file. Require Delete
     * on that rule or its server-recorded creator; restore inherited rights and publish a change.
     * Omit this method until the provider supports rule removal. Repeated deletion is idempotent.
     */
    deleteObjectPermission?(config: Pick<IAllowedRequest, 'unitID' | 'objectID' | 'objectType'>): Promise<void>;

    create(config: ICreateRequest, context?: ILogContext): Promise<ICreateResponse['objectID']>;
    allowed(config: IAllowedRequest, context?: ILogContext): Promise<IAllowedResponse['actions']>;
    batchAllowed(config: IAllowedRequest[], context?: ILogContext): Promise<IBatchAllowedResponse['objectActions']>;
    list(config: IListPermPointRequest, context?: ILogContext): Promise<IListPermPointResponse['objects']>;
    listRoles(config: IListRolesRequest, context?: ILogContext): Promise<{ roles: IListRolesResponse['roles']; actions: IListRolesResponse['actions'] }>;
    update(config: IUpdatePermPointRequest, context?: ILogContext): Promise<void>;
    listCollaborators(config: IListCollaboratorRequest, context?: ILogContext): Promise<IListCollaboratorResponse['collaborators']>;
    updateCollaborator(config: IUpdateCollaboratorRequest, context?: ILogContext): Promise<void>;
    deleteCollaborator(config: IDeleteCollaboratorRequest, context?: ILogContext): Promise<void>;
    createCollaborator(config: ICreateCollaboratorRequest, context?: ILogContext): Promise<void>;
    putCollaborators(config: IPutCollaboratorsRequest, context?: ILogContext): Promise<void>;
    setCfgEnableObjInherit?(enabled: boolean): void;
    getCfgEnableObjInherit?(): boolean;
}

export const IAuthzIoService = createIdentifier<IAuthzIoService>('IAuthzIoIoService');
