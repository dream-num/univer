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

import type { MenuSchemaType } from '@univerjs/ui';
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
import {
    DesktopRibbonService,
    IMenuManagerService,
    IRibbonService,
    MenuManagerPosition,
    MenuManagerService,
    RibbonPosition,
} from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DocContextualRibbonService } from '../doc-contextual-ribbon.service';

describe('DocContextualRibbonService', () => {
    let injector: Injector;
    let service: DocContextualRibbonService;
    let ribbon: IRibbonService;
    let active: string;
    let visible: string[];

    beforeEach(() => {
        injector = new Injector([
            [IConfigService, { useClass: ConfigService }],
            [IContextService, { useClass: ContextService }],
            [ILogService, { useClass: DesktopLogService }],
            [IUniverInstanceService, { useClass: UniverInstanceService }],
            [IMenuManagerService, { useClass: MenuManagerService }],
            [IRibbonService, { useClass: DesktopRibbonService }],
            [DocContextualRibbonService],
        ]);
        for (const [order, tab] of [RibbonPosition.START, RibbonPosition.INSERT, 'table', 'sdt', 'shape'].entries()) {
            injector.get(IMenuManagerService).appendRootMenu({
                [MenuManagerPosition.RIBBON]: {
                    [tab]: {
                        order,
                        contextual: order > 1,
                        group: { order: 0, command: { order: 0, menuItemFactory: () => ({ id: `${tab}-command` }) } },
                    },
                },
            } as MenuSchemaType);
        }
        ribbon = injector.get(IRibbonService);
        ribbon.activatedTab$.subscribe((tab) => active = tab);
        ribbon.ribbon$.subscribe((tabs) => visible = tabs.map((tab) => tab.key));
        service = injector.get(DocContextualRibbonService);
        ribbon.setActivatedTab(RibbonPosition.INSERT);
    });

    afterEach(() => injector.dispose());

    it.each([true, false])('keeps SDT active regardless of selection notification order (table first: %s)', (tableFirst) => {
        if (tableFirst) {
            service.setTableTab('table', true);
        }
        service.setContentControlTab('sdt', true);
        service.setTableTab('table', true);
        expect(active).toBe('sdt');
        expect(visible).toEqual(expect.arrayContaining(['table', 'sdt']));

        service.setContentControlTab('sdt', false);
        expect(active).toBe('table');
        service.setTableTab('table', false);
        expect(active).toBe(RibbonPosition.INSERT);
        expect(visible).not.toContain('sdt');
        expect(visible).not.toContain('table');
    });

    it.each([RibbonPosition.START, RibbonPosition.INSERT, 'table'])('preserves manual choice %s while leaving a control', (tab) => {
        service.setTableTab('table', true);
        service.setContentControlTab('sdt', true);
        ribbon.setActivatedTab(tab);
        service.setTableTab('table', true);
        service.setContentControlTab('sdt', true);
        expect(active).toBe(tab);
        service.setContentControlTab('sdt', false);
        expect(active).toBe(tab);
    });

    it('does not steal a manual tab when the containing table reports its selection later', () => {
        service.setContentControlTab('sdt', true);
        ribbon.setActivatedTab(RibbonPosition.START);
        service.setTableTab('table', true);
        expect(active).toBe(RibbonPosition.START);
        service.setTableTab('table', false);
        expect(active).toBe(RibbonPosition.START);
    });

    it('keeps a standalone control active after leaving its containing table', () => {
        service.setTableTab('table', true);
        service.setContentControlTab('sdt', true);
        service.setTableTab('table', false);
        expect(active).toBe('sdt');
        service.setContentControlTab('sdt', false);
        expect(active).toBe(RibbonPosition.INSERT);
        service.setTableTab('table', true);
        expect(active).toBe('table');
    });

    it('does not change other products contextual activation or fallback', () => {
        service.setContentControlTab('sdt', true);
        ribbon.showContextualTab('shape', { activate: true });
        expect(active).toBe('shape');
        service.setContentControlTab('sdt', false);
        expect(active).toBe('shape');
        ribbon.hideContextualTab('shape');
        expect(active).toBe(RibbonPosition.INSERT);
    });

    it('hides its own tabs on disposal without hiding another contextual tab', () => {
        service.setTableTab('table', true);
        service.setContentControlTab('sdt', true);
        ribbon.showContextualTab('shape', { activate: true });
        service.dispose();
        service.dispose();
        expect(active).toBe('shape');
        expect(visible).toContain('shape');
        expect(visible).not.toContain('table');
        expect(visible).not.toContain('sdt');
    });
});
