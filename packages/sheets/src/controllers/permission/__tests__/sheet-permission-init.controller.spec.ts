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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import {
    AuthzIoLocalService,
    createDefaultUser,
    Disposable,
    IAuthzIoService,
    Inject,
    IResourceLoaderService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    Tools,
    Univer,
    UniverInstanceType,
    UserManagerService,
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UnitAction, UnitObject, UnitRole } from '@univerjs/protocol';
import { describe, expect, it } from 'vitest';
import enUS from '../../../locale/en-US';
import { UniverSheetsPlugin } from '../../../plugin';
import { SheetPermissionInitController } from '../sheet-permission-init.controller';
import '../../../facade/f-enum';
import '../../../facade/f-univer';
import '../../../facade/f-range';
import '../../../facade/f-workbook';
import '../../../facade/f-worksheet';

// Only the external authorization response timing is controlled; its result is computed by the real local provider.
class QueuedAuthorizationProvider extends Disposable implements IAuthzIoService {
    public held = false;
    public updates: Parameters<IAuthzIoService['update']>[0][] = [];
    private _pending: Array<() => void> = [];
    public failure: Error | undefined;
    private _responses: Array<ReturnType<IAuthzIoService['allowed']>> = [];
    private _batches: Array<ReturnType<IAuthzIoService['batchAllowed']>> = [];

    constructor(@Inject(AuthzIoLocalService) public readonly local: AuthzIoLocalService) {
        super();
    }

    get pendingCount() { return this._pending.length; }

    allowed(...args: Parameters<IAuthzIoService['allowed']>) {
        const pending = this.local.allowed(args[0]).then((result) => {
            if (this.failure) {
                throw this.failure;
            }
            if (!this.held) {
                return result;
            }
            return new Promise<typeof result>((resolve) => this._pending.push(() => resolve(result)));
        });
        this._responses.push(pending);
        return pending;
    }

    batchAllowed(...args: Parameters<IAuthzIoService['batchAllowed']>) {
        const pending = Promise.all(args[0].map(async (config) => ({
            unitID: config.unitID,
            objectID: config.objectID,
            actions: await this.allowed(config, args[1]),
        })));
        this._batches.push(pending);
        return pending;
    }

    waitForResponses() { return Promise.all([...this._responses, ...this._batches]); }

    release() {
        this.held = false;
        this._pending.splice(0).forEach((resolve) => resolve());
    }

    releaseOne(index: number) {
        const resolve = this._pending.splice(index, 1)[0];
        if (!resolve) {
            throw new Error('The expected external response is not pending');
        }
        resolve();
    }

    create(...args: Parameters<IAuthzIoService['create']>) { return this.local.create(args[0]); }
    list(...args: Parameters<IAuthzIoService['list']>) { return this.local.list(args[0]); }
    listRoles() { return this.local.listRoles(); }
    update(...args: Parameters<IAuthzIoService['update']>) {
        this.updates.push(Tools.deepClone(args[0]));
        return this.local.update(args[0]);
    }

    listCollaborators() {
        return this.local.listCollaborators();
    }

    updateCollaborator() {
        return this.local.updateCollaborator();
    }

    deleteCollaborator() {
        return this.local.deleteCollaborator();
    }

    createCollaborator() {
        return this.local.createCollaborator();
    }

    putCollaborators(...args: Parameters<IAuthzIoService['putCollaborators']>) {
        return this.local.putCollaborators(args[0]);
    }

    override dispose() {
        this.release();
        super.dispose();
    }
}

function createRuntime() {
    const univer = new Univer({ override: [[IAuthzIoService, { useClass: QueuedAuthorizationProvider }]] });
    const injector = univer.__getInjector();
    injector.add([AuthzIoLocalService]);
    injector.get(UserManagerService).setCurrentUser(createDefaultUser(UnitRole.Editor));
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: enUS });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
    univer.registerPlugin(UniverFormulaEnginePlugin);
    univer.registerPlugin(UniverSheetsPlugin);
    const snapshot: IWorkbookData = {
        id: 'owner',
        name: 'Owner',
        appVersion: 'test',
        locale: LocaleType.EN_US,
        styles: {},
        sheetOrder: ['sheet'],
        sheets: { sheet: { id: 'sheet', name: 'Sheet', rowCount: 10, columnCount: 10, cellData: { 0: { 0: { v: 11 } } } } },
    };
    univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, snapshot);
    univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, { ...Tools.deepClone(snapshot), id: 'foreign' });
    const authz = injector.get(IAuthzIoService);
    if (!(authz instanceof QueuedAuthorizationProvider)) {
        throw new TypeError('Queued authorization boundary was not registered');
    }
    return { univer, injector, authz, api: FUniver.newAPI(injector) };
}

describe('SheetPermissionInitController asynchronous ownership', () => {
    for (const latestFirst of [false, true]) {
        it(`keeps the newest queried workbook policy when its response is released ${latestFirst ? 'first' : 'last'}`, async () => {
            const runtime = createRuntime();
            try {
                const { api, authz, injector } = runtime;
                const controller = injector.get(SheetPermissionInitController);
                const permission = api.getWorkbook('owner')!.getWorkbookPermission();
                await permission.setPoint(api.Enum.WorkbookPermissionPoint.Edit, true);
                authz.held = true;
                const earlier = controller.initWorkbookPermissionChange('owner');
                await expect.poll(() => authz.pendingCount).toBe(1);
                await authz.update({
                    unitID: 'owner',
                    objectID: 'owner',
                    objectType: UnitObject.Workbook,
                    strategies: [{ action: UnitAction.Edit, role: UnitRole.Owner }],
                    name: '',
                    share: undefined,
                    scope: undefined,
                    collaborators: undefined,
                });
                expect(await authz.local.allowed({
                    unitID: 'owner',
                    objectID: 'owner',
                    objectType: UnitObject.Workbook,
                    actions: [UnitAction.Edit],
                })).toEqual([{ action: UnitAction.Edit, allowed: false }]);
                const later = controller.initWorkbookPermissionChange('owner');
                await expect.poll(() => authz.pendingCount).toBe(2);
                authz.releaseOne(latestFirst ? 1 : 0);
                await (latestFirst ? later : earlier);
                authz.releaseOne(0);
                await (latestFirst ? earlier : later);
                expect(permission.canEdit()).toBe(false);
            } finally {
                runtime.authz.release();
                runtime.univer.dispose();
            }
        });
    }
    it('keeps denied permissions unchanged when the external authorization query rejects', async () => {
        const runtime = createRuntime();
        try {
            const rule = await runtime.api.getWorkbook('owner')!.getSheetByName('Sheet')!.getRange('A1').getRangePermission().protect();
            await rule.setPoint(runtime.api.Enum.RangePermissionPoint.Edit, false);
            const before = Tools.deepClone(runtime.injector.get(IResourceLoaderService).saveUnit('owner'));
            runtime.authz.failure = new Error('Authorization request failed');
            runtime.injector.get(SheetPermissionInitController).initPermission();
            await expect(runtime.authz.waitForResponses()).rejects.toThrow('Authorization request failed');
            expect(rule.getPoint(runtime.api.Enum.RangePermissionPoint.Edit)).toBe(false);
            expect(runtime.injector.get(IResourceLoaderService).saveUnit('owner')).toEqual(before);
        } finally {
            runtime.authz.failure = undefined;
            runtime.univer.dispose();
        }
    });
    for (const scope of ['range', 'worksheet', 'workbook'] as const) {
        for (const completion of ['newer-setter', 'replacement-workbook', 'controller-disposal'] as const) {
            it(`does not apply an old ${scope} authorization grant after ${completion}`, async () => {
                const runtime = createRuntime();
                try {
                    const { api, injector, authz } = runtime;
                    const controller = injector.get(SheetPermissionInitController);
                    const workbook = api.getWorkbook('owner')!;
                    const sheet = workbook.getSheetByName('Sheet')!;
                    let objectID = 'owner';
                    let getPoint: () => boolean;
                    let setPoint: (value: boolean) => Promise<void>;
                    if (scope === 'range') {
                        const rule = await sheet.getRange('A1').getRangePermission().protect();
                        objectID = rule.permissionId;
                        getPoint = () => rule.getPoint(api.Enum.RangePermissionPoint.Edit);
                        setPoint = (value) => rule.setPoint(api.Enum.RangePermissionPoint.Edit, value);
                    } else if (scope === 'worksheet') {
                        const permission = sheet.getWorksheetPermission();
                        objectID = await permission.protect();
                        getPoint = () => permission.getPoint(api.Enum.WorksheetPermissionPoint.Edit);
                        setPoint = (value) => permission.setPoint(api.Enum.WorksheetPermissionPoint.Edit, value);
                    } else {
                        const permission = workbook.getWorkbookPermission();
                        getPoint = () => permission.getPoint(api.Enum.WorkbookPermissionPoint.Edit);
                        setPoint = (value) => permission.setPoint(api.Enum.WorkbookPermissionPoint.Edit, value);
                    }
                    const objectType = scope === 'range'
                        ? UnitObject.SelectRange
                        : scope === 'worksheet' ? UnitObject.Worksheet : UnitObject.Workbook;
                    await setPoint(false);
                    await setPoint(true);
                    expect(await authz.local.allowed({
                        unitID: 'owner',
                        objectID,
                        objectType,
                        actions: [UnitAction.Edit],
                    })).toEqual([{ action: UnitAction.Edit, allowed: true }]);
                    const foreign = Tools.deepClone(injector.get(IResourceLoaderService).saveUnit('foreign'));
                    authz.held = true;
                    controller.initPermission();
                    await expect.poll(() => authz.pendingCount).toBeGreaterThan(0);
                    await setPoint(false);
                    expect(authz.updates[authz.updates.length - 1].strategies).toEqual([{ action: UnitAction.Edit, role: UnitRole.Owner }]);
                    expect(await authz.local.allowed({
                        unitID: 'owner',
                        objectID,
                        objectType,
                        actions: [UnitAction.Edit],
                    })).toEqual([{ action: UnitAction.Edit, allowed: false }]);
                    if (completion === 'replacement-workbook') {
                        const oldPendingCount = authz.pendingCount;
                        const saved = injector.get(IResourceLoaderService).saveUnit<IWorkbookData>('owner')!;
                        injector.get(IUniverInstanceService).disposeUnit('owner');
                        runtime.univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, JSON.parse(JSON.stringify(saved)));
                        await expect.poll(() => authz.pendingCount).toBeGreaterThan(oldPendingCount);
                    } else if (completion === 'controller-disposal') {
                        controller.dispose();
                    }
                    authz.release();
                    await authz.waitForResponses();
                    expect(getPoint()).toBe(false);
                    expect(injector.get(IResourceLoaderService).saveUnit('foreign')).toEqual(foreign);
                } finally {
                    runtime.authz.release();
                    runtime.univer.dispose();
                }
            });
        }
    }
});
