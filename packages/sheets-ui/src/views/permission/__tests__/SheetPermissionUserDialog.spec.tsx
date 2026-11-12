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

import type { ICollaborator } from '@univerjs/protocol';
import { IAuthzIoService, Injector, LocaleService, LocaleType } from '@univerjs/core';
import { ConfigProvider } from '@univerjs/design';
import designEnUS from '@univerjs/design/locale/en-US';
import { UnitRole } from '@univerjs/protocol';
import { IDialogService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import { SheetPermissionUserManagerService } from '../../../services/permission/sheet-permission-user-list.service';
import { SheetPermissionUserDialog } from '../SheetPermissionUserDialog';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const disposals: Array<() => void> = [];

afterEach(() => {
    disposals.splice(0).forEach((dispose) => dispose());
});

function createTestBed() {
    const injector = new Injector();
    const close = vi.fn<IDialogService['close']>();
    injector.add([LocaleService]);
    injector.add([SheetPermissionUserManagerService]);
    injector.add([IAuthzIoService, { useValue: { getCfgEnableObjInherit: () => false } as IAuthzIoService }]);
    injector.add([IDialogService, { useValue: { close } as unknown as IDialogService }]);
    const localeService = injector.get(LocaleService);
    localeService.load({ [LocaleType.EN_US]: enUS });
    localeService.setLocale(LocaleType.EN_US);

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    disposals.push(() => {
        act(() => root.unmount());
        container.remove();
        injector.dispose();
    });

    return {
        close,
        container,
        injector,
        render: () => act(() => {
            root.render(
                <RediContext.Provider value={{ injector }}>
                    <ConfigProvider locale={designEnUS.design} mountContainer={container}>
                        <SheetPermissionUserDialog />
                    </ConfigProvider>
                </RediContext.Provider>
            );
        }),
    };
}

function enterSearch(container: HTMLElement, value: string) {
    const input = container.querySelector('input')!;
    act(() => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    return input;
}

function clickButton(container: HTMLElement, text: string) {
    const button = Array.from(container.querySelectorAll('button')).find((button) => button.textContent === text);
    expect(button).toBeDefined();
    act(() => button!.click());
}

describe('SheetPermissionUserDialog', () => {
    it('restores candidates and input focus without losing selected editors when search is cleared', () => {
        const { close, container, injector, render } = createTestBed();
        const manager = injector.get(SheetPermissionUserManagerService);
        const editor: ICollaborator = {
            id: 'editor',
            role: UnitRole.Editor,
            subject: { userID: 'editor', name: 'Alice', avatar: '' },
        };
        manager.setCanEditUserList([editor]);
        manager.setSelectUserList([editor]);
        render();

        enterSearch(container, '  ALICE  ');
        expect(container.textContent).toContain('Alice');
        const input = enterSearch(container, 'missing');
        expect(container.querySelector('[role="status"]')?.textContent).toContain('No matching people found');

        clickButton(container, 'Clear search');
        expect(document.activeElement).toBe(input);
        expect(input.value).toBe('');
        expect(container.textContent).toContain('Alice');
        expect(container.querySelector('[role="status"]')).toBeNull();
        clickButton(container, 'Confirm');
        expect(manager.selectUserList).toEqual([editor]);
        expect(close).toHaveBeenCalledOnce();
    });

    it('distinguishes no eligible collaborators from a search with no matches', () => {
        const { container, injector, render } = createTestBed();
        const manager = injector.get(SheetPermissionUserManagerService);
        manager.setCanEditUserList([{
            id: 'reader',
            role: UnitRole.Reader,
            subject: { userID: 'reader', name: 'Reader', avatar: '' },
        }]);
        render();

        enterSearch(container, '   ');
        expect(container.querySelector('[role="status"]')?.textContent).toBe('No people available to add');
        expect(container.textContent).not.toContain('Clear search');
        enterSearch(container, 'Reader');
        expect(container.querySelector('[role="status"]')?.textContent).toContain('No matching people found');
        clickButton(container, 'Clear search');
        expect(container.querySelector('[role="status"]')?.textContent).toBe('No people available to add');
    });
});
