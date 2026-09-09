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

import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { hexToHsv } from '../color-conversion';
import { ColorInput } from '../ColorInput';

describe('ColorInput', () => {
    it.each(['F05252', 'aB12Cd'])('preserves the native input value when its own color %s is echoed back', (value) => {
        const onChange = vi.fn();
        const { container, rerender } = render(
            <ColorInput hsv={[0, 100, 100]} alpha={1} format="hex" onChange={onChange} />
        );
        const input = container.querySelector('input[maxlength="6"]') as HTMLInputElement;
        fireEvent.change(input, { target: { value } });
        input.setSelectionRange(2, 4);
        const writeValue = vi.spyOn(input, 'value', 'set');

        expect(onChange).toHaveBeenLastCalledWith(...hexToHsv(value)!);
        rerender(<ColorInput hsv={hexToHsv(value)!} alpha={1} format="hex" onChange={onChange} />);

        expect(writeValue).not.toHaveBeenCalled();
        expect(input.value).toBe(value);
        expect([input.selectionStart, input.selectionEnd]).toEqual([2, 4]);
        writeValue.mockRestore();
    });

    it('synchronizes a different external color while a partial hex value is being edited', () => {
        const onChange = vi.fn();
        const { container, rerender } = render(
            <ColorInput hsv={[0, 100, 100]} alpha={1} format="hex" onChange={onChange} />
        );
        const input = container.querySelector('input[maxlength="6"]') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'F0' } });
        expect(onChange).not.toHaveBeenCalled();

        rerender(<ColorInput hsv={[120, 100, 100]} alpha={1} format="hex" onChange={onChange} />);

        expect(input.value).toBe('00ff00');
        expect(onChange).not.toHaveBeenCalled();
    });

    it('restores the latest accepted color when an incomplete edit loses focus', () => {
        const onChange = vi.fn();
        const { container, rerender } = render(
            <ColorInput hsv={[0, 100, 100]} alpha={1} format="hex" onChange={onChange} />
        );
        const input = container.querySelector('input[maxlength="6"]') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'F05252' } });
        rerender(<ColorInput hsv={hexToHsv('F05252')!} alpha={1} format="hex" onChange={onChange} />);
        fireEvent.change(input, { target: { value: 'F0' } });
        fireEvent.blur(input);

        expect(input.value).toBe('f05252');
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('preserves native IME text until composition ends, then restores an invalid hex value', () => {
        const onChange = vi.fn();
        const { container } = render(
            <ColorInput hsv={[0, 100, 100]} alpha={1} format="hex" onChange={onChange} />
        );
        const input = container.querySelector('input[maxlength="6"]') as HTMLInputElement;

        fireEvent.compositionStart(input);
        fireEvent.compositionUpdate(input, { data: 'ni' });
        fireEvent.input(input, {
            inputType: 'insertCompositionText',
            isComposing: true,
            target: { value: 'ni' },
        });
        expect(input.value).toBe('ni');
        expect(onChange).not.toHaveBeenCalled();

        fireEvent.compositionEnd(input);
        expect(input.value).toBe('ff0000');
        expect(onChange).not.toHaveBeenCalled();
    });

    it('commits a valid hex value once native composition ends', () => {
        const onChange = vi.fn();
        const { container } = render(
            <ColorInput hsv={[0, 100, 100]} alpha={1} format="hex" onChange={onChange} />
        );
        const input = container.querySelector('input[maxlength="6"]') as HTMLInputElement;

        fireEvent.compositionStart(input);
        fireEvent.compositionUpdate(input, { data: 'F05252' });
        fireEvent.input(input, {
            inputType: 'insertCompositionText',
            isComposing: true,
            target: { value: 'F05252' },
        });
        expect(onChange).not.toHaveBeenCalled();

        fireEvent.compositionEnd(input);
        expect(onChange).toHaveBeenCalledOnce();
        expect(onChange).toHaveBeenCalledWith(...hexToHsv('F05252')!);
    });

    it.each(['F05252', 'ni'])('keeps composition %s local and uses current props after a rerender', (value) => {
        const previousOnChange = vi.fn();
        const onChange = vi.fn();
        const hostComposition = vi.fn();
        const { container, rerender, unmount } = render(
            <ColorInput hsv={[0, 100, 100]} alpha={1} format="hex" onChange={previousOnChange} />
        );
        const input = container.querySelector('input[maxlength="6"]') as HTMLInputElement;
        const events = ['compositionstart', 'compositionupdate', 'compositionend'];
        for (const event of events) {
            container.addEventListener(event, hostComposition);
        }
        try {
            fireEvent.compositionStart(input);
            fireEvent.compositionUpdate(input, { data: value });
            fireEvent.input(input, { isComposing: true, target: { value } });
            rerender(<ColorInput hsv={[120, 100, 100]} alpha={1} format="hex" onChange={onChange} />);
            expect(input.value).toBe(value);
            fireEvent.compositionEnd(input);

            expect(hostComposition).not.toHaveBeenCalled();
            expect(previousOnChange).not.toHaveBeenCalled();
            if (value === 'F05252') {
                expect(onChange).toHaveBeenCalledExactlyOnceWith(...hexToHsv(value)!);
            } else {
                expect(input.value).toBe('00ff00');
                expect(onChange).not.toHaveBeenCalled();
            }

            onChange.mockClear();
            unmount();
            fireEvent.compositionEnd(input);
            expect(onChange).not.toHaveBeenCalled();
        } finally {
            for (const event of events) {
                container.removeEventListener(event, hostComposition);
            }
        }
    });

    it.each(['F0!', 'F012345'])('rejects invalid draft %s without committing a color', (value) => {
        const onChange = vi.fn();
        const { container } = render(
            <ColorInput hsv={[0, 100, 100]} alpha={1} format="hex" onChange={onChange} />
        );
        const input = container.querySelector('input[maxlength="6"]') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'F0' } });
        fireEvent.change(input, { target: { value } });
        expect(input.value).toBe('F0');
        expect(onChange).not.toHaveBeenCalled();
    });
});
