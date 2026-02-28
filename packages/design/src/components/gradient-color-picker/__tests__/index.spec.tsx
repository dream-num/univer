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

/**
 * @vitest-environment jsdom
 */

import type { IGradientValue } from '../GradientColorPicker';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GradientColorPicker } from '../GradientColorPicker';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

const defaultValue: IGradientValue = {
    type: 'linear',
    stops: [
        { color: '#ffffff', offset: 0 },
        { color: '#000000', offset: 100 },
    ],
    angle: 90,
};

describe('GradientColorPicker', () => {
    it('renders correctly', () => {
        const { container } = render(<GradientColorPicker value={defaultValue} />);
        expect(container).toBeDefined();
        // Check if segmented items are rendered - they are buttons inside the segmented container
        const segmented = container.querySelector('[data-u-comp="segmented"]');
        expect(segmented?.querySelectorAll('button').length).toBe(4);
    });

    it('should call onChange when type changes', () => {
        const onChange = vi.fn();
        const { container } = render(<GradientColorPicker value={defaultValue} onChange={onChange} />);

        const segmented = container.querySelector('[data-u-comp="segmented"]');
        const items = segmented?.querySelectorAll('button');
        // Click 'radial' (index 1)
        if (items && items[1]) {
            fireEvent.click(items[1]);
        }

        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
            type: 'radial',
        }));
    });

    it('should call onChange when offset changes', () => {
        const onChange = vi.fn();
        const { container } = render(<GradientColorPicker value={defaultValue} onChange={onChange} />);

        const inputs = container.querySelectorAll('input');
        const offsetInput = inputs[0]; // First input is offset

        fireEvent.change(offsetInput, { target: { value: '50' } });

        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
            stops: expect.arrayContaining([
                expect.objectContaining({ offset: 50 }),
            ]),
        }));
    });

    it('should call onChange when angle changes', () => {
        const onChange = vi.fn();
        const { container } = render(<GradientColorPicker value={defaultValue} onChange={onChange} />);

        const inputs = container.querySelectorAll('input');
        const angleInput = inputs[1]; // Second input is angle for linear

        fireEvent.change(angleInput, { target: { value: '180' } });

        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
            angle: 180,
        }));
    });

    it('should select stop when clicked', () => {
        const { container } = render(<GradientColorPicker value={defaultValue} />);
        // Find stops by their style (left: 0% or left: 100%) or by their common classes
        // The stops have univer-absolute and univer-rounded-full
        const stops = container.querySelectorAll('.univer-absolute.univer-rounded-full.univer-border-2');

        // Click the second stop
        fireEvent.click(stops[1]);

        // The second stop should have the selected class (z-10)
        expect(stops[1]).toHaveClass('univer-z-10');
    });

    it('should call onChange when a stop is removed', () => {
        const onChange = vi.fn();
        const valueWithThreeStops: IGradientValue = {
            ...defaultValue,
            stops: [
                { color: '#ffffff', offset: 0 },
                { color: '#ff0000', offset: 50 },
                { color: '#000000', offset: 100 },
            ],
        };
        const { container } = render(<GradientColorPicker value={valueWithThreeStops} onChange={onChange} />);

        // Find delete button - it's the one with univer-border-red-500 or similar
        const deleteButton = container.querySelector('.univer-border-red-500');
        if (deleteButton) {
            fireEvent.click(deleteButton);
        }

        expect(onChange).toHaveBeenCalled();
        const calledValue = onChange.mock.calls[0][0] as IGradientValue;
        expect(calledValue.stops.length).toBe(2);
    });

    it('should disable delete button when only 2 stops remain', () => {
        const { container } = render(<GradientColorPicker value={defaultValue} />);
        const deleteButton = container.querySelector('.univer-border-red-500');
        expect(deleteButton).toBeDisabled();
    });

    it('should call onChange when clicking the bar to add a stop', () => {
        const onChange = vi.fn();
        const { container } = render(<GradientColorPicker value={defaultValue} onChange={onChange} />);

        const bar = container.querySelector('.univer-cursor-crosshair');
        if (bar) {
            // Mock getBoundingClientRect for the bar
            bar.getBoundingClientRect = vi.fn(() => ({
                left: 0,
                width: 100,
                top: 0,
                height: 10,
                bottom: 10,
                right: 100,
                x: 0,
                y: 0,
                toJSON: () => {},
            }));

            fireEvent.click(bar, { clientX: 50 });
        }

        expect(onChange).toHaveBeenCalled();
        const calledValue = onChange.mock.calls[0][0] as IGradientValue;
        expect(calledValue.stops.length).toBe(3);
        expect(calledValue.stops.some((s) => s.offset === 50)).toBe(true);
    });
});
