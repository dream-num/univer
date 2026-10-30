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

import type { ReactElement } from 'react';
import {
    ICommandService,
    Injector,
    LocaleService,
    LocaleType,
    RANGE_TYPE,
    RedoCommand,
    UndoCommand,
} from '@univerjs/core';
import { ConfigProvider } from '@univerjs/design';
import designEnUS from '@univerjs/design/locale/en-US';
import {
    SetColWidthCommand,
    SetRowHeightCommand,
    SetWorksheetColWidthMutation,
    SetWorksheetRowHeightMutation,
    SetWorksheetRowIsAutoHeightMutation,
    SheetSkeletonService,
    SheetsSelectionsService,
    WorkbookPermissionService,
    WorksheetPermissionService,
} from '@univerjs/sheets';
import {
    ComponentManager,
    ContextMenuPanel,
    ContextMenuService,
    DesktopLayoutService,
    IconManager,
    IContextMenuService,
    ILayoutService,
    IMenuManagerService,
    MenuManagerService,
    RediContext,
} from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCommandTestBed } from '../../../commands/commands/__tests__/create-command-test-bed';
import enUS from '../../../locale/en-US';
import { SetColWidthMenuItemFactory, SetRowHeightMenuItemFactory, SheetMenuPosition } from '../../../menu/menu';
import { MENU_ITEM_INPUT_COMPONENT } from '../interface';
import { MenuItemInput } from '../MenuItemInput';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class ChangeRecords {
    static values: string[] = [];

    static reset(): void {
        this.values = [];
    }

    static push(value: string): void {
        this.values.push(value);
    }
}

function createInjector() {
    const injector = new Injector();
    injector.add([LocaleService]);
    injector.add([IContextMenuService, { useClass: ContextMenuService }]);
    const localeService = injector.get(LocaleService);
    localeService.load({ [LocaleType.EN_US]: { ...enUS, ...designEnUS } });
    localeService.setLocale(LocaleType.EN_US);
    localeService.setDirection('ltr');

    return injector;
}

function renderWithDependencies(
    element: ReactElement,
    setupInjector?: (injector: Injector) => void,
    injector = createInjector()
) {
    setupInjector?.(injector);
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                <ConfigProvider locale={designEnUS.design} mountContainer={container}>
                    {element}
                </ConfigProvider>
            </RediContext.Provider>
        );
    });

    return {
        container,
        injector,
        unmount: () => {
            act(() => root.unmount());
            container.remove();
            injector.dispose();
        },
    };
}

function getInput(container: HTMLElement): HTMLInputElement {
    const input = container.querySelector('input');
    if (!(input instanceof HTMLInputElement)) {
        throw new TypeError('Input not found');
    }

    return input;
}

function setInputText(input: HTMLInputElement, value: string) {
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

function clickIncrement(container: HTMLElement) {
    const incrementButton = container.querySelector(`[aria-label="${designEnUS.design.Accessibility.increment}"]`);
    if (!(incrementButton instanceof HTMLElement)) {
        throw new TypeError('Increment button not found');
    }

    incrementButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

describe('MenuItemInput', () => {
    const disposals: Array<() => void> = [];

    afterEach(() => {
        disposals.splice(0).forEach((dispose) => dispose());
        ChangeRecords.reset();
        vi.useRealTimers();
    });

    it.each([
        ['column', '0'],
        ['row', '0'],
        ['column', ''],
        ['row', ''],
    ])('applies zero %s size from input %j through the real context menu and supports undo/redo', async (axis, text) => {
        const testBed = createCommandTestBed(undefined, [[SheetSkeletonService]]);
        const injector = testBed.univer.__getInjector();
        const commands = injector.get(ICommandService);
        injector.get(WorkbookPermissionService);
        injector.get(WorksheetPermissionService);
        const worksheet = testBed.sheet.getActiveSheet()!;
        const isColumn = axis === 'column';
        const getSize = () => isColumn ? worksheet.getColumnWidth(1) : worksheet.getRowHeight(1);
        const original = getSize();
        const executions: Promise<boolean>[] = [];
        for (const command of [
            SetColWidthCommand,
            SetRowHeightCommand,
            SetWorksheetColWidthMutation,
            SetWorksheetRowHeightMutation,
            SetWorksheetRowIsAutoHeightMutation,
        ]) {
            commands.registerCommand(command);
        }
        injector.get(SheetsSelectionsService).setSelections([{
            range: {
                startRow: 1,
                endRow: 1,
                startColumn: 1,
                endColumn: 1,
                rangeType: isColumn ? RANGE_TYPE.COLUMN : RANGE_TYPE.ROW,
            },
            primary: null,
            style: null,
        }]);
        const menuType = isColumn ? SheetMenuPosition.COL_HEADER_CONTEXT_MENU : SheetMenuPosition.ROW_HEADER_CONTEXT_MENU;
        const commandId = isColumn ? SetColWidthCommand.id : SetRowHeightCommand.id;
        const { container, unmount } = renderWithDependencies(
            <ContextMenuPanel
                menuType={menuType}
                onOptionSelect={(option) => {
                    executions.push(commands.executeCommand(option.commandId ?? option.label as string, { value: option.value }));
                }}
            />,
            (injector) => {
                injector.add([IContextMenuService, { useClass: ContextMenuService }]);
                injector.add([IMenuManagerService, { useClass: MenuManagerService }]);
                injector.add([ILayoutService, { useClass: DesktopLayoutService }]);
                injector.add([ComponentManager]);
                injector.add([IconManager]);
                const locales = injector.get(LocaleService);
                locales.load({ [LocaleType.EN_US]: { ...enUS, ...designEnUS } });
                locales.setLocale(LocaleType.EN_US);
                locales.setDirection('ltr');
                injector.get(ILayoutService).registerRootContainerElement(document.body);
                injector.get(ComponentManager).register(MENU_ITEM_INPUT_COMPONENT, MenuItemInput);
                injector.get(IMenuManagerService).appendRootMenu({
                    [menuType]: {
                        [commandId]: {
                            menuItemFactory: isColumn ? SetColWidthMenuItemFactory : SetRowHeightMenuItemFactory,
                        },
                    },
                });
            },
            injector
        );
        disposals.push(() => {
            unmount();
            testBed.univer.dispose();
        });
        const input = getInput(container);
        act(() => input.focus());
        act(() => input.select());
        act(() => setInputText(input, text));
        expect(input.value).toBe('0');
        const button = input.closest('button');
        if (!(button instanceof HTMLButtonElement)) {
            throw new TypeError('Dimension menu item not found');
        }
        act(() => button.focus());
        act(() => button.click());
        expect(await Promise.all(executions)).toEqual([true]);
        expect(getSize()).toBe(0);
        await commands.executeCommand(UndoCommand.id);
        expect(getSize()).toBe(original);
        await commands.executeCommand(RedoCommand.id);
        expect(getSize()).toBe(0);
    });

    it('reports zero immediately when the configured minimum allows collapsed dimensions', () => {
        const { container, unmount } = renderWithDependencies(
            <MenuItemInput
                prefix="sheets-ui.rightClick.rowHeight"
                suffix="px"
                value="24"
                min={0}
                max={1000}
                onChange={(value) => ChangeRecords.push(value)}
            />
        );
        disposals.push(unmount);

        act(() => {
            setInputText(getInput(container), '0');
        });

        expect(getInput(container).value).toBe('0');
        expect(ChangeRecords.values).toEqual(['0']);
    });

    it('reports the positive minimum when the input is cleared', () => {
        const { container, unmount } = renderWithDependencies(
            <MenuItemInput
                prefix="sheets-ui.rightClick.insertRowsAbove"
                suffix="sheets-ui.rightClick.insertRowsAboveSuffix"
                value="12"
                min={1}
                max={20}
                onChange={(value) => ChangeRecords.push(value)}
            />
        );
        disposals.push(unmount);

        act(() => setInputText(getInput(container), ''));

        expect(getInput(container).value).toBe('1');
        expect(ChangeRecords.values).toEqual(['1']);
    });

    it('clamps typed values to the configured maximum before reporting the command value', () => {
        const { container, unmount } = renderWithDependencies(
            <MenuItemInput
                prefix="sheets-ui.rightClick.insertRowsAbove"
                suffix="sheets-ui.rightClick.insertRowsAboveSuffix"
                value="12"
                min={5}
                max={20}
                onChange={(value) => ChangeRecords.push(value)}
            />
        );
        disposals.push(unmount);

        act(() => {
            setInputText(getInput(container), '38');
        });

        expect(getInput(container).value).toBe('20');
        expect(ChangeRecords.values).toEqual(['20']);
    });

    it('uses disabled stream updates to block input changes and resumes reporting after re-enabled', () => {
        const disabled$ = new BehaviorSubject(false);
        const { container, unmount } = renderWithDependencies(
            <MenuItemInput
                prefix="sheets-ui.rightClick.insertRowsAbove"
                suffix="sheets-ui.rightClick.insertRowsAboveSuffix"
                value="10"
                min={1}
                max={20}
                disabled$={disabled$}
                onChange={(value) => ChangeRecords.push(value)}
            />
        );
        disposals.push(unmount);
        disposals.push(() => disabled$.complete());

        act(() => {
            disabled$.next(true);
        });
        act(() => {
            clickIncrement(container);
        });

        expect(getInput(container).value).toBe('10');
        expect(ChangeRecords.values).toEqual([]);

        act(() => {
            disabled$.next(false);
        });
        act(() => {
            clickIncrement(container);
        });

        expect(getInput(container).value).toBe('11');
        expect(ChangeRecords.values).toEqual(['11']);
    });

    it('lets Escape reach the enclosing menu without changing the input value', () => {
        const keys: string[] = [];
        const { container, unmount } = renderWithDependencies(
            <div onKeyDown={(event) => keys.push(event.key)}>
                <MenuItemInput
                    prefix="sheets-ui.rightClick.insertRowsAbove"
                    suffix="sheets-ui.rightClick.insertRowsAboveSuffix"
                    value="2"
                    min={1}
                    onChange={(value) => ChangeRecords.push(value)}
                />
            </div>
        );
        disposals.push(unmount);
        act(() => getInput(container).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));

        expect(keys).toEqual(['Escape']);
        expect(getInput(container).value).toBe('2');
        expect(ChangeRecords.values).toEqual([]);
    });

    it('keeps editing keys and an active IME Escape inside the input', () => {
        const keys: string[] = [];
        const { container, unmount } = renderWithDependencies(
            <div onKeyDown={(event) => keys.push(event.key)}>
                <MenuItemInput
                    prefix="sheets-ui.rightClick.insertRowsAbove"
                    suffix="sheets-ui.rightClick.insertRowsAboveSuffix"
                    value="2"
                    min={1}
                    onChange={(value) => ChangeRecords.push(value)}
                />
            </div>
        );
        disposals.push(unmount);
        const input = getInput(container);
        for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Backspace', 'Delete', 'Enter']) {
            act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })));
        }
        for (const modifier of [{ ctrlKey: true }, { metaKey: true }]) {
            act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true, ...modifier })));
        }
        act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, isComposing: true })));

        expect(keys).toEqual([]);
        expect(input.value).toBe('2');
    });

    it('keeps the composition-ending Escape local and accepts a subsequent Escape', () => {
        vi.useFakeTimers();
        const keys: string[] = [];
        const { container, unmount } = renderWithDependencies(
            <div onKeyDown={(event) => keys.push(event.key)}>
                <MenuItemInput
                    prefix="sheets-ui.rightClick.insertRowsAbove"
                    suffix="sheets-ui.rightClick.insertRowsAboveSuffix"
                    value="2"
                    min={1}
                    onChange={(value) => ChangeRecords.push(value)}
                />
            </div>
        );
        disposals.push(unmount);
        const input = getInput(container);
        act(() => {
            input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
            input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
            // Safari can deliver the ending key after compositionend with isComposing already false.
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, isComposing: false }));
        });
        expect(keys).toEqual([]);
        expect(input.value).toBe('2');
        expect(ChangeRecords.values).toEqual([]);

        act(() => vi.runOnlyPendingTimers());
        act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
        expect(keys).toEqual(['Escape']);
    });

    it.each(['blur', 'unmount'])('cleans up the composition boundary on %s', (action) => {
        vi.useFakeTimers();
        const keys: string[] = [];
        const { container, unmount } = renderWithDependencies(
            <div onKeyDown={(event) => keys.push(event.key)}>
                <MenuItemInput
                    prefix="sheets-ui.rightClick.insertRowsAbove"
                    suffix="sheets-ui.rightClick.insertRowsAboveSuffix"
                    value="2"
                    min={1}
                    onChange={(value) => ChangeRecords.push(value)}
                />
            </div>
        );
        disposals.push(unmount);
        const input = getInput(container);
        const initialTimers = vi.getTimerCount();
        act(() => {
            input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
            input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
        });

        if (action === 'unmount') {
            disposals.pop()?.();
        } else {
            act(() => input.dispatchEvent(new FocusEvent('focusout', { bubbles: true })));
            act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
            expect(keys).toEqual(['Escape']);
        }
        expect(vi.getTimerCount()).toBe(initialTimers);
        expect(ChangeRecords.values).toEqual([]);
    });
});
