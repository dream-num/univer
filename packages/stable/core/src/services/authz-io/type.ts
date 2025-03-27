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

import type { IAllowedRequest, IAllowedResponse, IBatchAllowedResponse, ICreateCollaboratorRequest, ICreateRequest, ICreateResponse, IDeleteCollaboratorRequest, IListCollaboratorRequest, IListCollaboratorResponse, IListPermPointRequest, IListPermPointResponse, IListRolesRequest, IListRolesResponse, IPutCollaboratorsRequest, IUpdateCollaboratorRequest, IUpdatePermPointRequest } from '@univerjs/protocol';
import type { ILogContext } from '../log/context';
import { createIdentifier } from '../../common/di';

// FIXME: should not import ILogContext here

export interface IAuthzIoService {
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
}

export const IAuthzIoService = createIdentifier<IAuthzIoService>('IAuthzIoIoService');
