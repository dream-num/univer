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

import { cleanup, fireEvent, render } from '@testing-library/react';
import { ConfigContext } from '@univerjs/design';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import type { IMenuSchema } from '../../../../../services/menu/menu-manager.service';
import { useRibbonTabs } from '../use-ribbon-tabs';

const tabs: IMenuSchema[] = ['Start', 'Insert', 'Data'].map((key, order) => ({ key, order }));

function Tabs() {
    const [active, setActive] = useState('Start');
    const onKeyDown = useRibbonTabs(tabs, (tab) => setActive(tab.key));
    return (
        <div role="tablist" onKeyDown={onKeyDown}>
            {tabs.map((tab) => (
                <button key={tab.key} role="tab" aria-selected={active === tab.key} tabIndex={active === tab.key ? 0 : -1}>
                    {tab.key}
                </button>
            ))}
        </div>
    );
}

afterEach(cleanup);

describe('ribbon tab keyboard navigation', () => {
    it.each(['ltr', 'rtl'] as const)('selects, wraps and focuses tabs in %s without leaving extra tab stops', (direction) => {
        const { getByRole, getAllByRole } = render(<ConfigContext.Provider value={{ direction, mountContainer: null }}><Tabs /></ConfigContext.Provider>);
        const start = getByRole('tab', { name: 'Start' });
        start.focus();
        fireEvent.keyDown(start, { key: direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight' });
        const insert = getByRole('tab', { name: 'Insert', selected: true });
        expect(document.activeElement).toBe(insert);
        expect(getAllByRole('tab').filter((tab) => tab.tabIndex === 0)).toEqual([insert]);
        fireEvent.keyDown(insert, { key: 'End' });
        const data = getByRole('tab', { name: 'Data', selected: true });
        expect(document.activeElement).toBe(data);
        fireEvent.keyDown(data, { key: direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight' });
        expect(document.activeElement).toBe(start);
        fireEvent.keyDown(start, { key: direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft' });
        expect(document.activeElement).toBe(data);
        fireEvent.keyDown(data, { key: 'Home' });
        expect(document.activeElement).toBe(start);
    });
});
