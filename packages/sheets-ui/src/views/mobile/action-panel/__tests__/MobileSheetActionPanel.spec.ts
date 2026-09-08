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

import type { IMenuSchema } from '@univerjs/ui';
import type { Root } from 'react-dom/client';
import type { MobileNumberFormatItem } from '../MobileStylePanel';
import {
    CommandType,
    FOCUSING_COMMON_DRAWINGS,
    getSheetsEmptySnapshot,
    ICommandService,
    IContextService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { SheetsSelectionsService } from '@univerjs/sheets';
import {
    ComponentManager,
    IconManager,
    ILayoutService,
    IMenuManagerService,
    IRibbonService,
    MenuItemType,
    RediContext,
    RibbonInsertGroup,
    RibbonPosition,
    RibbonStartGroup,
} from '@univerjs/ui';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import enUS from '../../../../locale/en-US';
import { IEditorBridgeService } from '../../../../services/editor-bridge.service';
import {
    getMobileCellCenterOffset,
    getMobileCellRevealOffset,
    getMobileEditingMenuBottomOffset,
    getMobileMenuCommand,
    MobileSheetActionPanel,
    normalizeMobileSelectionPrimary,
} from '../MobileSheetActionPanel';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { configurable: true, value: true, writable: true });

const TEST_INSERT_MENU_ID = 'test.menu.insert-image';
const TEST_INSERT_COMMAND_ID = 'test.command.insert-image';
const TEST_NUMFMT_MENU_ID = 'test.menu.number-format';
const TEST_NUMFMT_COMMAND_ID = 'test.command.set-number-format';
const TEST_CUSTOM_NUMFMT_COMPONENT = 'test.component.custom-number-format';

function createNumberFormatRibbon(): IMenuSchema[] {
    const numberFormatItem: MobileNumberFormatItem = {
        id: TEST_NUMFMT_MENU_ID,
        type: MenuItemType.SELECTOR,
        title: 'Number format',
        selections: [],
        value$: new BehaviorSubject('General'),
        mobileNumberFormat: {
            kind: 'number-format',
            title: 'Number format',
            commandId: TEST_NUMFMT_COMMAND_ID,
            detailTitle: 'More formats',
            customTitle: 'Custom format',
            customComponent: TEST_CUSTOM_NUMFMT_COMPONENT,
            quickOptions: [],
            decimalOptions: [],
            detailOptions: [
                { label: 'General', value: null },
                { label: 'Custom format', custom: true },
            ],
            customPatterns: ['0.00'],
        },
    };

    return [{
        key: RibbonPosition.START,
        order: 0,
        children: [{
            key: RibbonStartGroup.NUMBER,
            order: 0,
            children: [{
                key: TEST_NUMFMT_MENU_ID,
                order: 0,
                item: numberFormatItem,
            }],
        }],
    }];
}

function renderMobileSheetActionPanel(ribbon: IMenuSchema[] = []) {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const contextService = injector.get(IContextService);

    injector.get(LocaleService).load({ [LocaleType.EN_US]: enUS });
    injector.get(LocaleService).setLocale(LocaleType.EN_US);
    univer.createUnit(UniverInstanceType.UNIVER_SHEET, getSheetsEmptySnapshot('mobile-sheet'));
    injector.get(IUniverInstanceService).focusUnit('mobile-sheet');
    injector.add([IEditorBridgeService, {
        useValue: {
            visible$: new BehaviorSubject({ visible: false }),
            getEditCellState: () => null,
            refreshEditCellPosition: vi.fn(),
        } as unknown as IEditorBridgeService,
    }]);
    injector.add([IEditorService, { useValue: { focus: vi.fn() } as unknown as IEditorService }]);
    injector.add([ILayoutService, { useValue: { focus: vi.fn() } as unknown as ILayoutService }]);
    injector.add([ComponentManager]);
    injector.add([IconManager]);
    injector.add([IMenuManagerService, {
        useValue: {
            menuChanged$: EMPTY,
            getMenuByPositionKey: () => [],
        } as unknown as IMenuManagerService,
    }]);
    injector.add([IRibbonService, {
        useValue: { ribbon$: new BehaviorSubject(ribbon) } as unknown as IRibbonService,
    }]);
    injector.add([SheetsSelectionsService, {
        useValue: {
            selectionMoveEnd$: EMPTY,
            getCurrentSelections: () => [],
            getCurrentLastSelection: () => null,
            setSelections: vi.fn(),
        } as unknown as SheetsSelectionsService,
    }]);

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
        root.render(createElement(
            RediContext.Provider,
            { value: { injector } },
            createElement(MobileSheetActionPanel)
        ));
    });

    return { commandService: injector.get(ICommandService), container, contextService, root, univer };
}

function clickButton(container: HTMLElement, name: string) {
    const button = Array.from(container.querySelectorAll('button')).find((item) =>
        item.getAttribute('aria-label') === name || item.textContent?.includes(name));
    if (!button) {
        throw new Error(`Button "${name}" was not rendered.`);
    }

    act(() => button.dispatchEvent(new MouseEvent('click', { bubbles: true })));
}

function clickCommand(container: HTMLElement, commandId: string) {
    const button = container.querySelector(`[data-u-command="${commandId}"]`);
    if (!button) {
        throw new Error(`Command "${commandId}" was not rendered.`);
    }

    act(() => button.dispatchEvent(new MouseEvent('click', { bubbles: true })));
}

function disposeRenderedPanel(root: Root, container: HTMLElement, univer: Univer) {
    act(() => root.unmount());
    container.remove();
    univer.dispose();
}

describe('mobile sheet action panel visibility', () => {
    it('does not reopen the previous sheet drawer after drawing focus ends', () => {
        const { container, contextService, root, univer } = renderMobileSheetActionPanel();

        try {
            clickButton(container, 'Open sheet tools');
            expect(container.querySelector('[data-u-comp="mobile-sheet-action-panel"]')).not.toBeNull();

            act(() => contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, true));
            expect(container.querySelector('[data-u-comp="mobile-sheet-action-panel"]')).toBeNull();

            act(() => contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, false));
            expect(container.querySelector('[data-u-comp="mobile-sheet-action-panel"]')).toBeNull();
        } finally {
            disposeRenderedPanel(root, container, univer);
        }
    });

    it('closes the sheet drawer after executing a nested insert menu command', () => {
        const execute = vi.fn(() => true);
        const ribbon: IMenuSchema[] = [{
            key: RibbonPosition.INSERT,
            order: 0,
            children: [{
                key: RibbonInsertGroup.MEDIA,
                order: 0,
                children: [{
                    key: TEST_INSERT_MENU_ID,
                    order: 0,
                    item: {
                        id: TEST_INSERT_MENU_ID,
                        type: MenuItemType.SUBITEMS,
                        title: 'Insert image',
                    },
                    children: [{
                        key: TEST_INSERT_COMMAND_ID,
                        order: 0,
                        item: {
                            id: TEST_INSERT_COMMAND_ID,
                            type: MenuItemType.BUTTON,
                            title: 'Floating image',
                        },
                    }],
                }],
            }],
        }];
        const { commandService, container, root, univer } = renderMobileSheetActionPanel(ribbon);
        commandService.registerCommand({
            id: TEST_INSERT_COMMAND_ID,
            type: CommandType.COMMAND,
            handler: execute,
        });

        try {
            clickButton(container, 'Open sheet tools');
            clickCommand(container, TEST_INSERT_MENU_ID);
            expect(container.querySelector('[data-u-comp="mobile-sheet-action-panel"]')).not.toBeNull();

            clickCommand(container, TEST_INSERT_COMMAND_ID);

            expect(execute).toHaveBeenCalledOnce();
            expect(container.querySelector('[data-u-comp="mobile-sheet-action-panel"]')).toBeNull();
        } finally {
            disposeRenderedPanel(root, container, univer);
        }
    });

    it('closes the sheet drawer after selecting a detailed number format', () => {
        const execute = vi.fn(() => true);
        const { commandService, container, root, univer } = renderMobileSheetActionPanel(createNumberFormatRibbon());
        commandService.registerCommand({
            id: TEST_NUMFMT_COMMAND_ID,
            type: CommandType.COMMAND,
            handler: execute,
        });

        try {
            clickButton(container, 'Open sheet tools');
            clickButton(container, 'Style');
            clickButton(container, 'More formats');
            clickButton(container, 'General');

            expect(execute).toHaveBeenCalledOnce();
            expect(container.querySelector('[data-u-comp="mobile-sheet-action-panel"]')).toBeNull();
        } finally {
            disposeRenderedPanel(root, container, univer);
        }
    });

    it('closes the sheet drawer after confirming a custom number format', () => {
        const execute = vi.fn(() => true);
        const { commandService, container, root, univer } = renderMobileSheetActionPanel(createNumberFormatRibbon());
        commandService.registerCommand({
            id: TEST_NUMFMT_COMMAND_ID,
            type: CommandType.COMMAND,
            handler: execute,
        });
        univer.__getInjector().get(ComponentManager).register(
            TEST_CUSTOM_NUMFMT_COMPONENT,
            (props: { onConfirm: (pattern: string) => void }) => createElement('button', {
                type: 'button',
                'aria-label': 'Confirm custom format',
                onClick: () => props.onConfirm('0.00'),
            })
        );

        try {
            clickButton(container, 'Open sheet tools');
            clickButton(container, 'Style');
            clickButton(container, 'More formats');
            clickButton(container, 'Custom format');
            clickButton(container, 'Confirm custom format');

            expect(execute).toHaveBeenCalledOnce();
            expect(container.querySelector('[data-u-comp="mobile-sheet-action-panel"]')).toBeNull();
        } finally {
            disposeRenderedPanel(root, container, univer);
        }
    });
});

describe('mobile active-cell reveal offset', () => {
    it('moves only the distance outside the padded visible area', () => {
        expect(getMobileCellRevealOffset(100, 130, 80, 500)).toBe(0);
        expect(getMobileCellRevealOffset(60, 90, 80, 500)).toBe(-20);
        expect(getMobileCellRevealOffset(490, 530, 80, 500)).toBe(30);
    });

    it('centers the active cell in the area above the software keyboard', () => {
        expect(getMobileCellCenterOffset(100, 140, 80, 500)).toBe(-170);
        expect(getMobileCellCenterOffset(280, 320, 80, 520)).toBe(0);
        expect(getMobileCellCenterOffset(460, 500, 80, 520)).toBe(180);
    });
});

describe('mobile editing menu placement', () => {
    it('moves above the compact formula operator strip while it is visible', () => {
        expect(getMobileEditingMenuBottomOffset(false)).toBe(72);
        expect(getMobileEditingMenuBottomOffset(true)).toBe(108);
    });
});

describe('mobile style selection normalization', () => {
    it('restores the last selection primary before running shared style commands', () => {
        const selections = [
            {
                range: { startRow: 3, endRow: 4, startColumn: 2, endColumn: 5 },
                primary: null,
                style: null,
            },
        ];
        const worksheet = { getMergedCell: () => null };

        const normalized = normalizeMobileSelectionPrimary(selections, worksheet);

        expect(normalized?.[0].primary).toMatchObject({
            actualRow: 3,
            actualColumn: 2,
            startRow: 3,
            startColumn: 2,
        });
        expect(selections[0].primary).toBeNull();
    });

    it('keeps an existing primary unchanged', () => {
        const selections = [{
            range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
            primary: {
                actualRow: 1,
                actualColumn: 1,
                startRow: 1,
                endRow: 1,
                startColumn: 1,
                endColumn: 1,
                isMerged: false,
                isMergedMainCell: false,
            },
            style: null,
        }];

        expect(normalizeMobileSelectionPrimary(selections, { getMergedCell: () => null })).toBeNull();
    });
});

describe('mobile menu command mapping', () => {
    it.each([
        {
            name: 'plain button command',
            input: { id: 'copy', params: { from: 'mobile' } },
            expected: { commandId: 'copy', commandParams: { from: 'mobile' } },
        },
        {
            name: 'explicit command alias',
            input: { id: 'menu.copy', commandId: 'sheet.copy', params: { from: 'mobile' } },
            expected: { commandId: 'sheet.copy', commandParams: { from: 'mobile' } },
        },
        {
            name: 'selector value',
            input: { id: 'align', commandId: 'set-align', value: 'center' },
            expected: { commandId: 'set-align', commandParams: { value: 'center' } },
        },
        {
            name: 'boolean style value',
            input: { id: 'set-bold', value: false },
            expected: { commandId: 'set-bold', commandParams: { value: false } },
        },
        {
            name: 'selector params factory',
            input: { id: 'set-format', value: undefined, params: (value?: string | number) => ({ pattern: value ?? 'general' }) },
            expected: { commandId: 'set-format', commandParams: { pattern: 'general' } },
        },
    ])('maps $name', ({ input, expected }) => {
        expect(getMobileMenuCommand(input)).toEqual(expected);
    });

    it('ignores a menu entry without an executable command id', () => {
        expect(getMobileMenuCommand({ id: undefined })).toBeNull();
    });
});
