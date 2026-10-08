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
    it('preserves typed HEX selection during equivalent color updates and accepts external colors', () => {
        const onChange = vi.fn();
        const { container, rerender } = render(
            <ColorInput hsv={[0, 100, 100]} alpha={1} format="hex" onChange={onChange} />
        );
        const input = container.querySelector<HTMLInputElement>('input[maxlength="6"]')!;
        fireEvent.change(input, { target: { value: 'aB12Cd' } });
        expect(onChange).toHaveBeenCalledWith(...hexToHsv('aB12Cd'));
        input.setSelectionRange(1, 3);
        rerender(<ColorInput hsv={hexToHsv('aB12Cd')} alpha={1} format="hex" onChange={onChange} />);
        expect(input.value).toBe('aB12Cd');
        expect([input.selectionStart, input.selectionEnd]).toEqual([1, 3]);
        rerender(<ColorInput hsv={hexToHsv('00ff00')} alpha={1} format="hex" onChange={onChange} />);
        expect(input.value.toLowerCase()).toBe('00ff00');
    });
});
