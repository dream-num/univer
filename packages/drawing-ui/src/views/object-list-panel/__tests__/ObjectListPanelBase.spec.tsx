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
import { afterEach, beforeEach, expect, it } from 'vitest';
import enUS from '../../../locale/en-US';
import { getObjectListPanelLabels, ObjectListPanelBase } from '../ObjectListPanelBase';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;
let univer: Univer;
let visibilityChanges: Array<{ ids: string[]; visible: boolean }>;
let selectableChanges: Array<{ ids: string[]; selectable: boolean }>;

beforeEach(() => {
    univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS } });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    visibilityChanges = [];
    selectableChanges = [];
});

afterEach(() => {
    act(() => root.unmount());
    container.remove();
    univer.dispose();
});

function render(element: ReactElement) {
    act(() => root.render(element));
    return { rerender: (next: ReactElement) => act(() => root.render(next)) };
}

function getButton(name: string): HTMLButtonElement {
    const button = Array.from(container.querySelectorAll('button')).find((item) => item.textContent === name);
    if (!button) {
        throw new Error(`Button not found: ${name}`);
    }
    return button;
}

function click(button: HTMLButtonElement): void {
    act(() => button.click());
}

function panel(items: IObjectListPanelItem[], props: Partial<IObjectListPanelBaseProps> = {}) {
    const injector = univer.__getInjector();
    return (
        <RediContext.Provider value={{ injector }}>
            <ObjectListPanelBase
                items={items}
                selectedIds={[]}
                labels={getObjectListPanelLabels(injector.get(LocaleService))}
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

it('switches both bulk actions from current model state, including external updates', () => {
    const original = [{ id: 'a', name: 'A', visible: true }, { id: 'b', name: 'B', visible: true }];
    const view = render(panel(original));
    click(getButton('Hide all'));
    expect(visibilityChanges).toEqual([{ ids: ['a', 'b'], visible: false }]);
    click(getButton('Lock all'));
    expect(selectableChanges).toEqual([{ ids: ['a', 'b'], selectable: false }]);

    view.rerender(panel(original.map((item) => ({ ...item, visible: false, selectable: false }))));
    click(getButton('Show all'));
    click(getButton('Unlock all'));
    expect(visibilityChanges[1]).toEqual({ ids: ['a', 'b'], visible: true });
    expect(selectableChanges[1]).toEqual({ ids: ['a', 'b'], selectable: true });

    view.rerender(panel(original));
    expect(getButton('Hide all')).toBeTruthy();
    expect(getButton('Lock all')).toBeTruthy();
});

it('includes collapsed children and ignores the search filter when normalizing mixed states', () => {
    const group = { id: 'group', name: 'Group', visible: true, selectable: false, isGroup: true, expanded: false };
    render(panel([group], {
        allItems: [group, { id: 'child', visible: false, selectable: true }],
    }));
    const search = container.querySelector<HTMLInputElement>('input[placeholder="Search objects"]')!;
    act(() => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(search, 'unmatched');
        search.dispatchEvent(new Event('input', { bubbles: true }));
    });
    click(getButton('Show all'));
    click(getButton('Lock all'));
    expect(visibilityChanges).toEqual([{ ids: ['group', 'child'], visible: true }]);
    expect(selectableChanges).toEqual([{ ids: ['group', 'child'], selectable: false }]);
});

it('excludes unavailable capabilities and disables actions when no targets exist', () => {
    const items = [
        { id: 'available', name: 'Available', visible: true },
        { id: 'disabled', name: 'Disabled', visible: false, disabled: true },
        { id: 'unsupported', name: 'Unsupported', visible: false, capabilities: { visible: false, selectable: false } },
    ];
    const view = render(panel(items));
    click(getButton('Hide all'));
    click(getButton('Lock all'));
    expect(visibilityChanges).toEqual([{ ids: ['available'], visible: false }]);
    expect(selectableChanges).toEqual([{ ids: ['available'], selectable: false }]);
    view.rerender(panel([]));
    expect((getButton('Show all') as HTMLButtonElement).disabled).toBe(true);
    expect((getButton('Lock all') as HTMLButtonElement).disabled).toBe(true);
});
