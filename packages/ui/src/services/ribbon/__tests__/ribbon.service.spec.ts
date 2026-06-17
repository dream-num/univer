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

import type { MenuSchemaType } from '../../menu/menu-manager.service';
import {
    ConfigService,
    ContextService,
    DesktopLogService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    UniverInstanceService,
} from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { IMenuManagerService, MenuManagerService } from '../../menu/menu-manager.service';
import { MenuManagerPosition, RibbonPosition } from '../../menu/types';
import { DesktopRibbonService, IRibbonService } from '../ribbon.service';

function createService() {
    const injector = new Injector();
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([IMenuManagerService, { useClass: MenuManagerService }]);
    injector.add([IRibbonService, { useClass: DesktopRibbonService }]);
    return {
        service: injector.get(IRibbonService),
        menuManagerService: injector.get(IMenuManagerService),
    };
}

describe('DesktopRibbonService', () => {
    it('shows contextual ribbon tabs only when requested and restores the last regular tab when hidden', () => {
        const { service, menuManagerService } = createService();
        const ribbons: string[][] = [];
        const activated: string[] = [];
        const ribbonSub = service.ribbon$.subscribe((ribbon) => ribbons.push(ribbon.map((item) => item.key)));
        const activeSub = service.activatedTab$.subscribe((tab) => activated.push(tab));

        menuManagerService.appendRootMenu({
            [MenuManagerPosition.RIBBON]: {
                'chart-tools': {
                    order: 100,
                    title: 'chart',
                    contextual: true,
                    group: { order: 0, command: { order: 0, menuItemFactory: () => ({ id: 'chart-command' }) } },
                },
            },
        } as MenuSchemaType);
        service.setActivatedTab(RibbonPosition.INSERT);
        service.showContextualTab('chart-tools', { activate: true });
        service.hideContextualTab('chart-tools');

        expect(ribbons.at(-2)).toContain('chart-tools');
        expect(ribbons.at(-1)).not.toContain('chart-tools');
        expect(activated).toContain('chart-tools');

        ribbonSub.unsubscribe();
        activeSub.unsubscribe();
    });

    it('publishes collapsed group ids and fake toolbar visibility changes', () => {
        const { service } = createService();
        const collapsed: string[][] = [];
        const fakeToolbarVisible: boolean[] = [];
        const collapsedSub = service.collapsedIds$.subscribe((ids) => collapsed.push(ids));
        const fakeToolbarSub = service.fakeToolbarVisible$.subscribe((visible) => fakeToolbarVisible.push(visible));

        service.setCollapsedIds(['format']);
        service.setFakeToolbarVisible(true);

        expect(collapsed).toEqual([[], ['format']]);
        expect(fakeToolbarVisible).toEqual([false, true]);
        collapsedSub.unsubscribe();
        fakeToolbarSub.unsubscribe();
    });
});
