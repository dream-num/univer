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

import type { PropsWithChildren } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnchoredContextMenu } from '../AnchoredContextMenu';

const hostService = {
    activateMenu: vi.fn(),
    deactivateMenu: vi.fn(),
    registerMenu: vi.fn(() => ({ dispose: vi.fn() })),
};
const panelProps = vi.fn();

vi.mock('@univerjs/design', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/design')>();

    return {
        ...actual,
        Popup: ({ children }: PropsWithChildren) => <>{children}</>,
    };
});

vi.mock('../../../../utils/di', () => ({
    useDependency: () => hostService,
}));

vi.mock('../ContextMenuPanel', () => ({
    CONTEXT_MENU_SUBMENU_PORTAL_ATTR: 'data-u-context-menu-submenu',
    ContextMenuPanel: (props: {
        autoFocus?: boolean;
        onCancel?: () => void;
        onOptionSelect?: (option: { label: string; value: string }) => void;
    }) => {
        const [value, setValue] = useState('2');
        panelProps(props);
        return (
            <div
                tabIndex={-1}
                onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                        event.stopPropagation();
                        props.onCancel?.();
                    }
                }}
            >
                <button
                    type="button"
                    aria-label="Context menu item"
                    onClick={() => props.onOptionSelect?.({ label: 'test.command.menu-value', value })}
                >
                    <input
                        aria-label="Menu value"
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                    />
                </button>
            </div>
        );
    },
}));

describe('AnchoredContextMenu', () => {
    beforeEach(() => {
        panelProps.mockClear();
    });

    afterEach(cleanup);

    it('passes its close callback to the context menu panel', () => {
        const close = vi.fn();
        render(
            <AnchoredContextMenu
                hostId="desktop"
                visible
                anchorRect={{ left: 0, top: 0, bottom: 0 }}
                menuType="drawing"
                onRequestClose={close}
            />
        );

        fireEvent.keyDown(screen.getByRole('button', { name: 'Context menu item' }), {
            key: 'Escape',
        });

        expect(close).toHaveBeenCalledOnce();
    });

    it('restores the element focused before the menu opened', () => {
        const { rerender } = render(
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
        screen.getByRole('button', { name: 'Context menu item' }).focus();

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
        const rendered = render(
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
        rendered.getByRole('button', { name: 'Context menu item' }).focus();

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

    it('forwards keyboard autofocus to the context menu panel', () => {
        render(
            <AnchoredContextMenu
                hostId="desktop"
                visible
                anchorRect={{ left: 0, top: 0, bottom: 0 }}
                menuType="drawing"
                autoFocus
                onRequestClose={vi.fn()}
            />
        );

        expect(panelProps).toHaveBeenCalledWith(expect.objectContaining({ autoFocus: true }));
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
        const view = render(renderMenu(true, 10));
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
        expect(selections).toEqual([{ label: 'test.command.menu-value', value: '2' }]);
    });

    it.each(['container', 'button', 'input'] as const)(
        'requests closure once when Escape comes from the %s',
        (targetKind) => {
            const close = vi.fn();
            const selection = vi.fn();
            const view = render(
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
