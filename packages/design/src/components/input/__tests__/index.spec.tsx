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
import { Input } from '../Input';

afterEach(cleanup);
afterEach(() => {
    vi.unstubAllGlobals();
});

describe('Input', () => {
    afterEach(cleanup);

    it('renders correctly', () => {
        const { container } = render(<Input />);

        expect(container);
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

    it('renders the size', () => {
        const { container } = render(<Input size="large" />);

        expect(container.innerHTML).contains('univer-h-12');
    });

    it('renders the clearable', () => {
        const { container } = render(<Input allowClear value="x" />);

        expect(container.innerHTML).contains('type="button"');
    });

    it('change the value', () => {
        const { container } = render(<Input />);

        const inputElement = container.querySelector('input')!;

        fireEvent.change(inputElement, { target: { value: 'Test' } });

        expect(inputElement.value).toBe('Test');
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

    it('should observe slot mutations and apply slot paddingRight', () => {
        const observe = vi.fn();
        const disconnect = vi.fn();
        class MockMutationObserver {
            private _callback: MutationCallback;

            constructor(callback: MutationCallback) {
                this._callback = callback;
            }

            observe(...args: unknown[]) {
                observe(...args);
                this._callback([], {} as MutationObserver);
            }

            disconnect() {
                disconnect();
            }
        }

        vi.stubGlobal('MutationObserver', MockMutationObserver);

        const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
            configurable: true,
            get() {
                return 20;
            },
        });

        const { container } = render(<Input value="x" slot={<span>slot</span>} />);
        const input = container.querySelector('input') as HTMLInputElement;
        expect(observe).toHaveBeenCalled();
        expect(input.style.paddingRight).toBe('28px');

        if (originalOffsetWidth) {
            Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth);
        }
    });

    it('should set default allowClear padding when no slot exists', () => {
        const { container } = render(<Input allowClear value="x" />);
        const input = container.querySelector('input') as HTMLInputElement;
        expect(input.style.paddingRight).toBe('26px');
    });
});
