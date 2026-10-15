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
import type { Root } from 'react-dom/client';
import type { IObjectListPanelBaseProps, IObjectListPanelItem } from '../ObjectListPanelBase';
import { LocaleService, LocaleType, Univer } from '@univerjs/core';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import { MobileObjectListPanel } from '../MobileObjectListPanel';
import { ObjectListPanelBase } from '../ObjectListPanelBase';

describe.each([
    { name: 'desktop', PanelComponent: ObjectListPanelBase },
    { name: 'mobile', PanelComponent: MobileObjectListPanel },
])('$name object list', ({ PanelComponent }) => {
    let root: Root;
    let container: HTMLDivElement;
    let univer: Univer;
    let visibilityChanges: Array<{ ids: string[]; visible: boolean }>;
    let selectableChanges: Array<{ ids: string[]; selectable: boolean }>;

    beforeEach(() => {
        vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
        univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS } });
        univer.__getInjector().get(LocaleService).setDirection('ltr');
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        visibilityChanges = [];
        selectableChanges = [];
    });

    afterEach(async () => {
        await act(async () => root.unmount());
        container.remove();
        univer.dispose();
        vi.unstubAllGlobals();
    });

    async function render(element: ReactElement) {
        await act(async () => root.render(element));
        return { rerender: async (next: ReactElement) => act(async () => root.render(next)) };
    }

    function getButton(name: string): HTMLButtonElement {
        const button = Array.from(container.querySelectorAll('button')).find((item) => item.textContent === name);
        if (!button) {
            throw new Error(`Button not found: ${name}`);
        }
        return button;
    }

    async function click(button: HTMLButtonElement) {
        await act(async () => button.click());
    }

    function panel(items: IObjectListPanelItem[], props: Partial<IObjectListPanelBaseProps> = {}) {
        const injector = univer.__getInjector();
        return (
            <RediContext.Provider value={{ injector }}>
                <PanelComponent
                    labels={enUS['drawing-ui'].objectListPanel}
                    items={items}
                    selectedIds={[]}
                    onSelect={() => {}}
                    onCommitName={() => {}}
                    onCommitDescription={() => {}}
                    onSetVisible={(ids, visible) => visibilityChanges.push({ ids, visible })}
                    onSetSelectable={(ids, selectable) => selectableChanges.push({ ids, selectable })}
                    {...props}
                />
            </RediContext.Provider>
        );
    }

    it('switches both bulk actions from current model state, including external updates', async () => {
        const original = [{ id: 'a', name: 'A', visible: true }, { id: 'b', name: 'B', visible: true }];
        const view = await render(panel(original));
        await click(getButton('Hide all'));
        expect(visibilityChanges).toEqual([{ ids: ['a', 'b'], visible: false }]);
        await click(getButton('Lock all'));
        expect(selectableChanges).toEqual([{ ids: ['a', 'b'], selectable: false }]);

        await view.rerender(panel(original.map((item) => ({ ...item, visible: false, selectable: false }))));
        await click(getButton('Show all'));
        await click(getButton('Unlock all'));
        expect(visibilityChanges[1]).toEqual({ ids: ['a', 'b'], visible: true });
        expect(selectableChanges[1]).toEqual({ ids: ['a', 'b'], selectable: true });

        await view.rerender(panel(original));
        expect(getButton('Hide all')).toBeTruthy();
        expect(getButton('Lock all')).toBeTruthy();
    });

    it('includes collapsed children and ignores the search filter when normalizing mixed states', async () => {
        const group = { id: 'group', name: 'Group', visible: true, selectable: false, isGroup: true, expanded: false };
        await render(panel([group], {
            allItems: [group, { id: 'child', visible: false, selectable: true }],
        }));
        const search = container.querySelector<HTMLInputElement>('input[placeholder="Search objects"]')!;
        await act(async () => {
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(search, 'unmatched');
            search.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await click(getButton('Show all'));
        await click(getButton('Lock all'));
        expect(visibilityChanges).toEqual([{ ids: ['group', 'child'], visible: true }]);
        expect(selectableChanges).toEqual([{ ids: ['group', 'child'], selectable: false }]);
    });

    it('excludes unavailable capabilities and disables actions when no targets exist', async () => {
        const items = [
            { id: 'available', name: 'Available', visible: true },
            { id: 'disabled', name: 'Disabled', visible: false, disabled: true },
            { id: 'unsupported', name: 'Unsupported', visible: false, capabilities: { visible: false, selectable: false } },
        ];
        const view = await render(panel(items));
        await click(getButton('Hide all'));
        await click(getButton('Lock all'));
        expect(visibilityChanges).toEqual([{ ids: ['available'], visible: false }]);
        expect(selectableChanges).toEqual([{ ids: ['available'], selectable: false }]);
        await view.rerender(panel([]));
        expect(getButton('Show all').disabled).toBe(true);
        expect(getButton('Lock all').disabled).toBe(true);
    });

    it('commits the description on blur and follows external updates', async () => {
        const onCommitDescription = vi.fn();
        const item = { id: 'a', name: 'A', description: 'Original', visible: true };
        const props = { selectedIds: ['a'], onCommitDescription };
        const view = await render(panel([item], props));
        const description = container.querySelector<HTMLTextAreaElement>('textarea')!;
        await act(async () => {
            description.focus();
            Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(description, 'New description');
            description.dispatchEvent(new Event('input', { bubbles: true }));
        });
        expect(onCommitDescription).not.toHaveBeenCalled();
        await act(async () => description.blur());
        expect(onCommitDescription).toHaveBeenCalledExactlyOnceWith('a', 'New description');
        await view.rerender(panel([{ ...item, description: 'External update' }], props));
        expect(description.value).toBe('External update');
    });
});
