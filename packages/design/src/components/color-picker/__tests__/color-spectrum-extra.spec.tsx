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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ColorSpectrum } from '../ColorSpectrum';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
});

describe('ColorSpectrum extra', () => {
    beforeEach(() => {
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
            const gradient = { addColorStop: vi.fn() };
            return {
                createLinearGradient: vi.fn(() => gradient),
                fillRect: vi.fn(),
                fillStyle: '',
            } as unknown as CanvasRenderingContext2D;
        });
    });

    it('should draw gradients and emit pointer-driven hsv changes', () => {
        const onChange = vi.fn();
        const onChanged = vi.fn();
        const { container } = render(<ColorSpectrum hsv={[120, 20, 80]} onChange={onChange} onChanged={onChanged} />);

        const canvas = container.querySelector('canvas') as HTMLCanvasElement;
        const wrapper = container.querySelector('[data-u-comp="color-picker-spectrum"]') as HTMLDivElement;
        Object.defineProperty(wrapper, 'clientWidth', { value: 100, configurable: true });
        Object.defineProperty(wrapper, 'clientHeight', { value: 100, configurable: true });
        canvas.getBoundingClientRect = vi.fn(() => ({
            left: 0,
            top: 0,
            width: 100,
            height: 100,
            right: 100,
            bottom: 100,
            x: 0,
            y: 0,
            toJSON: () => {},
        }));

        fireEvent.pointerDown(canvas, { clientX: 50, clientY: 25 });
        fireEvent.pointerMove(canvas, { clientX: 80, clientY: 40 });
        fireEvent.mouseUp(wrapper);
        fireEvent.pointerUp(window);
        fireEvent.mouseUp(window);

        expect(onChange).toHaveBeenCalled();
        expect(onChanged).toHaveBeenCalledWith(120, 20, 80);
    });
});
