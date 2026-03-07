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
import { HueSlider } from '../HueSlider';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
});

describe('HueSlider extra', () => {
    it('should stop propagation, handle drag and emit onChanged', () => {
        const onChange = vi.fn();
        const onChanged = vi.fn();
        const { container } = render(<HueSlider hsv={[120, 60, 70]} onChange={onChange} onChanged={onChanged} />);
        const slider = container.querySelector('[data-u-comp="color-picker-hue-slider"] > div') as HTMLDivElement;
        const thumb = container.querySelector('.univer-size-2') as HTMLDivElement;

        Object.defineProperty(thumb, 'clientWidth', { value: 10, configurable: true });
        Object.defineProperty((slider.parentElement as HTMLDivElement), 'clientWidth', { value: 100, configurable: true });
        slider.getBoundingClientRect = vi.fn(() => ({
            left: 0,
            top: 0,
            width: 100,
            height: 8,
            right: 100,
            bottom: 8,
            x: 0,
            y: 0,
            toJSON: () => {},
        }));

        fireEvent.pointerMove(window, { clientX: 40 });
        fireEvent.pointerDown(slider, { clientX: 40 });
        fireEvent.pointerMove(window, { clientX: 70 });
        fireEvent.pointerUp(window);

        expect(onChange).toHaveBeenCalled();
        expect(onChanged).toHaveBeenCalledWith(120, 60, 70);
    });
});
