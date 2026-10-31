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

import { UnitAction, UnitObject, UnitRole } from '@univerjs/protocol';
import { BehaviorSubject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { IWorkbookData } from '../../../sheets/typedef';
import type { Workbook } from '../../../sheets/workbook';
import type { Univer } from '../../../univer';
import { createTestBed } from '../../__tests__/create-test-bed';
import { UnitModel, UniverInstanceType } from '../../../common/unit';
import { Tools } from '../../../shared/tools';
import { LocaleType } from '../../../types/enum';
import { IUniverInstanceService } from '../../instance/instance.service';
import { LocaleService } from '../../locale/locale.service';
import { IResourceLoaderService } from '../../resource-loader/type';
import { IResourceManagerService } from '../../resource-manager/type';
import { UserManagerService } from '../../user-manager/user-manager.service';
import { AuthzIoLocalService } from '../authz-io-local.service';
import { IAuthzIoService } from '../type';

interface ITestBoardData {
    id: string;
    name?: string;
    resources?: Array<{ name: string; data: string }>;
}

class MockBoardUnit extends UnitModel<ITestBoardData, UniverInstanceType.UNIVER_BOARD> {
    override readonly type = UniverInstanceType.UNIVER_BOARD;
    override name$ = new BehaviorSubject('');
    private readonly _snapshot: ITestBoardData;

    constructor(snapshot: Partial<ITestBoardData> = {}) {
        super();
        this._snapshot = {
            id: 'board-resource',
            name: '',
            ...snapshot,
        };
        this.name$.next(this._snapshot.name ?? '');
    }

    override getUnitId(): string {
        return this._snapshot.id;
    }

    override setName(name: string): void {
        this._snapshot.name = name;
        this.name$.next(name);
    }

    override getSnapshot(): ITestBoardData {
        return this._snapshot;
    }

    override getRev(): number {
        return 1;
    }

    override incrementRev(): void { }

    override setRev(): void { }
}

describe('AuthzIoLocalService', () => {
    let univer: Univer;
    let unitId: string;

    beforeEach(() => {
        const instance = createTestBed();
        univer = instance.univer;
        unitId = instance.unitId;
        const locale = instance.get(LocaleService);
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
    });

    afterEach(() => {
        univer.dispose();
    });

    async function createPermission(owner: string, name: string) {
        const authz = univer.__getInjector().get(IAuthzIoService);
        const objectID = await authz.create({
            objectType: UnitObject.SelectRange,
            selectRangeObject: { unitID: owner, name, collaborators: [], scope: undefined },
        });
        await authz.update({
            objectType: UnitObject.SelectRange,
            objectID,
            unitID: owner,
            name,
            strategies: [{ action: UnitAction.Edit, role: UnitRole.Reader }],
            share: undefined,
            scope: undefined,
            collaborators: undefined,
        });
        return objectID;
    }

    function createIndependentWorkbook() {
        const instances = univer.__getInjector().get(IUniverInstanceService);
        const workbook = instances.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            throw new Error('Expected actual workbook');
        }
        return univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            ...Tools.deepClone(workbook.getSnapshot()),
            id: 'independent',
            name: 'Independent',
            resources: [],
        });
    }

    it('persists both explicit boolean overrides and preserves direct role updates and independent ownership', async () => {
        const injector = univer.__getInjector();
        const authz = injector.get(IAuthzIoService);
        if (!(authz instanceof AuthzIoLocalService)) {
            throw new TypeError('The real local authorization provider is required');
        }
        createIndependentWorkbook();
        const loader = injector.get(IResourceLoaderService);
        const objectID = await createPermission(unitId, 'Input');
        const foreign = Tools.deepClone(loader.saveUnit('independent'));
        authz.setPermissionOverride(objectID, UnitAction.Edit, true);
        authz.setPermissionOverride(objectID, UnitAction.View, false);
        const saved = loader.saveUnit<IWorkbookData>(unitId)!;
        const resource = saved.resources!.find((entry) => entry.name === 'SHEET_AuthzIoMockService_PLUGIN')!;
        expect(JSON.parse(resource.data)[objectID].overrides).toEqual({
            [UnitAction.Edit]: true,
            [UnitAction.View]: false,
        });
        injector.get(IUniverInstanceService).disposeUnit(unitId);
        univer.createUnit(UniverInstanceType.UNIVER_SHEET, JSON.parse(JSON.stringify(saved)));
        expect(await authz.allowed({ unitID: unitId, objectID, objectType: UnitObject.SelectRange, actions: [UnitAction.Edit, UnitAction.View] }))
            .toEqual([{ action: UnitAction.Edit, allowed: true }, { action: UnitAction.View, allowed: false }]);
        await authz.update({
            unitID: unitId,
            objectID,
            objectType: UnitObject.SelectRange,
            name: 'Input',
            strategies: [{ action: UnitAction.Edit, role: UnitRole.Editor }],
            scope: undefined,
            collaborators: undefined,
            share: undefined,
        });
        expect(await authz.allowed({ unitID: unitId, objectID, objectType: UnitObject.SelectRange, actions: [UnitAction.Edit] }))
            .toEqual([{ action: UnitAction.Edit, allowed: false }]);
        const legacy = JSON.parse(JSON.stringify(saved)) as IWorkbookData;
        const legacyResource = legacy.resources!.find((entry) => entry.name === resource.name)!;
        const data = JSON.parse(legacyResource.data);
        delete data[objectID].overrides;
        data[objectID].strategies = [{ action: UnitAction.Edit, role: UnitRole.Owner }];
        legacyResource.data = JSON.stringify(data);
        injector.get(IResourceManagerService).loadResources(unitId, legacy.resources);
        expect(await authz.allowed({ unitID: unitId, objectID, objectType: UnitObject.SelectRange, actions: [UnitAction.Edit, UnitAction.View] }))
            .toEqual([{ action: UnitAction.Edit, allowed: true }, { action: UnitAction.View, allowed: true }]);
        expect(loader.saveUnit('independent')).toEqual(foreign);
    });

    it('creates only the live workbook root authorization object and rejects foreign and missing owner updates', async () => {
        const injector = univer.__getInjector();
        const authz = injector.get(IAuthzIoService);
        const loader = injector.get(IResourceLoaderService);
        createIndependentWorkbook();
        const ownBefore = Tools.deepClone(loader.saveUnit(unitId));
        const foreignBefore = Tools.deepClone(loader.saveUnit('independent'));
        for (const [objectID, owner] of [[unitId, 'independent'], ['missing', 'missing'], ['unregistered', unitId]]) {
            await expect(authz.update({
                unitID: owner,
                objectID,
                objectType: UnitObject.Workbook,
                name: 'Invalid owner',
                strategies: [{ action: UnitAction.Edit, role: UnitRole.Reader }],
                scope: undefined,
                collaborators: undefined,
                share: undefined,
            })).rejects.toThrow(/permission object/i);
        }
        expect(loader.saveUnit(unitId)).toEqual(ownBefore);
        expect(loader.saveUnit('independent')).toEqual(foreignBefore);
        await authz.update({
            unitID: unitId,
            objectID: unitId,
            objectType: UnitObject.Workbook,
            name: 'Workbook',
            strategies: [{ action: UnitAction.Edit, role: UnitRole.Reader }],
            scope: undefined,
            collaborators: undefined,
            share: undefined,
        });
        const saved = loader.saveUnit<IWorkbookData>(unitId)!;
        expect(await authz.allowed({ unitID: unitId, objectID: unitId, objectType: UnitObject.Workbook, actions: [UnitAction.Edit] }))
            .toEqual([{ action: UnitAction.Edit, allowed: false }]);
        await expect(authz.update({
            unitID: 'independent',
            objectID: unitId,
            objectType: UnitObject.Workbook,
            name: 'Foreign root',
            strategies: [{ action: UnitAction.Edit, role: UnitRole.Owner }],
            scope: undefined,
            collaborators: undefined,
            share: undefined,
        })).rejects.toThrow(/unitID/);
        expect(loader.saveUnit(unitId)).toEqual(saved);
        expect(loader.saveUnit('independent')).toEqual(foreignBefore);
    });

    it('saves only the requested workbook permission objects without leaking another workbook', async () => {
        univer.__getInjector().get(IAuthzIoService);
        const independent = createIndependentWorkbook();
        const loader = univer.__getInjector().get(IResourceLoaderService);
        const before = loader.saveUnit<IWorkbookData>(independent.getUnitId());
        const ownerID = await createPermission(unitId, 'Owner range');
        expect(loader.saveUnit<IWorkbookData>(independent.getUnitId())).toEqual(before);
        const independentID = await createPermission(independent.getUnitId(), 'Independent range');
        const ownResource = loader.saveUnit<IWorkbookData>(unitId)?.resources.find((resource) => resource.name === 'SHEET_AuthzIoMockService_PLUGIN');
        const independentResource = loader.saveUnit<IWorkbookData>(independent.getUnitId())?.resources.find((resource) => resource.name === 'SHEET_AuthzIoMockService_PLUGIN');
        expect(Object.keys(JSON.parse(ownResource!.data))).toEqual([ownerID]);
        expect(Object.keys(JSON.parse(independentResource!.data))).toEqual([independentID]);
    });

    it('unloads and reloads one workbook without erasing or reverting another workbook authorization edits', async () => {
        const independent = createIndependentWorkbook();
        const injector = univer.__getInjector();
        const authz = injector.get(IAuthzIoService);
        const loader = injector.get(IResourceLoaderService);
        const instances = injector.get(IUniverInstanceService);
        const ownerID = await createPermission(unitId, 'Owner range');
        const independentID = await createPermission(independent.getUnitId(), 'Independent range');
        const ownerSnapshot = loader.saveUnit<IWorkbookData>(unitId);
        const independentSnapshot = loader.saveUnit<IWorkbookData>(independent.getUnitId());
        const request = {
            unitID: independent.getUnitId(),
            objectIDs: [independentID],
            actions: [UnitAction.Edit],
        };
        const before = await authz.list(request);
        expect(before[0]).toMatchObject({ name: 'Independent range', actions: [{ action: UnitAction.Edit, allowed: false }] });
        expect(instances.disposeUnit(unitId)).toBe(true);
        expect((await authz.list(request)).map(({ creator, ...permission }) => permission))
            .toEqual(before.map(({ creator, ...permission }) => permission));
        expect(loader.saveUnit<IWorkbookData>(independent.getUnitId())).toEqual(independentSnapshot);
        univer.createUnit(UniverInstanceType.UNIVER_SHEET, JSON.parse(JSON.stringify(ownerSnapshot)));
        await authz.update({
            objectType: UnitObject.SelectRange,
            objectID: independentID,
            unitID: independent.getUnitId(),
            name: 'Independent range',
            strategies: [{ action: UnitAction.Edit, role: UnitRole.Owner }],
            share: undefined,
            scope: undefined,
            collaborators: undefined,
        });
        expect((await authz.list(request))[0].actions).toEqual([{ action: UnitAction.Edit, allowed: true }]);
        expect(await authz.allowed({ unitID: unitId, objectID: ownerID, objectType: UnitObject.SelectRange, actions: [UnitAction.Edit] }))
            .toEqual([{ action: UnitAction.Edit, allowed: false }]);
        expect(loader.saveUnit<IWorkbookData>(unitId)).toEqual(ownerSnapshot);
        const saved = loader.saveUnit<IWorkbookData>(independent.getUnitId());
        expect(instances.disposeUnit(independent.getUnitId())).toBe(true);
        univer.createUnit(UniverInstanceType.UNIVER_SHEET, JSON.parse(JSON.stringify(saved)));
        expect((await authz.list(request))[0].actions).toEqual([{ action: UnitAction.Edit, allowed: true }]);
        expect(loader.saveUnit<IWorkbookData>(unitId)).toEqual(ownerSnapshot);
    });

    it('ignores foreign permission records in a legacy mixed snapshot and clears only unloaded object overrides', async () => {
        const independent = createIndependentWorkbook();
        const injector = univer.__getInjector();
        const authz = injector.get(IAuthzIoService);
        const loader = injector.get(IResourceLoaderService);
        const instances = injector.get(IUniverInstanceService);
        const ownerID = await createPermission(unitId, 'Owner range');
        const independentID = await createPermission(independent.getUnitId(), 'Independent range');
        const ownerSnapshot = loader.saveUnit<IWorkbookData>(unitId);
        const independentSnapshot = loader.saveUnit<IWorkbookData>(independent.getUnitId());
        if (!ownerSnapshot || !independentSnapshot) {
            throw new Error('Expected both real workbook snapshots');
        }
        const ownResource = ownerSnapshot.resources.find((resource) => resource.name === 'SHEET_AuthzIoMockService_PLUGIN')!;
        const foreignResource = independentSnapshot.resources.find((resource) => resource.name === 'SHEET_AuthzIoMockService_PLUGIN')!;
        const ownData = JSON.parse(ownResource.data);
        const foreignData = JSON.parse(foreignResource.data);
        ownData[ownerID].strategies = [{ action: UnitAction.Edit, role: UnitRole.Owner }];
        delete ownData[ownerID].overrides;
        foreignData[independentID].name = 'Stale foreign range';
        ownResource.data = JSON.stringify({ ...ownData, ...foreignData });
        expect(instances.disposeUnit(unitId)).toBe(true);
        univer.createUnit(UniverInstanceType.UNIVER_SHEET, JSON.parse(JSON.stringify(ownerSnapshot)));
        expect(await authz.allowed({ unitID: unitId, objectID: ownerID, objectType: UnitObject.SelectRange, actions: [UnitAction.Edit] }))
            .toEqual([{ action: UnitAction.Edit, allowed: true }]);
        expect((await authz.list({ unitID: independent.getUnitId(), objectIDs: [independentID], actions: [UnitAction.Edit] }))[0].name)
            .toBe('Independent range');
        expect(loader.saveUnit<IWorkbookData>(independent.getUnitId())).toEqual(independentSnapshot);
        expect(Object.keys(JSON.parse(loader.saveUnit<IWorkbookData>(unitId)!.resources.find((resource) => resource.name === 'SHEET_AuthzIoMockService_PLUGIN')!.data))).toEqual([ownerID]);
    });

    it('replaces a loaded legacy unit resource without keeping stale overrides or removed objects and preserves other units', async () => {
        const independent = createIndependentWorkbook();
        const injector = univer.__getInjector();
        const authz = injector.get(IAuthzIoService);
        const loader = injector.get(IResourceLoaderService);
        const ownerID = await createPermission(unitId, 'Owner range');
        const removedID = await createPermission(unitId, 'Removed range');
        await createPermission(independent.getUnitId(), 'Independent range');
        const independentBefore = loader.saveUnit<IWorkbookData>(independent.getUnitId());
        const snapshot = loader.saveUnit<IWorkbookData>(unitId);
        if (!snapshot) {
            throw new Error('Expected actual workbook snapshot');
        }
        const resource = snapshot.resources.find((item) => item.name === 'SHEET_AuthzIoMockService_PLUGIN')!;
        const data = JSON.parse(resource.data);
        data[ownerID].strategies = [{ action: UnitAction.Edit, role: UnitRole.Owner }];
        delete data[ownerID].overrides;
        delete data[removedID];
        resource.data = JSON.stringify(data);
        injector.get(IResourceManagerService).loadResources(unitId, snapshot.resources);
        expect(await authz.allowed({ unitID: unitId, objectID: ownerID, objectType: UnitObject.SelectRange, actions: [UnitAction.Edit] }))
            .toEqual([{ action: UnitAction.Edit, allowed: true }]);
        expect((await authz.list({ unitID: unitId, objectIDs: [removedID], actions: [UnitAction.Edit] }))[0].name).toBe('');
        expect(loader.saveUnit<IWorkbookData>(unitId)).toEqual(snapshot);
        expect(loader.saveUnit<IWorkbookData>(independent.getUnitId())).toEqual(independentBefore);
    });

    it('should persist and reload permission resources through a real workbook lifecycle', async () => {
        const injector = univer.__getInjector();
        const authzIoService = injector.get(IAuthzIoService);
        const resourceLoaderService = injector.get(IResourceLoaderService);
        const userManagerService = injector.get(UserManagerService);

        userManagerService.setCurrentUser({
            userID: 'Owner_real-user',
            name: 'Owner User',
            avatar: '',
        });

        const objectID = await authzIoService.create({
            objectType: UnitObject.SelectRange,
            selectRangeObject: {
                unitID: unitId,
                name: 'Protected range',
                collaborators: [],
                scope: undefined,
            },
        });

        expect(await authzIoService.allowed({ unitID: unitId, objectID, objectType: UnitObject.SelectRange, actions: [UnitAction.Edit] })).toEqual([
            { action: UnitAction.Edit, allowed: true },
        ]);

        await authzIoService.update({
            objectType: UnitObject.SelectRange,
            objectID,
            unitID: unitId,
            share: undefined,
            name: 'Protected range',
            strategies: [{ action: UnitAction.Edit, role: UnitRole.Reader }],
            scope: undefined,
            collaborators: undefined,
        });

        expect(await authzIoService.allowed({ unitID: unitId, objectID, objectType: UnitObject.SelectRange, actions: [UnitAction.Edit] })).toEqual([
            { action: UnitAction.Edit, allowed: false },
        ]);

        const listed = await authzIoService.list({
            unitID: unitId,
            objectIDs: [objectID],
            actions: [UnitAction.Edit, UnitAction.View],
        });

        expect(listed).toHaveLength(1);
        expect(listed[0].name).toBe('Protected range');
        expect(listed[0].actions).toContainEqual({ action: UnitAction.Edit, allowed: false });

        const batched = await authzIoService.batchAllowed([
            { unitID: unitId, objectID, objectType: UnitObject.SelectRange, actions: [UnitAction.Edit] },
            { unitID: unitId, objectID: 'missing', objectType: UnitObject.SelectRange, actions: [UnitAction.View] },
        ]);

        expect(batched[0].actions).toEqual([{ action: UnitAction.Edit, allowed: false }]);
        expect(batched[1].actions).toEqual([{ action: UnitAction.View, allowed: true }]);

        expect(await authzIoService.listCollaborators({ unitID: unitId, objectID })).toEqual([]);
        expect(await authzIoService.listRoles({ objectType: UnitObject.SelectRange })).toEqual({ roles: [], actions: [] });
        await expect(authzIoService.createCollaborator({ unitID: unitId, objectID } as never)).resolves.toBeUndefined();
        await expect(authzIoService.updateCollaborator({ unitID: unitId, objectID } as never)).resolves.toBeUndefined();
        await expect(authzIoService.deleteCollaborator({ unitID: unitId, objectID } as never)).resolves.toBeUndefined();
        await expect(authzIoService.putCollaborators({ unitID: unitId, objectID, collaborators: [] })).resolves.toBeUndefined();

        const snapshot = resourceLoaderService.saveUnit(unitId);
        const authzResource = snapshot?.resources.find((resource) => resource.name === 'SHEET_AuthzIoMockService_PLUGIN');

        expect(authzResource?.data).toContain(objectID);

        injector.get(IUniverInstanceService).disposeUnit(unitId);

        const unloaded = await authzIoService.list({
            unitID: unitId,
            objectIDs: [objectID],
            actions: [UnitAction.Edit],
        });

        expect(unloaded[0].name).toBe('');
        expect(unloaded[0].actions).toEqual([{ action: UnitAction.Edit, allowed: true }]);

        univer.createUnit(UniverInstanceType.UNIVER_SHEET, snapshot!);

        const reloaded = await authzIoService.list({
            unitID: unitId,
            objectIDs: [objectID],
            actions: [UnitAction.Edit],
        });

        expect(reloaded[0].name).toBe('Protected range');
        expect(reloaded[0].actions).toEqual([{ action: UnitAction.Edit, allowed: false }]);
    });

    it('should persist and reload permission resources for board units', async () => {
        const injector = univer.__getInjector();
        const authzIoService = injector.get(IAuthzIoService);
        const resourceLoaderService = injector.get(IResourceLoaderService);
        const univerInstanceService = injector.get(IUniverInstanceService);

        univerInstanceService.registerCtorForType(UniverInstanceType.UNIVER_BOARD, MockBoardUnit);
        const board = univer.createUnit<ITestBoardData, MockBoardUnit>(UniverInstanceType.UNIVER_BOARD, {
            id: 'board-resource',
        });
        const objectID = await authzIoService.create({
            objectType: UnitObject.Workbook,
            worksheetObject: {
                unitID: board.getUnitId(),
                name: 'Board permission',
                collaborators: [],
                strategies: [{ action: UnitAction.Edit, role: UnitRole.Owner }],
                scope: undefined,
            },
        });

        const snapshot = resourceLoaderService.saveUnit<ITestBoardData>(board.getUnitId());
        const authzResource = snapshot?.resources?.find((resource) => resource.name === 'SHEET_AuthzIoMockService_PLUGIN');

        expect(authzResource?.data).toContain(objectID);

        expect(univerInstanceService.disposeUnit(board.getUnitId())).toBe(true);

        const unloaded = await authzIoService.list({
            unitID: board.getUnitId(),
            objectIDs: [objectID],
            actions: [UnitAction.Edit],
        });

        expect(unloaded[0].name).toBe('');
        expect(unloaded[0].actions).toEqual([{ action: UnitAction.Edit, allowed: true }]);

        univer.createUnit<ITestBoardData, MockBoardUnit>(UniverInstanceType.UNIVER_BOARD, snapshot!);

        const reloaded = await authzIoService.list({
            unitID: board.getUnitId(),
            objectIDs: [objectID],
            actions: [UnitAction.Edit],
        });

        expect(reloaded[0].name).toBe('Board permission');
        expect(reloaded[0].actions).toEqual([{ action: UnitAction.Edit, allowed: true }]);
    });
});
