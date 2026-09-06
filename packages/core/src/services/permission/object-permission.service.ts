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

import type { IBatchAllowedResponse, ICollaborator, IListPermPointResponse } from '@univerjs/protocol';
import type { IPermissionPoint } from './type';
import { ObjectScope, UnitAction, UnitObject, UnitRole } from '@univerjs/protocol';
import { BehaviorSubject, Subject } from 'rxjs';
import { Inject } from '../../common/di';
import { Disposable } from '../../shared/lifecycle';
import { IAuthzIoService } from '../authz-io/type';
import { ILogService } from '../log/log.service';
import { UserManagerService } from '../user-manager/user-manager.service';
import { IPermissionService, PermissionStatus } from './type';

export interface IObjectPermissionTarget {
    unitId: string;
    objectId: string;
    objectType: IPermissionPoint['type'];
}

export interface IObjectPermissionPolicy {
    /** All Unit editors, the object owner, or selected Unit collaborators. Parent restrictions still apply. */
    edit: 'all' | 'owner' | 'members';
    collaborators: ICollaborator[];
    strategies: IListPermPointResponse['objects'][number]['strategies'];
}

const ROOT_OBJECT_TYPES: Partial<Record<UnitObject, UnitObject>> = {
    [UnitObject.Document]: UnitObject.Document,
    [UnitObject.DocumentSection]: UnitObject.Document,
    [UnitObject.DocumentParagraph]: UnitObject.Document,
    [UnitObject.DocumentEntity]: UnitObject.Document,
    [UnitObject.Slide]: UnitObject.Slide,
    [UnitObject.SlidePage]: UnitObject.Slide,
    [UnitObject.SlideElement]: UnitObject.Slide,
    [UnitObject.SlideMaster]: UnitObject.Slide,
    [UnitObject.Base]: UnitObject.Base,
    [UnitObject.BaseTable]: UnitObject.Base,
    [UnitObject.BaseField]: UnitObject.Base,
    [UnitObject.BaseRecord]: UnitObject.Base,
    [UnitObject.BaseView]: UnitObject.Base,
    [UnitObject.BaseDashboard]: UnitObject.Base,
    [UnitObject.Board]: UnitObject.Board,
    [UnitObject.BoardElement]: UnitObject.Board,
};

/** Coordinates Authz policy writes and the current user's effective permission cache. */
export class ObjectPermissionService extends Disposable {
    private readonly _initialized = new Set<string>();
    private readonly _policies = new Map<string, IListPermPointResponse['objects'][number][]>();
    private readonly _generations = new Map<string, number>();
    private _nextGeneration = 0;
    private readonly _revision = new BehaviorSubject(0);
    readonly changed$ = this._revision.asObservable();
    private readonly _unitChanges = new Subject<string>();
    readonly unitChanges$ = this._unitChanges.asObservable();

    constructor(
        @IAuthzIoService private readonly _authz: IAuthzIoService,
        @IPermissionService private readonly _permissions: IPermissionService,
        @ILogService private readonly _logService: ILogService,
        @Inject(UserManagerService) private readonly _users: UserManagerService
    ) {
        super();
        this.disposeWithMe(this._permissions.permissionPointUpdate$.subscribe((point) => {
            if (point.subType === UnitAction.Edit && ROOT_OBJECT_TYPES[point.type] === point.type) {
                this._revision.next(this._revision.value + 1);
            }
        }));
        if (this._authz.objectPermissionChanges$) {
            this.disposeWithMe(this._authz.objectPermissionChanges$.subscribe(({ unitID }) => {
                if (this._initialized.has(unitID)) {
                    this.refreshUnit(unitID).catch((error: unknown) => this._logService.error(error));
                }
            }));
        }
        this.disposeWithMe(() => {
            this._initialized.clear();
            this._policies.clear();
            this._generations.clear();
            this._revision.complete();
            this._unitChanges.complete();
        });
    }

    initializeUnit(target: IObjectPermissionTarget): void {
        if (!this.supports(target) || this._initialized.has(target.unitId)) {
            return;
        }
        this._initialized.add(target.unitId);
        const ids: string[] = [];
        this._permissions.getAllPermissionPoint().forEach((point$) => {
            const subscription = point$.subscribe((point) => {
                if ('unitId' in point && point.unitId === target.unitId) {
                    ids.push(point.id);
                }
            });
            subscription.unsubscribe();
        });
        ids.forEach((id) => this._permissions.updatePermissionPoint(id, false));
        this.refreshUnit(target.unitId).catch((error: unknown) => {
            this._logService.error(error);
        });
    }

    supports(target: IObjectPermissionTarget): boolean {
        return !!this._authz.listUnitPermissions &&
            this._authz.supportsObjectPermissionManagement?.(target.objectType) === true;
    }

    getPolicies(unitId: string): readonly IListPermPointResponse['objects'][number][] {
        return this._policies.get(unitId) ?? [];
    }

    hasPolicy(target: IObjectPermissionTarget): boolean {
        const policy = this.getPolicies(target.unitId).find((item) =>
            item.objectID === target.objectId && item.objectType === target.objectType);
        return !!policy && (policy.scope?.edit === ObjectScope.OneSelf ||
            policy.scope?.edit === ObjectScope.SomeCollaborator ||
            policy.strategies.some((strategy) => strategy.role === UnitRole.Owner));
    }

    /** Match Sheet's permission-list entry: require effective file editing, not child editing. */
    canView(target: IObjectPermissionTarget): boolean {
        const rootType = ROOT_OBJECT_TYPES[target.objectType];
        return this.supports(target) && rootType !== undefined &&
            this._permissions.getPermissionPoint(`${rootType}.${UnitAction.Edit}_${target.unitId}`)?.value === true;
    }

    async canManage(target: IObjectPermissionTarget): Promise<boolean> {
        if (!this.supports(target)) {
            return false;
        }
        const object = await this._getPolicy(target);
        if (!object && target.objectId !== target.unitId) {
            const rootType = ROOT_OBJECT_TYPES[target.objectType];
            return rootType !== undefined && this._allowed({ ...target, objectId: target.unitId, objectType: rootType }, UnitAction.CreatePermissionObject);
        }
        return this._canChangeRule(target, object, UnitAction.ManageCollaborator);
    }

    async canDelete(target: IObjectPermissionTarget): Promise<boolean> {
        if (!this.supports(target) || !this._authz.deleteObjectPermission || target.objectId === target.unitId) {
            return false;
        }
        const object = await this._getPolicy(target);
        return !!object && this._canChangeRule(target, object, UnitAction.Delete);
    }

    /** Must be called from a product permission Command; removal restores server-computed inheritance. */
    async remove(target: IObjectPermissionTarget): Promise<void> {
        if (!await this.canDelete(target) || !this._authz.deleteObjectPermission) {
            throw new Error('Object permission deletion denied.');
        }
        await this._authz.deleteObjectPermission({ unitID: target.unitId, objectID: target.objectId, objectType: target.objectType });
        await this.refreshUnit(target.unitId);
    }

    private async _getPolicy(target: IObjectPermissionTarget) {
        const objects = await this._authz.list({ unitID: target.unitId, objectIDs: [target.objectId], actions: [] });
        return objects.find((item) => item.unitID === target.unitId && item.objectID === target.objectId && item.objectType === target.objectType);
    }

    private async _allowed(target: IObjectPermissionTarget, action: UnitAction): Promise<boolean> {
        const actions = await this._authz.allowed({ unitID: target.unitId, objectID: target.objectId, objectType: target.objectType, actions: [action] });
        return actions.some((item) => item.action === action && item.allowed === true);
    }

    private async _canChangeRule(target: IObjectPermissionTarget, object: IListPermPointResponse['objects'][number] | undefined, action: UnitAction): Promise<boolean> {
        if (await this._allowed(target, action)) {
            return true;
        }
        // Match Sheet's rule-creator access using server metadata, never the local object's author.
        const creatorId = object?.creator?.userID;
        return !!creatorId && creatorId === this._users.getCurrentUser().userID;
    }

    async read(target: IObjectPermissionTarget): Promise<IObjectPermissionPolicy> {
        const [objects, collaborators] = await Promise.all([
            this._authz.list({ unitID: target.unitId, objectIDs: [target.objectId], actions: [] }),
            target.objectId === target.unitId ? [] : this._authz.listCollaborators({ unitID: target.unitId, objectID: target.objectId }),
        ]);
        const object = objects.find((item) => item.objectID === target.objectId && item.objectType === target.objectType);
        let edit: IObjectPermissionPolicy['edit'] = 'all';
        if (object?.scope?.edit === ObjectScope.OneSelf) {
            edit = 'owner';
        } else if (object?.scope?.edit === ObjectScope.SomeCollaborator) {
            edit = 'members';
        } else if (object?.strategies.some((strategy) => strategy.action === UnitAction.Edit && strategy.role === UnitRole.Owner)) {
            edit = 'owner';
        }
        return { edit, collaborators, strategies: object?.strategies ?? [] };
    }

    async setPoint(target: IObjectPermissionTarget, point: IPermissionPoint, value: boolean): Promise<void> {
        // Preserve local overrides until the provider opts this object type into remote management.
        if (!this._authz.supportsObjectPermissionManagement?.(target.objectType)) {
            if (!this._permissions.getPermissionPoint(point.id)) {
                this._permissions.addPermissionPoint(point);
            }
            this._permissions.updatePermissionPoint(point.id, value);
            return;
        }
        this._assertSupported(target);
        const policy = await this.read(target);
        policy.strategies = policy.strategies.filter((strategy) => strategy.action !== point.subType);
        policy.strategies.push({ action: point.subType, role: value ? UnitRole.Editor : UnitRole.Owner });
        if (point.subType === UnitAction.Edit) {
            policy.edit = value ? 'all' : 'owner';
        }
        await this.save(target, policy);
    }

    /** Must be called from a product permission Command. */
    async save(target: IObjectPermissionTarget, policy: IObjectPermissionPolicy): Promise<void> {
        this._assertSupported(target);
        if (!await this.canManage(target)) {
            throw new Error('Object permission management denied.');
        }
        if (target.objectId === target.unitId && policy.edit === 'members') {
            throw new Error('File membership must be managed through the sharing service.');
        }
        if (policy.edit === 'members' && !policy.collaborators.length) {
            throw new Error('Select at least one collaborator.');
        }
        const objects = await this._authz.list({ unitID: target.unitId, objectIDs: [target.objectId], actions: [] });
        const previous = objects.find((item) => item.objectID === target.objectId && item.objectType === target.objectType);
        const strategies = policy.strategies.filter((strategy) => strategy.action !== UnitAction.Edit);
        strategies.push({ action: UnitAction.Edit, role: policy.edit === 'owner' ? UnitRole.Owner : UnitRole.Editor });
        let editScope = ObjectScope.AllCollaborator;
        if (policy.edit === 'members') {
            editScope = ObjectScope.SomeCollaborator;
        } else if (policy.edit === 'owner') {
            editScope = ObjectScope.OneSelf;
        }
        await this._authz.update({
            unitID: target.unitId,
            objectID: target.objectId,
            objectType: target.objectType,
            name: previous?.name ?? '',
            share: undefined,
            strategies,
            scope: {
                read: previous?.scope?.read ?? ObjectScope.AllCollaborator,
                edit: editScope,
            },
            collaborators: target.objectId === target.unitId ? undefined : { collaborators: policy.edit === 'members' ? policy.collaborators : [] },
        });
        // Never use the requested boolean as this user's result: owners and collaborators differ.
        await this.refreshUnit(target.unitId);
    }

    async refreshUnit(unitId: string): Promise<void> {
        if (!this._authz.listUnitPermissions || this._disposed) {
            return;
        }
        const generation = ++this._nextGeneration;
        this._generations.set(unitId, generation);
        const policies = await this._authz.listUnitPermissions(unitId);
        const requests = new Map<string, { unitID: string; objectID: string; objectType: IPermissionPoint['type']; actions: UnitAction[] }>();
        const include = (objectID: string, objectType: IPermissionPoint['type'], actions: UnitAction[]) => {
            if (!this._authz.supportsObjectPermissionManagement?.(objectType)) {
                return;
            }
            const key = `${objectType}/${objectID}`;
            const previous = requests.get(key);
            requests.set(key, { unitID: unitId, objectID, objectType, actions: [...new Set([...(previous?.actions ?? []), ...actions])] });
        };
        policies.filter((policy) => policy.unitID === unitId).forEach((policy) =>
            include(policy.objectID, policy.objectType, [UnitAction.Edit, ...policy.strategies.map((strategy) => strategy.action)]));
        // Include old points as well: removing a policy must restore the server's inherited result.
        this._permissions.getAllPermissionPoint().forEach((point$) => {
            const subscription = point$.subscribe((point) => {
                if ('unitId' in point && point.unitId === unitId) {
                    const objectId = 'objectId' in point && typeof point.objectId === 'string' ? point.objectId : unitId;
                    include(objectId, point.type, [point.subType]);
                }
            });
            subscription.unsubscribe();
        });
        const values = [...requests.values()];
        const results: IBatchAllowedResponse['objectActions'] = [];
        for (let offset = 0; offset < values.length; offset += 100) {
            results.push(...await this._authz.batchAllowed(values.slice(offset, offset + 100)));
        }
        if (this._disposed || this._generations.get(unitId) !== generation) {
            return;
        }
        values.forEach((request) => {
            const result = results.find((item) => item.unitID === unitId && item.objectID === request.objectID);
            request.actions.forEach((action) => {
                const id = `${request.objectType}.${action}_${unitId}${request.objectID === unitId ? '' : `_${request.objectID}`}`;
                if (!this._permissions.getPermissionPoint(id)) {
                    this._permissions.addPermissionPoint({ id, type: request.objectType, subType: action, status: PermissionStatus.DONE, value: false, unitId, objectId: request.objectID } as IPermissionPoint);
                }
                this._permissions.updatePermissionPoint(id, result?.actions.some((item) => item.action === action && item.allowed === true) ?? false);
            });
        });
        this._policies.set(unitId, policies.filter((policy) => policy.unitID === unitId));
        this._revision.next(this._revision.value + 1);
        this._unitChanges.next(unitId);
    }

    clearUnit(unitId: string): void {
        this._initialized.delete(unitId);
        this._generations.delete(unitId);
        this._policies.delete(unitId);
        this._revision.next(this._revision.value + 1);
        this._unitChanges.next(unitId);
    }

    private _assertSupported(target: IObjectPermissionTarget): void {
        if (!this.supports(target)) {
            throw new Error('Object permission management is not supported by this Authz provider.');
        }
    }
}
