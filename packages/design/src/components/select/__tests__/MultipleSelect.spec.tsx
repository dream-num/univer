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

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import { ConfigProvider } from '../../config-provider/ConfigProvider';
import { MultipleSelect } from '../MultipleSelect';

afterEach(cleanup);
const options = [{ label: 'First', value: 'first' }, { label: 'Second', value: 'second' }];

describe('MultipleSelect', () => {
    it('adds and removes items using the latest controlled selection', async () => {
        const onChange = vi.fn();
        const { container, rerender } = render(
            <ConfigProvider locale={enUS.design} mountContainer={document.body}>
                <MultipleSelect value={['first']} options={options} onChange={onChange} />
            </ConfigProvider>
        );
        fireEvent.keyDown(container.querySelector('[data-u-comp="multiple-select"]')!, { key: 'ArrowDown' });
        fireEvent.click(await screen.findByRole('menuitemcheckbox', { name: 'First' }));
        expect(onChange).toHaveBeenLastCalledWith([]);
        await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
        rerender(
            <ConfigProvider locale={enUS.design} mountContainer={document.body}>
                <MultipleSelect value={[]} options={options} onChange={onChange} />
            </ConfigProvider>
        );
        fireEvent.keyDown(container.querySelector('[data-u-comp="multiple-select"]')!, { key: 'ArrowDown' });
        fireEvent.click(await screen.findByRole('menuitemcheckbox', { name: 'Second' }));
        expect(onChange).toHaveBeenLastCalledWith(['second']);
    });

    it('removes a selected badge through its close action', () => {
        const onChange = vi.fn();
        render(
            <ConfigProvider locale={enUS.design} mountContainer={document.body}>
                <MultipleSelect value={['first', 'second']} options={options} onChange={onChange} />
            </ConfigProvider>
        );
        fireEvent.click(screen.getAllByLabelText(enUS.design.Accessibility.closeBadge)[0]);
        expect(onChange).toHaveBeenCalledExactlyOnceWith(['second']);
    });

    it('does not open options when disabled', () => {
        const { container } = render(<MultipleSelect value={['first']} options={options} onChange={vi.fn()} disabled />);
        fireEvent.keyDown(container.querySelector('[data-u-comp="multiple-select"]')!, { key: 'ArrowDown' });
        expect(screen.queryByRole('menu')).toBeNull();
    });
});
