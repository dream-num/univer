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

import type { IDisplayMenuItem, IMenuItem } from '../../../../services/menu/menu';
import { act, renderHook } from '@testing-library/react';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { MenuItemType } from '../../../../services/menu/menu';
import { useToolbarItemStatus } from '../hook';

describe('useToolbarItemStatus', () => {
    it('uses the latest emitted selector color as the toolbar value', () => {
        const value$ = new BehaviorSubject('#111111');
        const selectionValue$ = new BehaviorSubject('#222222');
        const menuItem = {
            type: MenuItemType.BUTTON_SELECTOR,
            value$,
            selections: [{ value: 'color-picker', value$: selectionValue$ }],
        } as unknown as IDisplayMenuItem<IMenuItem>;

        const { result } = renderHook(() => useToolbarItemStatus(menuItem));

        expect(result.current.value).toBe('#222222');

        act(() => value$.next('#ff0000'));

        expect(result.current.value).toBe('#ff0000');
    });
});
