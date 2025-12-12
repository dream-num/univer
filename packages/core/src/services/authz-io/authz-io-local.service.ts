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
import type { IAuthzIoService } from './type';
import { ObjectScope, UnitRole, UniverType } from '@univerjs/protocol';
import { Inject } from '../../common/di';
import { generateRandomId } from '../../shared/tools';
import { IResourceManagerService } from '../resource-manager/type';
import { createDefaultUser, isDevRole } from '../user-manager/const';

import { UserManagerService } from '../user-manager/user-manager.service';

/**
 * Do not use the mock implementation in a production environment as it is a minimal version.
 */
interface IPermissionData {
    objectType: UnitObject;
    name: string;
    unitID: string;
    strategies: Array<{ action: UnitAction; role: UnitRole }>;
    selectRangeObject?: ICreateRequest_SelectRangeObject;
}

/**
 * Do not use the mock implementation in a production environment as it is a minimal version.
 */
export class AuthzIoLocalService implements IAuthzIoService {
    private _permissionMap: Map<string, IPermissionData> = new Map([]);

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
                }, {} as Record<string, IPermissionData>);
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
        const objectID = generateRandomId(8);
        const { objectType, selectRangeObject, worksheetObject } = config;
        const rangeObject = selectRangeObject || worksheetObject;

        // 存储权限数据
        const permissionData: IPermissionData = {
            objectType,
            unitID: rangeObject?.unitID || '',
            name: rangeObject?.name || '',
            strategies: [
                // 默认策略：Owner 和 Editor 拥有所有权限
                { action: 6, role: UnitRole.Owner },
                { action: 16, role: UnitRole.Owner },
                { action: 17, role: UnitRole.Owner },
                { action: 18, role: UnitRole.Owner },
                { action: 19, role: UnitRole.Owner },
                { action: 33, role: UnitRole.Owner },
                { action: 34, role: UnitRole.Owner },
                { action: 35, role: UnitRole.Owner },
                { action: 36, role: UnitRole.Owner },
                { action: 37, role: UnitRole.Owner },
                { action: 38, role: UnitRole.Owner },
                { action: 39, role: UnitRole.Owner },
                { action: 40, role: UnitRole.Owner },
            ],
            selectRangeObject,
        };

        this._permissionMap.set(objectID, permissionData);
        return objectID;
    }

    async allowed(config: IAllowedRequest): Promise<IActionInfo[]> {
        const { objectID, actions } = config;
        const permissionData = this._permissionMap.get(objectID);

        if (!permissionData) {
            // 如果没有权限数据，默认所有操作都允许（Owner/Editor）
            const result = actions.map((action) => ({
                action,
                allowed: this._getRole(UnitRole.Owner) || this._getRole(UnitRole.Editor),
            }));
            return result;
        }

        // 根据存储的策略判断权限
        const result = actions.map((action) => {
            const strategy = permissionData.strategies.find((s) => s.action === action);
            // 默认允许 Owner 和 Editor
            const defaultAllowed = this._getRole(UnitRole.Owner) || this._getRole(UnitRole.Editor);
            if (!strategy) {
                // 如果没有找到对应的 strategy，默认允许
                return { action, allowed: defaultAllowed };
            }
            // 检查当前用户是否有对应角色的权限
            return {
                action,
                allowed: this._getRole(strategy.role) || defaultAllowed,
            };
        });
        return result;
    }

    async batchAllowed(configs: IAllowedRequest[]): Promise<IBatchAllowedResponse['objectActions']> {
        const results = await Promise.all(configs.map((config) => this.allowed(config)));
        const result = configs.map((config, index) => ({
            unitID: config.unitID,
            objectID: config.objectID,
            actions: results[index],
        }));
        return result;
    }

    async list(config: IListPermPointRequest): Promise<IPermissionPoint[]> {
        const result: IPermissionPoint[] = [];

        // 默认策略
        const defaultStrategies = [
            { action: 6, role: UnitRole.Owner },
            { action: 16, role: UnitRole.Owner },
            { action: 17, role: UnitRole.Owner },
            { action: 18, role: UnitRole.Owner },
            { action: 19, role: UnitRole.Owner },
            { action: 33, role: UnitRole.Owner },
            { action: 34, role: UnitRole.Owner },
            { action: 35, role: UnitRole.Owner },
            { action: 36, role: UnitRole.Owner },
            { action: 37, role: UnitRole.Owner },
            { action: 38, role: UnitRole.Owner },
            { action: 39, role: UnitRole.Owner },
            { action: 40, role: UnitRole.Owner },
        ];

        config.objectIDs.forEach((objectID) => {
            const rule = this._permissionMap.get(objectID);
            const strategies = rule?.strategies || defaultStrategies;

            // 无论是否有 rule，都返回权限对象
            const item = {
                objectID,
                unitID: config.unitID,
                objectType: rule?.objectType || (3 as UnitObject), // 默认 SelectRange = 3
                name: rule?.name || '',
                shareOn: false,
                shareRole: UnitRole.Owner,
                shareScope: -1,
                scope: {
                    read: ObjectScope.AllCollaborator,
                    edit: ObjectScope.AllCollaborator,
                },
                creator: createDefaultUser(UnitRole.Owner),
                strategies: strategies.map((s) => ({ action: s.action, role: s.role })),
                actions: config.actions.map((a) => {
                    const strategy = strategies.find((s) => s.action === a);
                    // 默认允许 Owner 和 Editor
                    const allowed = this._getRole(UnitRole.Owner) || this._getRole(UnitRole.Editor);
                    if (!strategy) {
                        return { action: a, allowed };
                    }
                    return { action: a, allowed: this._getRole(strategy.role) || allowed };
                }),
            };
            result.push(item);
        });

        return result;
    }

    async listCollaborators(): Promise<ICollaborator[]> {
        const result: ICollaborator[] = [];
        return result;
    }

    async listRoles(): Promise<{ roles: IUnitRoleKV[]; actions: UnitAction[] }> {
        const result = {
            roles: [] as IUnitRoleKV[],
            actions: [] as UnitAction[],
        };
        return result;
    }

    async deleteCollaborator(): Promise<void> {
        return undefined;
    }

    async update(config: IUpdatePermPointRequest): Promise<void> {
        const { objectID, strategies } = config;
        const permissionData = this._permissionMap.get(objectID);

        if (permissionData && strategies) {
            // 更新策略
            permissionData.strategies = strategies.map((s) => ({
                action: s.action,
                role: s.role,
            }));
            this._permissionMap.set(objectID, permissionData);
        }
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
