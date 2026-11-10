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
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AlphaSlider } from '../AlphaSlider';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('AlphaSlider', () => {
    it('should update alpha during pointer interaction and emit onChanged', () => {
        const onChange = vi.fn();
        const onChanged = vi.fn();

        const { container } = render(
            <AlphaSlider hsv={[0, 100, 100]} alpha={0.3} onChange={onChange} onChanged={onChanged} />
        );

        const slider = container.querySelector('[data-u-comp="color-picker-alpha-slider-track"]') as HTMLDivElement;
        const thumb = container.querySelector('[data-u-comp="color-picker-alpha-slider-thumb"]') as HTMLDivElement;
        expect(slider).toBeInTheDocument();
        expect(thumb).toBeInTheDocument();

        Object.defineProperty(thumb, 'clientWidth', { value: 10, configurable: true });
        vi.spyOn(slider, 'getBoundingClientRect').mockReturnValue({
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            width: 100,
            height: 8,
            right: 100,
            bottom: 8,
            toJSON: () => ({}),
        } as DOMRect);

        fireEvent.pointerDown(slider, { clientX: 50 });
        fireEvent.pointerMove(window, { clientX: 80 });
        fireEvent.pointerUp(window);

        expect(onChange).toHaveBeenCalled();
        expect(onChanged).toHaveBeenCalledWith(0.3);
    });

    it('should emit latest alpha on pointer up after prop update', () => {
        const onChange = vi.fn();
        const onChanged = vi.fn();

        function Wrapper() {
            const [alpha, setAlpha] = useState(0.3);
            return (
                <AlphaSlider
                    hsv={[0, 100, 100]}
                    alpha={alpha}
                    onChange={(a) => {
                        setAlpha(a);
                        onChange(a);
                    }}
                    onChanged={onChanged}
                />
            );
        }

        const { container } = render(<Wrapper />);
        const slider = container.querySelector('[data-u-comp="color-picker-alpha-slider-track"]') as HTMLDivElement;
        const thumb = container.querySelector('[data-u-comp="color-picker-alpha-slider-thumb"]') as HTMLDivElement;

        Object.defineProperty(thumb, 'clientWidth', { value: 10, configurable: true });
        vi.spyOn(slider, 'getBoundingClientRect').mockReturnValue({
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            width: 100,
            height: 8,
            right: 100,
            bottom: 8,
            toJSON: () => ({}),
        } as DOMRect);

        fireEvent.pointerDown(slider, { clientX: 50 });
        fireEvent.pointerMove(window, { clientX: 80 });
        fireEvent.pointerUp(window);

        expect(onChange).toHaveBeenCalled();
        expect(onChanged).toHaveBeenCalled();
        const lastCall = onChanged.mock.calls[onChanged.mock.calls.length - 1];
        expect(lastCall[0]).toBeGreaterThan(0.3);
    });
});
