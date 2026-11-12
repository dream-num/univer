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

import type { PropsWithChildren, ReactElement } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
    ConfigService,
    ContextService,
    DesktopLogService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    UniverInstanceService,
} from '@univerjs/core';
import { ConfigProvider } from '@univerjs/design';
import { RediContext } from '@wendellhu/redi/react-bindings';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ICustomComponentProps } from '../../../../services/menu/menu';
import { ComponentManager } from '../../../../common/component-manager';
import { IconManager } from '../../../../common/icon-manager';
import enUS from '../../../../locale/en-US';
import { ContextMenuHostService, IContextMenuHostService } from '../../../../services/contextmenu/contextmenu-host.service';
import { DesktopLayoutService, ILayoutService } from '../../../../services/layout/layout.service';
import { MenuItemType } from '../../../../services/menu/menu';
import { IMenuManagerService, MenuManagerService } from '../../../../services/menu/menu-manager.service';
import { AnchoredContextMenu } from '../AnchoredContextMenu';

const injectors: Injector[] = [];

function MenuInput({ value, onChange }: ICustomComponentProps<string>) {
    return <input aria-label="Menu value" value={value} onChange={(event) => onChange(event.target.value)} />;
}

function renderWithDependencies(element: ReactElement, options?: Parameters<typeof render>[1]) {
    const injector = new Injector([
        [IConfigService, { useClass: ConfigService }],
        [IContextService, { useClass: ContextService }],
        [ILogService, { useClass: DesktopLogService }],
        [IUniverInstanceService, { useClass: UniverInstanceService }],
        [IMenuManagerService, { useClass: MenuManagerService }],
        [ILayoutService, { useClass: DesktopLayoutService }],
        [IContextMenuHostService, { useClass: ContextMenuHostService }],
        [LocaleService],
        [ComponentManager],
        [IconManager],
    ]);
    injectors.push(injector);
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: enUS });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
    injector.get(ComponentManager).register('menu-input', MenuInput);
    injector.get(IMenuManagerService).appendRootMenu({ drawing: {
        'test.command.menu-value': { menuItemFactory: () => ({
            id: 'test.command.menu-value',
            type: MenuItemType.BUTTON,
            title: 'Context menu item',
            label: 'menu-input',
            value$: new BehaviorSubject('2'),
        }) },
    } });
    const mountContainer = options?.container?.ownerDocument.body ?? document.body;
    injector.get(ILayoutService).registerRootContainerElement(mountContainer);
    const contextValue = { injector };
    function Wrapper({ children }: PropsWithChildren) {
        return (
            <RediContext.Provider value={contextValue}>
                <ConfigProvider mountContainer={mountContainer}>{children}</ConfigProvider>
            </RediContext.Provider>
        );
    }
    return { ...render(element, { ...options, baseElement: mountContainer, wrapper: Wrapper }), injector };
}

describe('AnchoredContextMenu', () => {
    afterEach(() => {
        cleanup();
        injectors.splice(0).forEach((injector) => injector.dispose());
    });

    it('restores the element focused before the menu opened', () => {
        const { rerender } = renderWithDependencies(
            <>
                <button type="button">Editor canvas</button>
                <AnchoredContextMenu
                    hostId="desktop"
                    visible={false}
                    anchorRect={{ left: 0, top: 0, bottom: 0 }}
                    menuType="drawing"
                    onRequestClose={vi.fn()}
                />
            </>
        );
        const editor = screen.getByRole('button', { name: 'Editor canvas' });
        editor.focus();

        rerender(
            <>
                <button type="button">Editor canvas</button>
                <AnchoredContextMenu
                    hostId="desktop"
                    visible
                    anchorRect={{ left: 0, top: 0, bottom: 0 }}
                    menuType="drawing"
                    onRequestClose={vi.fn()}
                />
            </>
        );
        screen.getByRole('button', { name: /Context menu item/ }).focus();

        rerender(
            <>
                <button type="button">Editor canvas</button>
                <AnchoredContextMenu
                    hostId="desktop"
                    visible={false}
                    anchorRect={{ left: 0, top: 0, bottom: 0 }}
                    menuType="drawing"
                    onRequestClose={vi.fn()}
                />
            </>
        );

        expect(document.activeElement).toBe(editor);
    });

    it('restores focus when the menu is mounted in another document', () => {
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        const iframeDocument = iframe.contentDocument;
        if (!iframeDocument) {
            throw new Error('Expected iframe document');
        }

        const container = iframeDocument.createElement('div');
        iframeDocument.body.appendChild(container);
        const rendered = renderWithDependencies(
            <>
                <button type="button">Embedded editor canvas</button>
                <AnchoredContextMenu
                    hostId="desktop"
                    visible={false}
                    anchorRect={{ left: 0, top: 0, bottom: 0 }}
                    menuType="drawing"
                    onRequestClose={vi.fn()}
                />
            </>,
            { container }
        );
        const editor = rendered.getByRole('button', { name: 'Embedded editor canvas' });
        editor.focus();

        rendered.rerender(
            <>
                <button type="button">Embedded editor canvas</button>
                <AnchoredContextMenu
                    hostId="desktop"
                    visible
                    anchorRect={{ left: 0, top: 0, bottom: 0 }}
                    menuType="drawing"
                    onRequestClose={vi.fn()}
                />
            </>
        );
        rendered.getByRole('button', { name: /Context menu item/ }).focus();

        rendered.rerender(
            <>
                <button type="button">Embedded editor canvas</button>
                <AnchoredContextMenu
                    hostId="desktop"
                    visible={false}
                    anchorRect={{ left: 0, top: 0, bottom: 0 }}
                    menuType="drawing"
                    onRequestClose={vi.fn()}
                />
            </>
        );

        expect(iframeDocument.activeElement).toBe(editor);
        rendered.unmount();
        iframe.remove();
    });

    it('focuses the first action when opened from the keyboard', async () => {
        renderWithDependencies(
            <AnchoredContextMenu
                hostId="desktop"
                visible
                autoFocus
                anchorRect={{ left: 0, top: 0, bottom: 0 }}
                menuType="drawing"
                onRequestClose={vi.fn()}
            />
        );
        await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: /Context menu item/ })));
    });

    it('closes on view takeover without returning focus to the editor', () => {
        const close = vi.fn();
        const editor = document.createElement('button');
        document.body.appendChild(editor);
        editor.focus();
        const renderMenu = (visible: boolean) => (
            <AnchoredContextMenu
                hostId="desktop"
                visible={visible}
                anchorRect={{ left: 0, top: 0, bottom: 0 }}
                menuType="drawing"
                onRequestClose={close}
            />
        );
        const { injector, rerender } = renderWithDependencies(renderMenu(true));
        screen.getByRole('textbox', { name: 'Menu value' }).focus();
        act(() => injector.get(IContextMenuHostService).suspend());
        expect(close).toHaveBeenCalledOnce();
        rerender(renderMenu(false));
        expect(document.activeElement).not.toBe(editor);
        editor.remove();
    });

    it('keeps a draft during anchor movement but resets it when the menu reopens', () => {
        const selections: Array<{ label: string; value: string }> = [];
        const renderMenu = (visible: boolean, left: number) => (
            <AnchoredContextMenu
                hostId="desktop"
                visible={visible}
                anchorRect={{ left, top: 10, bottom: 10 }}
                menuType="drawing"
                onRequestClose={() => {}}
                onOptionSelect={(option) => selections.push(option as { label: string; value: string })}
            />
        );
        const view = renderWithDependencies(renderMenu(true, 10));
        const input = screen.getByRole('textbox', { name: 'Menu value' }) as HTMLInputElement;
        input.focus();
        fireEvent.change(input, { target: { value: '3' } });

        view.rerender(renderMenu(true, 20));

        expect(screen.getByRole('textbox', { name: 'Menu value' })).toBe(input);
        expect(document.activeElement).toBe(input);
        expect(input.value).toBe('3');
        expect(selections).toEqual([]);

        view.rerender(renderMenu(false, 20));
        view.rerender(renderMenu(true, 20));
        const reopenedInput = screen.getByRole('textbox', { name: 'Menu value' }) as HTMLInputElement;
        expect(reopenedInput.value).toBe('2');
        fireEvent.click(reopenedInput.closest('button')!);
        expect(selections).toEqual([expect.objectContaining({ label: 'test.command.menu-value', value: '2' })]);
    });

    it.each(['container', 'button', 'input'] as const)(
        'requests closure once when Escape comes from the %s',
        (targetKind) => {
            const close = vi.fn();
            const selection = vi.fn();
            const view = renderWithDependencies(
                <AnchoredContextMenu
                    hostId="desktop"
                    visible
                    anchorRect={{ left: 10, top: 10, bottom: 10 }}
                    menuType="drawing"
                    onRequestClose={close}
                    onOptionSelect={selection}
                />
            );
            const input = screen.getByRole('textbox', { name: 'Menu value' });
            const targets = {
                input,
                button: input.closest('button'),
                container: input.closest('[tabindex="-1"]'),
            };
            const target = targets[targetKind];
            expect(target).not.toBeNull();

            fireEvent.keyDown(target!, { key: 'Escape', bubbles: true });

            expect(close).toHaveBeenCalledOnce();
            expect(selection).not.toHaveBeenCalled();
            expect((input as HTMLInputElement).value).toBe('2');

            view.unmount();
            fireEvent.keyDown(document.body, { key: 'Escape', bubbles: true });
            expect(close).toHaveBeenCalledOnce();
        }
    );
});
