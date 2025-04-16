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

import type { IActionInfo, IAllowedRequest, IBatchAllowedResponse, ICollaborator, ICreateRequest, ICreateRequest_SelectRangeObject, IListPermPointRequest, IPermissionPoint, IPutCollaboratorsRequest, IUnitRoleKV, IUpdatePermPointRequest, UnitAction, UnitObject } from '@univerjs/protocol';
import { ObjectScope, UnitRole, UniverType } from '@univerjs/protocol';
import { Inject } from '../../common/di';
import { generateRandomId } from '../../shared/tools';
import { IResourceManagerService } from '../resource-manager/type';
import { UserManagerService } from '../user-manager/user-manager.service';
import { createDefaultUser, isDevRole } from '../user-manager/const';

import type { IAuthzIoService } from './type';

/**
 * Do not use the mock implementation in a production environment as it is a minimal version.
 */
export class AuthzIoLocalService implements IAuthzIoService {
    private _permissionMap: Map<string, ICreateRequest_SelectRangeObject & { objectType: UnitObject }> = new Map([]);

    // private _sheetPermissionPointMap: Map<string, { action: UnitAction; allowed: boolean }[]> = new Map();

    constructor(
        @IResourceManagerService private _resourceManagerService: IResourceManagerService,
        @Inject(UserManagerService) private _userManagerService: UserManagerService
    ) {
        this._initSnapshot();
        this._initDefaultUser();
    }

    private _initDefaultUser() {
        const currentUser = this._userManagerService.getCurrentUser();
        const currentUserIsValid = currentUser && currentUser.userID;
        if (!currentUserIsValid) {
            this._userManagerService.setCurrentUser(createDefaultUser(UnitRole.Owner));
        }
    }

    private _getRole(type: UnitRole) {
        const user = this._userManagerService.getCurrentUser();
        if (!user) {
            return false;
        }
        return isDevRole(user.userID, type);
    }

    private _initSnapshot() {
        this._resourceManagerService.registerPluginResource({
            toJson: (_unitId: string) => {
                const obj = [...this._permissionMap.keys()].reduce((r, k) => {
                    const v = this._permissionMap.get(k);
                    r[k] = v!;
                    return r;
                }, {} as Record<string, ICreateRequest_SelectRangeObject & { objectType: UnitObject }>);
                return JSON.stringify(obj);
            },
            parseJson: (json: string) => {
                return JSON.parse(json);
            },
            pluginName: 'SHEET_AuthzIoMockService_PLUGIN',
            businesses: [UniverType.UNIVER_SHEET, UniverType.UNIVER_DOC, UniverType.UNIVER_SLIDE],
            onLoad: (_unitId, resource) => {
                for (const key in resource) {
                    this._permissionMap.set(key, resource[key]);
                }
            },
            onUnLoad: () => {
                this._permissionMap.clear();
            },
        });
    }

    async create(config: ICreateRequest): Promise<string> {
        return generateRandomId(8);
    }

    async allowed(_config: IAllowedRequest): Promise<IActionInfo[]> {
        // Because this is a mockService for handling permissions, we will not write real logic in it. We will only return an empty array to ensure that the permissions originally set by the user are not modified.
        // If you want to achieve persistence of permissions, you can modify the logic here.
        return Promise.resolve([]);
    }

    async batchAllowed(_config: IAllowedRequest[]): Promise<IBatchAllowedResponse['objectActions']> {
        return Promise.resolve([]);
    }

    // eslint-disable-next-line max-lines-per-function
    async list(config: IListPermPointRequest): Promise<IPermissionPoint[]> {
        const result: IPermissionPoint[] = [];
        config.objectIDs.forEach((objectID) => {
            const rule = this._permissionMap.get(objectID);
            if (rule) {
                const item = {
                    objectID,
                    unitID: config.unitID,
                    objectType: rule!.objectType,
                    name: rule!.name,
                    shareOn: false,
                    shareRole: UnitRole.Owner,
                    shareScope: -1,
                    scope: {
                        read: ObjectScope.AllCollaborator,
                        edit: ObjectScope.AllCollaborator,
                    },
                    creator: createDefaultUser(UnitRole.Owner),
                    strategies: [
                        {
                            action: 6,
                            role: 1,
                        },
                        {
                            action: 16,
                            role: 1,
                        },
                        {
                            action: 17,
                            role: 1,
                        },
                        {
                            action: 18,
                            role: 1,
                        },
                        {
                            action: 19,
                            role: 1,
                        },
                        {
                            action: 33,
                            role: 1,
                        },
                        {
                            action: 34,
                            role: 1,
                        },
                        {
                            action: 35,
                            role: 1,
                        },
                        {
                            action: 36,
                            role: 1,
                        },
                        {
                            action: 37,
                            role: 1,
                        },
                        {
                            action: 38,
                            role: 1,
                        },
                        {
                            action: 39,
                            role: 1,
                        },
                        {
                            action: 40,
                            role: 1,
                        },
                    ],
                    actions: config.actions.map((a) => {
                        return { action: a, allowed: this._getRole(UnitRole.Owner) || this._getRole(UnitRole.Editor) };
                    }),
                };
                result.push(item);
            }
        });
        return result;
    }

    async listCollaborators(): Promise<ICollaborator[]> {
        return [];
    }

    async listRoles(): Promise<{ roles: IUnitRoleKV[]; actions: UnitAction[] }> {
        return {
            roles: [],
            actions: [],
        };
    }

    async deleteCollaborator(): Promise<void> {
        return undefined;
    }

    async update(config: IUpdatePermPointRequest): Promise<void> {
        // const { objectID, strategies } = config;
        // const actions = strategies.map((s) => {
        //     return {
        //         action: s.action,
        //         allowed: s.role === UnitRole.Editor || s.role === UnitRole.Owner,
        //     };
        // });
        // this._sheetPermissionPointMap.set(objectID, actions);
    }

    async updateCollaborator(): Promise<void> {
        return undefined;
    }

    async createCollaborator(): Promise<void> {
        return undefined;
    }

    async putCollaborators(config: IPutCollaboratorsRequest): Promise<void> {
        return undefined;
    }
}
