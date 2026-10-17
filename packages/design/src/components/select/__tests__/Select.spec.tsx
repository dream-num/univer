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

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import { ConfigProvider } from '../../config-provider/ConfigProvider';
import { Select } from '../Select';

afterEach(cleanup);
const options = [
    { label: 'First', value: 'first' },
    { label: 'Second', value: 'second' },
    { label: 'Unavailable', value: 'disabled', disabled: true },
    { label: 'Group', options: [{ label: 'Grouped', value: 'grouped' }] },
];

describe('Select', () => {
    it('supports labels, keyboard opening, grouped options and the latest controlled callback', async () => {
        const originalChange = vi.fn();
        const nextChange = vi.fn();
        const { rerender } = render(
            <ConfigProvider locale={enUS.design} mountContainer={document.body}>
                <Select aria-label="Format" value="first" options={options} onChange={originalChange} />
            </ConfigProvider>
        );
        const trigger = screen.getByRole('button', { name: 'Format' });
        trigger.focus();
        fireEvent.keyDown(trigger, { key: 'ArrowDown' });
        expect((await screen.findByRole('menuitemradio', { name: 'First' })).getAttribute('aria-checked')).toBe('true');
        expect(screen.getByRole('menuitemradio', { name: 'Unavailable' }).getAttribute('aria-disabled')).toBe('true');
        rerender(
            <ConfigProvider locale={enUS.design} mountContainer={document.body}>
                <Select aria-label="Format" value="second" options={options} onChange={nextChange} />
            </ConfigProvider>
        );
        expect(screen.getByRole('menuitemradio', { name: 'Second' }).getAttribute('aria-checked')).toBe('true');
        fireEvent.click(screen.getByRole('menuitemradio', { name: 'Grouped' }));
        expect(nextChange).toHaveBeenCalledExactlyOnceWith('grouped');
        expect(originalChange).not.toHaveBeenCalled();
    });

    it('prevents interaction when disabled and never submits its containing form', () => {
        const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
        const { rerender } = render(
            <form onSubmit={onSubmit}><Select aria-label="Format" value="first" options={options} onChange={vi.fn()} disabled /></form>
        );
        const trigger = screen.getByRole('button', { name: 'Format' }) as HTMLButtonElement;
        expect(trigger.disabled).toBe(true);
        fireEvent.keyDown(trigger, { key: 'ArrowDown' });
        expect(screen.queryByRole('menu')).toBeNull();
        rerender(<form onSubmit={onSubmit}><Select aria-label="Format" value="first" options={options} onChange={vi.fn()} /></form>);
        fireEvent.click(trigger);
        expect(onSubmit).not.toHaveBeenCalled();
    });
});
