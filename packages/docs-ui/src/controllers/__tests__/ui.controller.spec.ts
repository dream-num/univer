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

// @vitest-environment happy-dom

import type { DocumentDataModel, IDocumentData } from '@univerjs/core';
import { ICommandService, IPermissionService, IUniverInstanceService, Univer, UniverInstanceType } from '@univerjs/core';
import { setDocumentPermissionValue, UniverDocsPlugin } from '@univerjs/docs';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { UnitAction } from '@univerjs/protocol';
import {
    DesktopLayoutService,
    ILayoutService,
    IMenuManagerService,
    IPlatformService,
    IShortcutService,
    IUIPartsService,
    IUIRuntimeScopeService,
    MenuManagerService,
    PlatformService,
    ShortcutService,
    UIPartsService,
    UIRuntimeScopeService,
} from '@univerjs/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RefreshHeaderFooterFieldsCommand } from '../../commands/commands/refresh-header-footer-fields.command';
import { DocUIController } from '../ui.controller';

const cleanups: Array<() => void> = [];
afterEach(() => cleanups.splice(0).reverse().forEach((dispose) => dispose()));

function createTestBed(editable: boolean) {
    const univer = new Univer();
    cleanups.push(() => univer.dispose());
    const injector = univer.__getInjector();
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([ILayoutService, { useClass: DesktopLayoutService }]);
    injector.add([IMenuManagerService, { useClass: MenuManagerService }]);
    injector.add([IUIPartsService, { useClass: UIPartsService }]);
    injector.add([IPlatformService, { useClass: PlatformService }]);
    injector.add([IUIRuntimeScopeService, { useClass: UIRuntimeScopeService }]);
    injector.add([IShortcutService, { useClass: ShortcutService }]);
    injector.add([DocUIController]);
    univer.registerPlugin(UniverDocsPlugin);
    const instances = injector.get(IUniverInstanceService);
    const model = instances.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, { id: 'field-refresh-doc', body: { dataStream: 'Read me\r\n' }, documentStyle: {} }, { makeCurrent: false });
    const other = instances.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, { id: 'other-doc', body: { dataStream: 'Other\r\n' }, documentStyle: {} }, { makeCurrent: false });
    const permissions = injector.get(IPermissionService);
    setDocumentPermissionValue(permissions, model.getUnitId(), model.getUnitId(), UnitAction.Edit, editable);
    const commandService = injector.get(ICommandService);
    const syncExecuteCommand = vi.spyOn(commandService, 'syncExecuteCommand');
    injector.get(DocUIController);
    return { instances, model, other, permissions, syncExecuteCommand };
}

describe('Doc UI automatic field refresh', () => {
    it.each([false, true])('refreshes on open only when the current document is editable (editable: %s)', (editable) => {
        const h = createTestBed(editable);
        h.instances.setCurrentUnitForType(h.model.getUnitId());
        h.instances.setCurrentUnitForType(h.model.getUnitId());
        expect(h.syncExecuteCommand.mock.calls.filter(([id]) => id === RefreshHeaderFooterFieldsCommand.id)).toEqual(editable
            ? [[RefreshHeaderFooterFieldsCommand.id, { unitId: h.model.getUnitId(), onOpen: true }]]
            : []);
    });

    it('does not mark a skipped readonly document as refreshed before a later editable focus', () => {
        const h = createTestBed(false);
        h.instances.setCurrentUnitForType(h.model.getUnitId());
        expect(h.syncExecuteCommand.mock.calls.filter(([id]) => id === RefreshHeaderFooterFieldsCommand.id)).toEqual([]);
        setDocumentPermissionValue(h.permissions, h.model.getUnitId(), h.model.getUnitId(), UnitAction.Edit, true);
        h.instances.setCurrentUnitForType(h.other.getUnitId());
        h.instances.setCurrentUnitForType(h.model.getUnitId());
        h.instances.setCurrentUnitForType(h.other.getUnitId());
        h.instances.setCurrentUnitForType(h.model.getUnitId());
        expect(h.syncExecuteCommand.mock.calls.filter(([id, params]) => id === RefreshHeaderFooterFieldsCommand.id && (params as { unitId: string }).unitId === h.model.getUnitId()))
            .toEqual([[RefreshHeaderFooterFieldsCommand.id, { unitId: h.model.getUnitId(), onOpen: true }]]);
    });
});
