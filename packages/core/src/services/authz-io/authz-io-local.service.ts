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
    IActionInfo,
    IAllowedRequest,
    IBatchAllowedResponse,
    ICollaborator,
    ICreateRequest,
    ICreateRequestSelectRangeObject,
    IListPermPointRequest,
    IPermissionPoint,
    IPutCollaboratorsRequest,
    IUnitRoleKV,
    IUpdatePermPointRequest,
    UnitAction,
} from '@univerjs/protocol';
import { ObjectScope, UnitObject, UnitRole } from '@univerjs/protocol';
import type { IAuthzIoService } from './type';
import { Inject } from '../../common/di';
import { UniverInstanceType } from '../../common/unit';
import { Disposable } from '../../shared/lifecycle';
import { generateRandomId } from '../../shared/random-id';
import { IUniverInstanceService } from '../instance/instance.service';
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
    overrides?: Record<number, boolean>;
    selectRangeObject?: ICreateRequestSelectRangeObject;
}

/**
 * Do not use the mock implementation in a production environment as it is a minimal version.
 */
export class AuthzIoLocalService extends Disposable implements IAuthzIoService {
    private _permissionMap: Map<string, IPermissionData> = new Map([]);
    // Store explicit permission overrides: key is "objectID:action", value is the allowed state
    private _permissionOverrides: Map<string, boolean> = new Map();
    /**
     * Whether the document owner inherits permissions for all protected ranges.
     * If true, the document owner cannot be selected when specifying user edits for a protected range, and the document owner will have edit permissions for all protected ranges by default.
     */
    private _cfgEnableObjInherit: boolean = false;

    constructor(
        @IResourceManagerService private _resourceManagerService: IResourceManagerService,
        @Inject(UserManagerService) private _userManagerService: UserManagerService,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService
    ) {
        super();
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
        const clearUnitPermissions = (unitId: string) => {
            this._permissionMap.forEach((permission, objectID) => {
                if (permission.unitID === unitId) {
                    this._permissionMap.delete(objectID);
                    this.clearAllOverrides(objectID);
                }
            });
        };
        this.disposeWithMe(this._resourceManagerService.registerPluginResource<Record<string, IPermissionData>>({
            toJson: (unitId: string) => {
                const obj = [...this._permissionMap.keys()].reduce((r, k) => {
                    const v = this._permissionMap.get(k);
                    if (v?.unitID === unitId) {
                        r[k] = v;
                    }
                    return r;
                }, {} as Record<string, IPermissionData>);
                return JSON.stringify(obj);
            },
            parseJson: (json: string) => {
                return JSON.parse(json);
            },
            pluginName: 'SHEET_AuthzIoMockService_PLUGIN',
            businesses: [
                UniverInstanceType.UNIVER_SHEET,
                UniverInstanceType.UNIVER_DOC,
                UniverInstanceType.UNIVER_SLIDE,
                UniverInstanceType.UNIVER_BOARD,
            ],
            onLoad: (unitId, resource) => {
                clearUnitPermissions(unitId);
                for (const key in resource) {
                    if (resource[key].unitID === unitId) {
                        this._permissionMap.set(key, resource[key]);
                        Object.entries(resource[key].overrides || {}).forEach(([action, allowed]) => {
                            this._permissionOverrides.set(`${key}:${action}`, allowed);
                        });
                    }
                }
            },
            onUnLoad: clearUnitPermissions,
        }));
    }

    async create(config: ICreateRequest): Promise<string> {
        const objectID = generateRandomId(8);
        const { objectType, selectRangeObject, worksheetObject } = config;
        const rangeObject = selectRangeObject || worksheetObject;

        const permissionData: IPermissionData = {
            objectType,
            unitID: rangeObject?.unitID || '',
            name: rangeObject?.name || '',
            strategies: [
                // Default strategy: Owner and Editor have all permissions
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
            const result = actions.map((action) => ({
                action,
                allowed: this._getRole(UnitRole.Owner) || this._getRole(UnitRole.Editor),
            }));
            return result;
        }

        const result = actions.map((action) => {
            // Check if there's an explicit override first
            const overrideKey = `${objectID}:${action}`;
            if (this._permissionOverrides.has(overrideKey)) {
                return { action, allowed: this._permissionOverrides.get(overrideKey)! };
            }

            // Otherwise, check strategies
            const strategy = permissionData.strategies.find((s) => s.action === action);
            if (!strategy) {
                // No strategy, use default: Owner and Editor are allowed
                return { action, allowed: this._getRole(UnitRole.Owner) || this._getRole(UnitRole.Editor) };
            }

            // Has strategy, only check the specified role (no fallback)
            return {
                action,
                allowed: this._getRole(strategy.role),
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
            const item = {
                objectID,
                unitID: config.unitID,
                objectType: rule?.objectType || (3 as UnitObject), // Default SelectRange = 3
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
                    // Check for override first
                    const overrideKey = `${objectID}:${a}`;
                    if (this._permissionOverrides.has(overrideKey)) {
                        return { action: a, allowed: this._permissionOverrides.get(overrideKey)! };
                    }

                    const strategy = strategies.find((s) => s.action === a);
                    if (!strategy) {
                        // No strategy, default is Owner/Editor allowed
                        const allowed = this._getRole(UnitRole.Owner) || this._getRole(UnitRole.Editor);
                        return { action: a, allowed };
                    }
                    // Has strategy, only check specified role
                    return { action: a, allowed: this._getRole(strategy.role) };
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
        let permissionData = this._permissionMap.get(objectID);
        if (!permissionData && config.objectType === UnitObject.Workbook && objectID === config.unitID
            && this._univerInstanceService.getUnit(config.unitID, UniverInstanceType.UNIVER_SHEET)) {
            permissionData = { objectType: config.objectType, unitID: config.unitID, name: config.name, strategies: [] };
        }
        if (!permissionData) {
            throw new Error(`Permission object ${objectID} was not found for unitID ${config.unitID}`);
        }
        if (permissionData.unitID !== config.unitID) {
            throw new Error(`Permission object ${objectID} does not belong to unitID ${config.unitID}`);
        }

        if (strategies) {
            permissionData.strategies = strategies.map((s) => ({
                action: s.action,
                role: s.role,
            }));
            this._permissionMap.set(objectID, permissionData);

            // Automatically set overrides: when strategy role is Reader, it means "deny" for Owner/Editor
            strategies.forEach((s) => {
                if (s.role === UnitRole.Reader) {
                    // Reader role means deny for Owner/Editor users
                    this.setPermissionOverride(objectID, s.action, false);
                } else if (s.role === UnitRole.Owner || s.role === UnitRole.Editor) {
                    // Clear override, let strategy handle it
                    this.clearPermissionOverride(objectID, s.action);
                }
            });
        }
    }

    /**
     * Set an explicit permission override for a specific action on an object.
     * This override takes precedence over strategies.
     * @param objectID - The permission object ID
     * @param action - The action number
     * @param allowed - Whether the action is allowed
     */
    setPermissionOverride(objectID: string, action: number, allowed: boolean): void {
        const key = `${objectID}:${action}`;
        this._permissionOverrides.set(key, allowed);
        const permission = this._permissionMap.get(objectID);
        if (permission) {
            permission.overrides ||= {};
            permission.overrides[action] = allowed;
        }
    }

    /**
     * Clear a specific permission override.
     * @param objectID - The permission object ID
     * @param action - The action number
     */
    clearPermissionOverride(objectID: string, action: number): void {
        const key = `${objectID}:${action}`;
        this._permissionOverrides.delete(key);
        const permission = this._permissionMap.get(objectID);
        if (permission?.overrides) {
            delete permission.overrides[action];
            if (!Object.keys(permission.overrides).length) {
                delete permission.overrides;
            }
        }
    }

    /**
     * Clear all permission overrides for an object.
     * @param objectID - The permission object ID
     */
    clearAllOverrides(objectID: string): void {
        const keysToDelete: string[] = [];
        this._permissionOverrides.forEach((_, key) => {
            if (key.startsWith(`${objectID}:`)) {
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach((key) => this._permissionOverrides.delete(key));
        const permission = this._permissionMap.get(objectID);
        if (permission) {
            delete permission.overrides;
        }
    }

    async updateCollaborator(): Promise<void> {
        return undefined;
    }

    async createCollaborator(): Promise<void> {
        return undefined;
    }

    async putCollaborators(_config: IPutCollaboratorsRequest): Promise<void> {
        return undefined;
    }

    setCfgEnableObjInherit(enabled: boolean): void {
        this._cfgEnableObjInherit = enabled;
    }

    getCfgEnableObjInherit(): boolean {
        return this._cfgEnableObjInherit;
    }
}
