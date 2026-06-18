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
import type { IConfirmChildrenProps, IConfirmPartMethodOptions } from '../interface';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DesktopLogService, IConfirmService, ILogService, Injector, LocaleService } from '@univerjs/core';
import { useEffect } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { ComponentManager, IconManager } from '../../../../common';
import { DesktopConfirmService } from '../../../../services/confirm/desktop-confirm.service';
import { IUIPartsService, UIPartsService } from '../../../../services/parts/parts.service';
import { RediProvider } from '../../../../utils/di';
import { ConfirmPart } from '../ConfirmPart';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class TestState {
    static confirmAttempts = 0;
    static confirmResults: Array<Record<string, unknown> | undefined> = [];

    static reset(): void {
        this.confirmAttempts = 0;
        this.confirmResults = [];
    }
}

function GuardedConfirmContent({ hooks }: { hooks?: IConfirmChildrenProps['hooks'] }) {
    useEffect(() => {
        if (!hooks) return;

        hooks.beforeConfirm = () => {
            TestState.confirmAttempts += 1;

            if (TestState.confirmAttempts === 1) {
                return { cancel: true };
            }

            return { cancel: false, rowCount: 3 };
        };

        return () => {
            delete hooks.beforeConfirm;
        };
    }, [hooks]);

    return <span>Rows selected</span>;
}

function renderWithDependencies(element: ReactElement) {
    const injector = new Injector();
    injector.add([IUIPartsService, { useClass: UIPartsService }]);
    injector.add([IConfirmService, { useClass: DesktopConfirmService as never }]);
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([LocaleService]);
    injector.add([ComponentManager]);
    injector.add([IconManager]);

    injector.get(ComponentManager).register('guarded-confirm-content', GuardedConfirmContent);

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

describe('ConfirmPart', () => {
    afterEach(() => {
        cleanup();
        TestState.reset();
    });

    it('resolves confirmation and clears the active confirm state after the user confirms', async () => {
        const rendered = renderWithDependencies(<ConfirmPart />);
        const confirmService = rendered.injector.get(IConfirmService) as IConfirmService<IConfirmPartMethodOptions>;
        const snapshots: IConfirmPartMethodOptions[][] = [];
        const subscription = confirmService.confirmOptions$.subscribe((options) => snapshots.push(options));
        let answer!: Promise<boolean>;

        act(() => {
            answer = confirmService.confirm({
                id: 'remove-sheet',
                title: { title: <span>Remove sheet</span> },
                children: { title: <span>This action cannot be undone.</span> },
                cancelText: 'Keep',
                confirmText: 'Remove',
            });
        });

        expect(await screen.findByText('This action cannot be undone.')).toBeTruthy();

        fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

        await expect(answer).resolves.toBe(true);
        await waitFor(() => {
            expect(screen.queryByText('This action cannot be undone.')).toBeNull();
        });
        expect(snapshots.at(-1)).toEqual([]);

        subscription.unsubscribe();
        rendered.dispose();
    });

    it('lets child hooks veto the first confirm and pass data to the final confirm callback', async () => {
        const rendered = renderWithDependencies(<ConfirmPart />);
        const confirmService = rendered.injector.get(IConfirmService) as IConfirmService<IConfirmPartMethodOptions>;

        let disposable!: ReturnType<IConfirmService<IConfirmPartMethodOptions>['open']>;

        act(() => {
            disposable = confirmService.open({
                id: 'guarded-delete',
                title: { title: <span>Delete rows</span> },
                children: { label: 'guarded-confirm-content' },
                cancelText: 'Cancel',
                confirmText: 'Delete',
                onConfirm: (result) => {
                    TestState.confirmResults.push(result);
                },
            });
        });

        expect(await screen.findByText('Rows selected')).toBeTruthy();

        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

        expect(TestState.confirmAttempts).toBe(1);
        expect(TestState.confirmResults).toEqual([]);
        expect(screen.getByText('Rows selected')).toBeTruthy();

        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

        expect(TestState.confirmAttempts).toBe(2);
        expect(TestState.confirmResults).toEqual([{ cancel: false, rowCount: 3 }]);

        disposable.dispose();
        rendered.dispose();
    });
});
