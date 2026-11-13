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

import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { CommandType, ICommandService, LocaleService, LocaleType, Univer } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { afterEach, expect, it } from 'vitest';
import { IconManager } from '../../../common/icon-manager';
import { MenuItemType } from '../../../services/menu/menu';
import { IMenuManagerService, MenuManagerService } from '../../../services/menu/menu-manager.service';
import { FloatingObjectToolbarPosition } from '../../../services/menu/types';
import { RediProvider } from '../../../utils/di';
import { EditorMenuActions } from '../EditorMenu';

afterEach(cleanup);
function TestIcon() {
    return <span />;
}

it('executes contributed commands and observes their disabled and hidden states', async () => {
    const univer = new Univer();
    const injector = univer.__getInjector();
    injector.add([IconManager]);
    injector.add([IMenuManagerService, { useClass: MenuManagerService }]);
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: { test: { action: 'Insert note' } } });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
    injector.get(IconManager).register('TestIcon', TestIcon);
    const disabled$ = new BehaviorSubject(true);
    const hidden$ = new BehaviorSubject(false);
    let insertedNote: unknown;
    injector.get(ICommandService).registerCommand({ id: 'test.insert-note', type: CommandType.COMMAND, handler: (_accessor, params) => {
        insertedNote = params;
        return true;
    } });
    injector.get(IMenuManagerService).mergeMenu({ [FloatingObjectToolbarPosition.BOARD]: { note: { menuItemFactory: () => ({ id: 'test.insert-note', type: MenuItemType.BUTTON, title: 'test.action', icon: 'TestIcon', disabled$, hidden$, params: () => ({ text: 'Note' }) }) } } });
    const view = render(<RediProvider value={{ injector }}><EditorMenuActions position={FloatingObjectToolbarPosition.BOARD} /></RediProvider>);
    try {
        const button = view.getByRole('button', { name: 'Insert note' }) as HTMLButtonElement;
        expect(button.disabled).toBe(true);
        fireEvent.click(button);
        expect(insertedNote).toBeUndefined();
        act(() => disabled$.next(false));
        fireEvent.click(button);
        await waitFor(() => expect(insertedNote).toEqual({ text: 'Note' }));
        act(() => hidden$.next(true));
        expect(view.queryByRole('button', { name: 'Insert note' })).toBeNull();
    } finally {
        view.unmount();
        univer.dispose();
        disabled$.complete();
        hidden$.complete();
    }
});
