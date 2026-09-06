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

import type { IBatchAllowedResponse, ICollaborator, ICreateRequest, IListPermPointResponse } from '@univerjs/protocol';
import type { IDisposable } from '../../common/di';
import type { IObjectPermissionRule, ObjectPermissionRuleModel } from './object-permission-rule.model';
import type { IPermissionPoint } from './type';
import { ObjectScope, UnitAction, UnitObject, UnitRole } from '@univerjs/protocol';
import { BehaviorSubject, Subject } from 'rxjs';
import { Inject, Injector } from '../../common/di';
import { Disposable, toDisposable } from '../../shared/lifecycle';
import { IAuthzIoService } from '../authz-io/type';
import { ICommandService } from '../command/command.service';
import { IConfigService } from '../config/config.service';
import { ILogService } from '../log/log.service';
import { IUndoRedoService } from '../undoredo/undoredo.service';
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

/** Frontend opt-in; does not change the Authz service interface or existing local setters. */
export const OBJECT_PERMISSION_CONFIG_KEY = 'objectPermissionTypes';

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
    private readonly _models = new Map<UnitObject, { model: ObjectPermissionRuleModel; mutationId: string }>();
    private readonly _initialized = new Set<string>();
    private readonly _policies = new Map<string, IListPermPointResponse['objects'][number][]>();
    private readonly _generations = new Map<string, number>();
    private _nextGeneration = 0;
    private readonly _revision = new BehaviorSubject(0);
    readonly changed$ = this._revision.asObservable();
    private readonly _unitChanges = new Subject<string>();
    readonly unitChanges$ = this._unitChanges.asObservable();

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IPermissionService private readonly _permissions: IPermissionService,
        @ILogService private readonly _logService: ILogService,
        @Inject(UserManagerService) private readonly _users: UserManagerService,
        @IConfigService private readonly _config: IConfigService,
        @ICommandService private readonly _commands: ICommandService
    ) {
        super();
        this.disposeWithMe(this._permissions.permissionPointUpdate$.subscribe((point) => {
            if (point.subType === UnitAction.Edit && ROOT_OBJECT_TYPES[point.type] === point.type) {
                this._revision.next(this._revision.value + 1);
            }
        }));
        this.disposeWithMe(() => {
            this._initialized.clear();
            this._policies.clear();
            this._generations.clear();
            this._revision.complete();
            this._unitChanges.complete();
        });
    }

    private get _authz(): IAuthzIoService {
        return this._injector.get(IAuthzIoService);
    }

    registerRuleModel(rootType: UnitObject, model: ObjectPermissionRuleModel, mutationId: string): IDisposable {
        if (this._models.has(rootType)) {
            throw new Error('Object permission rule model already registered.');
        }
        this._models.set(rootType, { model, mutationId });
        const subscription = model.changed$.subscribe((unitId) => {
            this._generations.delete(unitId);
            this._policies.delete(unitId);
            // A replayed binding takes effect immediately; do not leave old editable rights while Authz loads.
            model.getRules(unitId).forEach((rule) => {
                if (!this.supports({ unitId, objectId: rule.objectId, objectType: rule.objectType })) {
                    return;
                }
                const id = `${rule.objectType}.${UnitAction.Edit}_${unitId}_${rule.objectId}`;
                if (!this._permissions.getPermissionPoint(id)) {
                    this._permissions.addPermissionPoint({ id, type: rule.objectType, subType: UnitAction.Edit, value: false, status: PermissionStatus.INIT, unitId, objectId: rule.objectId } as IPermissionPoint);
                } else {
                    this._permissions.updatePermissionPoint(id, false);
                }
            });
            this._revision.next(this._revision.value + 1);
            if (this._initialized.has(unitId)) {
                this.refreshUnit(unitId).catch((error: unknown) => this._logService.error(error));
            }
        });
        return this.disposeWithMe(toDisposable(() => {
            subscription.unsubscribe();
            this._models.delete(rootType);
        }));
    }

    private _getRule(target: IObjectPermissionTarget): IObjectPermissionRule | undefined {
        return this._models.get(ROOT_OBJECT_TYPES[target.objectType]!)?.model.getRule(target.unitId, target.objectType, target.objectId);
    }

    private _getAuthzId(target: IObjectPermissionTarget): string | undefined {
        return target.objectId === target.unitId ? target.unitId : this._getRule(target)?.permissionId;
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
        return this._config.getConfig<UnitObject[]>(OBJECT_PERMISSION_CONFIG_KEY)?.includes(target.objectType) === true &&
            this._models.has(ROOT_OBJECT_TYPES[target.objectType]!);
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
        if (!this._getRule(target) && target.objectId !== target.unitId) {
            const rootType = ROOT_OBJECT_TYPES[target.objectType];
            return rootType !== undefined && this._allowed({ ...target, objectId: target.unitId, objectType: rootType }, UnitAction.CreatePermissionObject);
        }
        return (target.objectId === target.unitId || !!object) && this._canChangeRule(target, object, UnitAction.ManageCollaborator);
    }

    async canDelete(target: IObjectPermissionTarget): Promise<boolean> {
        if (!this.supports(target) || target.objectId === target.unitId) {
            return false;
        }
        const object = await this._getPolicy(target);
        return !!object && this._canChangeRule(target, object, UnitAction.Delete);
    }

    /** Must be called from a product permission Command; removal restores inheritance by detaching the rule. */
    async remove(target: IObjectPermissionTarget): Promise<void> {
        const permissionId = this._getRule(target)?.permissionId;
        if (!await this.canDelete(target)) {
            throw new Error('Object permission deletion denied.');
        }
        await this._commitRule(target, null, permissionId);
        await this.refreshUnit(target.unitId);
    }

    private async _commitRule(target: IObjectPermissionTarget, rule: IObjectPermissionRule | null, expectedId: string | undefined): Promise<void> {
        const registration = this._models.get(ROOT_OBJECT_TYPES[target.objectType]!);
        if (!registration) {
            throw new Error('Object permission rule model is not registered.');
        }
        const previous = this._getRule(target) ?? null;
        if (previous?.permissionId !== expectedId) {
            throw new Error('Object permission binding changed during the request.');
        }
        const redo = { id: registration.mutationId, params: { ...target, rule } };
        const undo = { id: registration.mutationId, params: { ...target, rule: previous } };
        if (!await this._commands.executeCommand(redo.id, redo.params)) {
            throw new Error('Could not update the object permission binding.');
        }
        this._injector.get(IUndoRedoService).pushUndoRedo({ unitID: target.unitId, redoMutations: [redo], undoMutations: [undo] });
    }

    private async _getPolicy(target: IObjectPermissionTarget) {
        const objectID = this._getAuthzId(target);
        if (!objectID) {
            return undefined;
        }
        const objects = await this._authz.list({ unitID: target.unitId, objectIDs: [objectID], actions: [] });
        return objects.find((item) => item.unitID === target.unitId && item.objectID === objectID && item.objectType === target.objectType);
    }

    private async _allowed(target: IObjectPermissionTarget, action: UnitAction): Promise<boolean> {
        const objectID = this._getAuthzId(target);
        if (!objectID) {
            return false;
        }
        const actions = await this._authz.allowed({ unitID: target.unitId, objectID, objectType: target.objectType, actions: [action] });
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
        const objectID = this._getAuthzId(target);
        if (!objectID) {
            return { edit: 'all', collaborators: [], strategies: [] };
        }
        const [object, collaborators] = await Promise.all([
            this._getPolicy(target),
            target.objectId === target.unitId ? [] : this._authz.listCollaborators({ unitID: target.unitId, objectID }),
        ]);
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
        if (!this.supports(target)) {
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
        const permissionId = this._getRule(target)?.permissionId;
        if (!await this.canManage(target)) {
            throw new Error('Object permission management denied.');
        }
        if (target.objectId === target.unitId && policy.edit === 'members') {
            throw new Error('File membership must be managed through the sharing service.');
        }
        if (policy.edit === 'members' && !policy.collaborators.length) {
            throw new Error('Select at least one collaborator.');
        }
        const previous = await this._getPolicy(target);
        const strategies = policy.strategies.filter((strategy) => strategy.action !== UnitAction.Edit);
        strategies.push({ action: UnitAction.Edit, role: policy.edit === 'owner' ? UnitRole.Owner : UnitRole.Editor });
        let editScope = ObjectScope.AllCollaborator;
        if (policy.edit === 'members') {
            editScope = ObjectScope.SomeCollaborator;
        } else if (policy.edit === 'owner') {
            editScope = ObjectScope.OneSelf;
        }
        const scope = { read: previous?.scope?.read ?? ObjectScope.AllCollaborator, edit: editScope };
        let objectID = this._getAuthzId(target);
        if (!objectID) {
            const payload = {
                unitID: target.unitId,
                name: target.objectId,
                strategies,
                scope,
                collaborators: policy.edit === 'members' ? policy.collaborators : [],
            };
            const request: ICreateRequest = { objectType: target.objectType };
            switch (ROOT_OBJECT_TYPES[target.objectType]) {
                case UnitObject.Document:
                    request.documentObject = payload;
                    break;
                case UnitObject.Slide:
                    request.slideObject = payload;
                    break;
                case UnitObject.Base:
                    request.baseObject = payload;
                    break;
                case UnitObject.Board:
                    request.boardObject = payload;
                    break;
                default: throw new Error('Unsupported object permission type.');
            }
            objectID = await this._authz.create(request);
            if (!objectID) {
                throw new Error('Authz did not return a permission ID.');
            }
            await this._commitRule(target, { objectId: target.objectId, objectType: target.objectType, permissionId: objectID }, permissionId);
        } else {
            if (this._getRule(target)?.permissionId !== permissionId) {
                throw new Error('Object permission binding changed during the request.');
            }
            await this._authz.update({
                unitID: target.unitId,
                objectID,
                objectType: target.objectType,
                name: previous?.name ?? target.objectId,
                share: undefined,
                strategies,
                scope,
                collaborators: target.objectId === target.unitId ? undefined : { collaborators: policy.edit === 'members' ? policy.collaborators : [] },
            });
        }
        // Never use the requested boolean as this user's result: owners and collaborators differ.
        await this.refreshUnit(target.unitId);
    }

    async refreshUnit(unitId: string): Promise<void> {
        if (this._disposed) {
            return;
        }
        const bindings = [...this._models.values()].flatMap(({ model }) => model.getRules(unitId));
        const bindingMap = new Map(bindings.map((rule) => [`${rule.objectType}/${rule.objectId}`, rule]));
        const requests = new Map<string, { unitID: string; objectID: string; objectType: UnitObject; actions: UnitAction[]; targetId: string }>();
        const include = (objectID: string, objectType: UnitObject, targetId: string, actions: UnitAction[]) => {
            if (!this.supports({ unitId, objectId: targetId, objectType })) {
                return;
            }
            const key = `${objectType}/${objectID}`;
            const previous = requests.get(key);
            requests.set(key, { unitID: unitId, objectID, objectType, targetId, actions: [...new Set([...(previous?.actions ?? []), ...actions])] });
        };
        const inheritedPoints: string[] = [];
        bindings.forEach((rule) => include(rule.permissionId, rule.objectType, rule.objectId, [UnitAction.Edit]));
        this._permissions.getAllPermissionPoint().forEach((point$) => {
            const subscription = point$.subscribe((point) => {
                if (!('unitId' in point) || point.unitId !== unitId) {
                    return;
                }
                const objectId = 'objectId' in point && typeof point.objectId === 'string' ? point.objectId : unitId;
                const binding = bindingMap.get(`${point.type}/${objectId}`);
                if (objectId === unitId) {
                    include(unitId, point.type, unitId, [point.subType]);
                } else if (binding) {
                    include(binding.permissionId, point.type, objectId, [point.subType]);
                } else if (this.supports({ unitId, objectId, objectType: point.type })) {
                    // Unbound objects inherit. Business checks still enforce all containing-object restrictions.
                    inheritedPoints.push(point.id);
                }
            });
            subscription.unsubscribe();
        });
        inheritedPoints.forEach((id) => this._permissions.updatePermissionPoint(id, true));
        const generation = ++this._nextGeneration;
        this._generations.set(unitId, generation);
        const values = [...requests.values()];
        if (values.length) {
            this._initialized.add(unitId);
        }
        const policies: IListPermPointResponse['objects'] = [];
        const results: IBatchAllowedResponse['objectActions'] = [];
        for (let offset = 0; offset < values.length; offset += 100) {
            const batch = values.slice(offset, offset + 100);
            const batchPolicies = await this._authz.list({ unitID: unitId, objectIDs: batch.map((item) => item.objectID), actions: [] });
            policies.push(...batchPolicies);
            batch.forEach((request) => {
                const policy = batchPolicies.find((item) => item.objectID === request.objectID && item.objectType === request.objectType);
                request.actions = [...new Set([...request.actions, ...(policy?.strategies.map((strategy) => strategy.action) ?? [])])];
            });
            results.push(...await this._authz.batchAllowed(batch.map(({ targetId, ...request }) => request)));
        }
        if (this._disposed || this._generations.get(unitId) !== generation) {
            return;
        }
        const resultMap = new Map(results.filter((item) => item.unitID === unitId).map((item) => [item.objectID, item]));
        const policyMap = new Map(policies.filter((item) => item.unitID === unitId).map((item) => [`${item.objectType}/${item.objectID}`, item]));
        values.forEach((request) => {
            const result = resultMap.get(request.objectID);
            const policy = policyMap.get(`${request.objectType}/${request.objectID}`);
            const actions = [...new Set([...request.actions, ...(policy?.strategies.map((strategy) => strategy.action) ?? [])])];
            actions.forEach((action) => {
                const id = `${request.objectType}.${action}_${unitId}${request.targetId === unitId ? '' : `_${request.targetId}`}`;
                if (!this._permissions.getPermissionPoint(id)) {
                    this._permissions.addPermissionPoint({ id, type: request.objectType, subType: action, status: PermissionStatus.DONE, value: false, unitId, objectId: request.targetId } as IPermissionPoint);
                }
                this._permissions.updatePermissionPoint(id, result?.actions.some((item) => item.action === action && item.allowed === true) ?? false);
            });
        });
        this._policies.set(unitId, policies.filter((policy) => policy.unitID === unitId).map((policy) => ({
            ...policy,
            objectID: requests.get(`${policy.objectType}/${policy.objectID}`)?.targetId ?? policy.objectID,
        })));
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
