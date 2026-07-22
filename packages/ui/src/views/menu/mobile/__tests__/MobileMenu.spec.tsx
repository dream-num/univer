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

import type { ComponentProps, ComponentType } from 'react';
import type { IMenuSchema } from '../../../../services/menu/menu-manager.service';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ILogService, Injector, LocaleService } from '@univerjs/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ComponentManager, IconManager } from '../../../../common';
import { MenuItemType } from '../../../../services/menu/menu';
import { IMenuManagerService } from '../../../../services/menu/menu-manager.service';
import { connectInjector } from '../../../../utils/di';
import { MobileMenu } from '../MobileMenu';

class TestLocaleService {
    t(key: string) {
        return key;
    }
}

class TestMenuManagerService {
    readonly menuChanged$ = new Subject<void>();

    getMenuByPositionKey() {
        return [];
    }
}

class TestLogService {
    warn(): void {}
}

function renderWithDependencies(
    schemas: IMenuSchema[],
    onOptionSelect: NonNullable<ComponentProps<typeof MobileMenu>['onOptionSelect']>
) {
    const injector = new Injector();
    injector.add([LocaleService, { useClass: TestLocaleService as never }]);
    injector.add([ILogService, { useClass: TestLogService as never }]);
    injector.add([IMenuManagerService, { useClass: TestMenuManagerService as never }]);
    injector.add([ComponentManager]);
    injector.add([IconManager]);

    const ConnectedTestRoot = connectInjector(() => (
        <MobileMenu schemas={schemas} onOptionSelect={onOptionSelect} />
    ), injector) as ComponentType;

    return render(<ConnectedTestRoot />);
}

afterEach(cleanup);

describe('MobileMenu', () => {
    it('disables an open child view when its parent becomes disabled', async () => {
        const disabled$ = new BehaviorSubject(false);
        const onOptionSelect = vi.fn();

        renderWithDependencies([
            {
                key: 'print',
                order: 0,
                item: {
                    id: 'print.menu',
                    type: MenuItemType.SUBITEMS,
                    title: 'Print',
                    disabled$,
                },
                children: [
                    {
                        key: 'print.layout',
                        order: 0,
                        item: {
                            id: 'print.layout',
                            type: MenuItemType.BUTTON,
                            title: 'Print layout',
                        },
                    },
                ],
            },
        ], onOptionSelect);

        fireEvent.click(screen.getByRole('button', { name: 'Print' }));
        const child = screen.getByRole('button', { name: 'Print layout' });
        expect((child as HTMLButtonElement).disabled).toBe(false);

        act(() => disabled$.next(true));
        await waitFor(() => expect((child as HTMLButtonElement).disabled).toBe(true));
        fireEvent.click(child);
        expect(onOptionSelect).not.toHaveBeenCalled();
    });
});
