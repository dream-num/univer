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

import type { IActionInfo, IAllowedRequest, IBatchAllowedResponse, ICollaborator, ICreateRequest, IListPermPointRequest, IPermissionPoint, IPutCollaboratorsRequest, IUnitRoleKV, IUpdatePermPointRequest } from '@univerjs/protocol';
import type { IUser } from '../user-manager/user-manager.service';
import type { IAuthzIoService, ICreateInfo, IPermissionLocalData, IPermissionLocalJson, IPermissionLocalRule } from './type';
import { ObjectScope, UnitAction, UnitObject, UnitRole } from '@univerjs/protocol';
import { Inject } from '../../common/di';
import { UniverInstanceType } from '../../common/unit';
import { generateRandomId } from '../../shared/tools';

import { IResourceManagerService } from '../resource-manager/type';
import { createDefaultUser, isDevRole } from '../user-manager/const';
import { UserManagerService } from '../user-manager/user-manager.service';

/**
 * Do not use the mock implementation in a production environment as it is a minimal version.
 */
export class AuthzIoLocalService implements IAuthzIoService {
    private _permissionMap: IPermissionLocalData = new Map();

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
            toJson: (unitId: string) => {
                const unitMap = this._permissionMap.get(unitId);
                const res: IPermissionLocalJson = {};
                if (unitMap?.ruleMap) {
                    res.rules = {};
                    unitMap.ruleMap.keys().forEach((key) => {
                        const rule = unitMap.ruleMap.get(key);
                        if (rule) {
                            res.rules![key] = rule;
                        }
                    });
                }
                if (unitMap?.createMap) {
                    res.creates = {};
                    unitMap.createMap.keys().forEach((key) => {
                        const create = unitMap.createMap.get(key);
                        if (create) {
                            res.creates![key] = create;
                        }
                    });
                }
                return JSON.stringify(res);
            },
            parseJson: (json: string) => {
                return JSON.parse(json);
            },
            pluginName: 'SHEET_AuthzIoMockService_PLUGIN',
            businesses: [UniverInstanceType.UNIVER_SHEET],
            onLoad: (unitId, resource) => {
                const { rules, creates } = resource;
                const ruleMap = new Map();
                Object.keys(rules).forEach((key) => {
                    ruleMap.set(key, rules[key]);
                });
                const createMap = new Map();
                Object.keys(creates).forEach((key) => {
                    createMap.set(key, creates[key]);
                });
                this._permissionMap.set(unitId, {
                    ruleMap,
                    createMap,
                });
            },
            onUnLoad: (unitId) => {
                this._permissionMap.delete(unitId);
            },
        });
    }

    async create(config: ICreateRequest): Promise<string> {
        const permissionId = generateRandomId(8);
        let rule;
        if (config.objectType === UnitObject.SelectRange) {
            rule = config.selectRangeObject;
            if (!rule) {
                throw new Error('[AuthIoService]: The rule param and type do not match');
            }
        } else if (config.objectType === UnitObject.Worksheet) {
            rule = config.worksheetObject;
            if (!rule) {
                throw new Error('[AuthIoService]: The rule param and type do not match');
            }
        } else {
            throw new Error('[AuthIoService]: Invalid objectType');
        }

        const { unitID } = rule;
        let ruleWithUnitMap = this._permissionMap.get(unitID);
        if (!ruleWithUnitMap) {
            ruleWithUnitMap = {
                ruleMap: new Map(),
                createMap: new Map(),
            };
            this._permissionMap.set(unitID, ruleWithUnitMap);
        }
        ruleWithUnitMap.createMap.set(permissionId, {
            objectID: permissionId,
            objectType: config.objectType,
            creator: this._userManagerService.getCurrentUser(),
        });
        ruleWithUnitMap.ruleMap.set(permissionId, rule);
        return permissionId;
    }

    async allowed(config: IAllowedRequest): Promise<IActionInfo[]> {
        // Because this is a mockService for handling permissions, we will not write real logic in it. We will only return an empty array to ensure that the permissions originally set by the user are not modified.
        // If you want to achieve persistence of permissions, you can modify the logic here.

        const { unitID, objectID, objectType, actions } = config;
        const ruleMap = this._permissionMap.get(unitID)?.ruleMap;
        const createMap = this._permissionMap.get(unitID)?.createMap;
        const rule = ruleMap?.get(objectID);
        const create = createMap?.get(objectID);
        const user = this._userManagerService.getCurrentUser();

        if (!rule) {
            return Promise.resolve([]);
        }

        if (objectType === UnitObject.Worksheet || objectType === UnitObject.SelectRange) {
            return actions.map((point) => this._getActionAllowed(rule, point, user, create));
        }

        return Promise.resolve([]);
    }

    async batchAllowed(configs: IAllowedRequest[]): Promise<IBatchAllowedResponse['objectActions']> {
        return configs.filter((config) => config.objectType === UnitObject.Worksheet || config.objectType === UnitObject.SelectRange).reduce((result, config) => {
            const { unitID, objectID, actions } = config;
            const permissionData = this._permissionMap.get(unitID);
            const ruleMap = permissionData?.ruleMap;
            const createMap = permissionData?.createMap;
            const rule = ruleMap?.get(objectID);
            const create = createMap?.get(objectID);
            const user = this._userManagerService.getCurrentUser();

            if (rule) {
                const updatedConfig = {
                    unitID,
                    objectID,
                    actions: actions.map((point) =>
                        this._getActionAllowed(rule, point, user, create)
                    ),
                };

                result.push(updatedConfig);
            }
            return result;
        }, [] as IBatchAllowedResponse['objectActions']);
    }

    async list(config: IListPermPointRequest): Promise<IPermissionPoint[]> {
        const result: IPermissionPoint[] = [];
        const unitMap = this._permissionMap.get(config.unitID);
        const ruleMap = unitMap?.ruleMap;
        const createMap = unitMap?.createMap;
        const user = this._userManagerService.getCurrentUser();
        config.objectIDs.forEach((objectID) => {
            const rule = ruleMap?.get(objectID);
            const create = createMap?.get(objectID);
            if (rule && create?.creator) {
                const item = {
                    objectID,
                    unitID: config.unitID,
                    objectType: create.objectType,
                    name: '',
                    shareOn: false,
                    shareRole: UnitRole.UNRECOGNIZED,
                    shareScope: -1,
                    scope: {
                        read: ObjectScope.AllCollaborator,
                        edit: ObjectScope.AllCollaborator,
                    },
                    creator: create.creator,
                    strategies: [],
                    actions: config.actions.map((action) => this._getActionAllowed(rule, action, user, create)),
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

    private _getActionAllowed(rule: IPermissionLocalRule, point: UnitAction, user: IUser, create?: ICreateInfo) {
        let allowed = false;

        if (point === UnitAction.ManageCollaborator || point === UnitAction.Delete) {
            allowed = user.userID === create?.creator?.userID;
        } else {
            allowed = rule?.collaborators.some((collaborator) => {
                return collaborator.subject?.userID === user.userID && collaborator.role === UnitRole.Editor;
            });
        }

        return {
            action: point,
            allowed,
        };
    }
}
