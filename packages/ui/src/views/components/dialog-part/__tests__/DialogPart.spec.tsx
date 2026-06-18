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
import type { IDialogPartMethodOptions } from '../interface';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { DesktopLogService, ILogService, Injector, LocaleService } from '@univerjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import { ComponentManager, IconManager } from '../../../../common';
import { DesktopDialogService } from '../../../../services/dialog/desktop-dialog.service';
import { IDialogService } from '../../../../services/dialog/dialog.service';
import { IUIPartsService, UIPartsService } from '../../../../services/parts/parts.service';
import { RediProvider } from '../../../../utils/di';
import { DialogPart } from '../DialogPart';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function renderWithDependencies(element: ReactElement) {
    const injector = new Injector();
    injector.add([IUIPartsService, { useClass: UIPartsService }]);
    injector.add([IDialogService, { useClass: DesktopDialogService }]);
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([LocaleService]);
    injector.add([ComponentManager]);
    injector.add([IconManager]);

    const result = render(
        <RediProvider value={{ injector }}>
            {element}
        </RediProvider>
    );

    return {
        ...result,
        injector,
        dispose: () => {
            result.unmount();
            cleanup();
        },
    };
}

describe('DialogPart', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders service-opened dialog labels and clears the requested dialog when service closes it', async () => {
        const rendered = renderWithDependencies(<DialogPart />);
        const dialogService = rendered.injector.get(IDialogService);
        const snapshots: IDialogPartMethodOptions[][] = [];
        const subscription = dialogService.getDialogs$().subscribe((options) => snapshots.push(options));

        act(() => {
            dialogService.open({
                id: 'permission-dialog',
                title: { title: <span>Permission needed</span> },
                children: { title: <span>Grant access before editing.</span> },
                width: 320,
            });
        });

        expect(await screen.findByText('Permission needed')).toBeTruthy();
        expect(screen.getByText('Grant access before editing.')).toBeTruthy();

        act(() => {
            dialogService.close('permission-dialog');
        });

        await waitFor(() => {
            expect(screen.queryByText('Grant access before editing.')).toBeNull();
        });
        expect(snapshots.at(-1)).toMatchObject([{ id: 'permission-dialog', open: false }]);

        subscription.unsubscribe();
        rendered.dispose();
    });

    it('keeps excepted dialogs visible when service closes the rest', async () => {
        const rendered = renderWithDependencies(<DialogPart />);
        const dialogService = rendered.injector.get(IDialogService);
        const snapshots: IDialogPartMethodOptions[][] = [];
        const subscription = dialogService.getDialogs$().subscribe((options) => snapshots.push(options));

        act(() => {
            dialogService.open({
                id: 'first-dialog',
                title: { title: <span>First dialog</span> },
                children: { title: <span>Draft changes</span> },
            });
            dialogService.open({
                id: 'second-dialog',
                title: { title: <span>Second dialog</span> },
                children: { title: <span>Keep this open</span> },
            });
        });

        expect(await screen.findByText('Draft changes')).toBeTruthy();
        expect(screen.getByText('Keep this open')).toBeTruthy();

        act(() => {
            dialogService.closeAll(['second-dialog']);
        });

        await waitFor(() => {
            expect(screen.queryByText('Draft changes')).toBeNull();
        });
        expect(screen.getByText('Keep this open')).toBeTruthy();
        expect(snapshots.at(-1)).toMatchObject([
            { id: 'first-dialog', open: false },
            { id: 'second-dialog', open: true },
        ]);

        subscription.unsubscribe();
        rendered.dispose();
    });
});
