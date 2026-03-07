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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Textarea } from '../Textarea';
import '@testing-library/jest-dom/vitest';

describe('Textarea', () => {
    let observeMock: ReturnType<typeof vi.fn>;
    let unobserveMock: ReturnType<typeof vi.fn>;
    let disconnectMock: ReturnType<typeof vi.fn>;
    let triggerResize: (entries: { target: { getBoundingClientRect: () => { width: number; height: number } } }[]) => void;

    beforeEach(() => {
        observeMock = vi.fn();
        unobserveMock = vi.fn();
        disconnectMock = vi.fn();

        // @ts-ignore
        window.ResizeObserver = class ResizeObserver {
            constructor(callback: any) {
                triggerResize = callback;
            }

            observe = observeMock;
            unobserve = unobserveMock;
            disconnect = disconnectMock;
        };
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('should support controlled value', () => {
        const { rerender } = render(<Textarea value="foo" onValueChange={() => {}} />);
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        expect(textarea.value).toBe('foo');
        rerender(<Textarea value="bar" onValueChange={() => {}} />);
        expect(textarea.value).toBe('bar');
    });

    it('should call onResize when size changes', () => {
        const onResize = vi.fn();
        render(<Textarea onResize={onResize} />);

        expect(observeMock).toHaveBeenCalled();

        // Trigger resize with valid dimensions
        triggerResize([{
            target: {
                getBoundingClientRect: () => ({ width: 100, height: 100 }),
            },
        }]);

        expect(onResize).toHaveBeenCalledWith(100, 100);

        // Trigger resize with different dimensions
        triggerResize([{
            target: {
                getBoundingClientRect: () => ({ width: 200, height: 200 }),
            },
        }]);

        expect(onResize).toHaveBeenCalledWith(200, 200);
    });

    it('should not call onResize when size is 0', () => {
        const onResize = vi.fn();
        render(<Textarea onResize={onResize} />);

        // Trigger resize with 0 dimensions
        triggerResize([{
            target: {
                getBoundingClientRect: () => ({ width: 0, height: 0 }),
            },
        }]);

        expect(onResize).not.toHaveBeenCalled();
    });

    it('should not call onResize when size does not change', () => {
        const onResize = vi.fn();
        render(<Textarea onResize={onResize} />);

        // First call
        triggerResize([{
            target: {
                getBoundingClientRect: () => ({ width: 100, height: 100 }),
            },
        }]);
        expect(onResize).toHaveBeenCalledTimes(1);

        // Second call with same dimensions
        triggerResize([{
            target: {
                getBoundingClientRect: () => ({ width: 100, height: 100 }),
            },
        }]);
        expect(onResize).toHaveBeenCalledTimes(1);
    });

    it('should cleanup observer on unmount', () => {
        const onResize = vi.fn();
        const { unmount } = render(<Textarea onResize={onResize} />);

        unmount();

        expect(unobserveMock).toHaveBeenCalled();
        expect(disconnectMock).toHaveBeenCalled();
    });

    it('should forward ref', () => {
        const ref = { current: null as HTMLTextAreaElement | null };
        render(<Textarea ref={ref} />);
        expect(ref.current).not.toBeNull();
        expect(ref.current?.tagName).toBe('TEXTAREA');
    });

    it('should support disabled', () => {
        render(<Textarea disabled />);
        const textarea = screen.getByRole('textbox');
        expect(textarea).toBeDisabled();
    });

    it('should support placeholder', () => {
        render(<Textarea placeholder="Please enter content" />);
        const textarea = screen.getByPlaceholderText('Please enter content');
        expect(textarea).toBeInTheDocument();
    });

    it('should support rows prop', () => {
        render(<Textarea rows={5} />);
        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveAttribute('rows', '5');
    });

    it('renders with default props', () => {
        render(<Textarea />);
        const textarea = screen.getByRole('textbox');
        expect(textarea).toBeInTheDocument();
    });

    it('calls onValueChange when value changes', () => {
        const onValueChange = vi.fn();
        render(<Textarea onValueChange={onValueChange} />);
        const textarea = document.querySelector('textarea[data-u-comp="textarea"]')! as HTMLTextAreaElement;

        fireEvent.change(textarea, { target: { value: 'New value' } });

        expect(onValueChange).toHaveBeenCalledWith('New value');
    });

    it('applies custom className', () => {
        const { container } = render(<Textarea className="custom-class" />);
        const textarea = container.querySelector('textarea[data-u-comp="textarea"]');
        expect(textarea).toHaveClass('custom-class');
    });
});
