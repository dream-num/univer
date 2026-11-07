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
import { afterEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import zhCN from '../../../locale/zh-CN';
import { ConfigProvider } from '../../config-provider/ConfigProvider';
import { Input } from '../Input';

afterEach(cleanup);

describe('Input', () => {
    it('forwards mobile keyboard, validation and focus attributes to the input', () => {
        const onFocus = vi.fn();
        const { getByLabelText } = render(
            <Input aria-label="Amount" aria-invalid inputMode="decimal" required onFocus={onFocus} />
        );
        const input = getByLabelText('Amount') as HTMLInputElement;
        input.focus();
        expect(document.activeElement).toBe(input);
        expect(input.inputMode).toBe('decimal');
        expect(input.getAttribute('aria-invalid')).toBe('true');
        expect(input.checkValidity()).toBe(false);
        expect(onFocus).toHaveBeenCalledOnce();
    });

    it('renders the placeholder', () => {
        const { getByPlaceholderText } = render(<Input placeholder="Test" />);
        const inputElement = getByPlaceholderText('Test');

        expect(inputElement).not.toBeNull();
    });

    it('renders the value', () => {
        const { getByDisplayValue } = render(<Input value="Test" />);
        const inputElement = getByDisplayValue('Test');

        expect(inputElement).not.toBeNull();
    });

    it('renders the disabled', () => {
        const { container } = render(<Input disabled />);

        expect(container.querySelector('input')?.disabled).toBeTruthy();
    });

    it('change the value', () => {
        const onChange = vi.fn();
        const { container } = render(<Input onChange={onChange} />);

        const inputElement = container.querySelector('input')!;

        fireEvent.change(inputElement, { target: { value: 'Test' } });

        expect(inputElement.value).toBe('Test');
        expect(onChange).toHaveBeenCalledExactlyOnceWith('Test');
    });

    it('should clear value without bubbling click event', () => {
        const onChange = vi.fn();
        const parentClick = vi.fn();
        const { container } = render(
            <div onClick={parentClick}>
                <Input allowClear value="abc" onChange={onChange} />
            </div>
        );

        const clearButton = container.querySelector('button[type="button"]') as HTMLButtonElement;
        fireEvent.click(clearButton);

        expect(onChange).toHaveBeenCalledWith('');
        expect(parentClick).not.toHaveBeenCalled();
    });

    it('names the clear action in the current locale and preserves its behavior', () => {
        const onChange = vi.fn();
        const { getByRole, rerender } = render(
            <ConfigProvider locale={enUS.design} mountContainer={document.body}>
                <Input allowClear value="abc" onChange={onChange} />
            </ConfigProvider>
        );
        fireEvent.click(getByRole('button', { name: 'Clear input' }));
        expect(onChange).toHaveBeenCalledWith('');
        rerender(
            <ConfigProvider locale={zhCN.design} mountContainer={document.body}>
                <Input allowClear value="abc" onChange={onChange} />
            </ConfigProvider>
        );
        expect(getByRole('button', { name: '清空输入' })).toBeDefined();
    });
});
