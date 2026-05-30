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
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
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
    angle: 0,
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
        const offsetInput = inputs[1]; // Second input is offset

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
        const angleInput = inputs[0]; // First input is angle for linear

        fireEvent.change(angleInput, { target: { value: '180' } });

        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
            angle: 180,
        }));
    });

    it('should call onChange when stop transparency changes', () => {
        const onChange = vi.fn();
        const { container } = render(<GradientColorPicker value={defaultValue} onChange={onChange} />);

        const inputs = container.querySelectorAll('input');
        const transparencyInput = inputs[2]; // Third input is stop transparency for linear

        fireEvent.change(transparencyInput, { target: { value: '40' } });

        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
            stops: expect.arrayContaining([
                expect.objectContaining({ opacity: 0.6 }),
            ]),
        }));
    });

    it('should select stop when clicked', () => {
        const { container } = render(<GradientColorPicker value={defaultValue} />);
        const stops = container.querySelectorAll('[data-u-comp="gradient-color-picker-stop"]');

        // Click the second stop
        fireEvent.click(stops[1]);

        // The second stop should be selected
        expect(stops[1]).toHaveAttribute('data-selected', 'true');
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

        const deleteButton = container.querySelector('[data-u-comp="gradient-color-picker-delete"]');
        if (deleteButton) {
            fireEvent.click(deleteButton);
        }

        expect(onChange).toHaveBeenCalled();
        const calledValue = onChange.mock.calls[0][0] as IGradientValue;
        expect(calledValue.stops.length).toBe(2);
    });

    it('should disable delete button when only 2 stops remain', () => {
        const { container } = render(<GradientColorPicker value={defaultValue} />);
        const deleteButton = container.querySelector('[data-u-comp="gradient-color-picker-delete"]');
        expect(deleteButton).toBeDisabled();
    });

    it('should call onChange when clicking the bar to add a stop', () => {
        const onChange = vi.fn();
        const { container } = render(<GradientColorPicker value={defaultValue} onChange={onChange} />);

        const bar = container.querySelector('[data-u-comp="gradient-color-picker-bar"]');
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

    it('should ignore null offset change from offset input', () => {
        const onChange = vi.fn();
        const { container } = render(<GradientColorPicker value={defaultValue} onChange={onChange} />);
        const inputs = container.querySelectorAll('input');
        const offsetInput = inputs[1] as HTMLInputElement;

        fireEvent.change(offsetInput, { target: { value: '' } });
        expect(onChange).not.toHaveBeenCalled();
    });

    it('should update stop color via nested color picker presets', () => {
        const onChange = vi.fn();
        const { container } = render(<GradientColorPicker value={defaultValue} onChange={onChange} />);

        const presetButton = container.querySelector('[data-u-comp="color-picker-presets"] button') as HTMLButtonElement;
        expect(presetButton).toBeTruthy();
        fireEvent.click(presetButton);

        expect(onChange).toHaveBeenCalled();
        const next = onChange.mock.calls[0][0] as IGradientValue;
        expect(next.stops[0].color).toMatch(/^#/);
    });

    it('should support radial/angular/diamond and fallback preview background', () => {
        const { container, rerender } = render(<GradientColorPicker value={{ ...defaultValue, type: 'radial' }} />);
        const preview = container.querySelector('[data-u-comp="gradient-color-picker-preview"]') as HTMLDivElement;
        expect(preview.style.background).toContain('radial-gradient');

        rerender(<GradientColorPicker value={{ ...defaultValue, type: 'angular' }} />);
        expect((container.querySelector('[data-u-comp="gradient-color-picker-preview"]') as HTMLDivElement).style.background).toContain('conic-gradient');

        rerender(<GradientColorPicker value={{ ...defaultValue, type: 'diamond' }} />);
        expect((container.querySelector('[data-u-comp="gradient-color-picker-preview"]') as HTMLDivElement).style.background).toContain('radial-gradient');

        rerender(<GradientColorPicker value={{ ...defaultValue, type: 'unexpected' as unknown as IGradientValue['type'] }} />);
        expect((container.querySelector('[data-u-comp="gradient-color-picker-preview"]') as HTMLDivElement).style.background).toContain('linear-gradient');
    });

    it('should drag a stop and emit new offset', () => {
        const onChange = vi.fn();
        const { container } = render(<GradientColorPicker value={defaultValue} onChange={onChange} />);
        const bar = container.querySelector('[data-u-comp="gradient-color-picker-bar"]') as HTMLDivElement;
        const stop = container.querySelector('[data-u-comp="gradient-color-picker-stop"]') as HTMLDivElement;

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

        fireEvent.pointerDown(stop, { clientX: 0 });
        fireEvent.pointerMove(window, { clientX: 60 });
        fireEvent.pointerUp(window);

        expect(onChange).toHaveBeenCalled();
        const values = onChange.mock.calls.map((call) => call[0] as IGradientValue);
        expect(values.some((v) => v.stops[0].offset === 60)).toBe(true);
    });

    it('should not remove stop when there are only two stops', () => {
        const onChange = vi.fn();
        const { container } = render(<GradientColorPicker value={defaultValue} onChange={onChange} />);
        const deleteButton = container.querySelector('[data-u-comp="gradient-color-picker-delete"]') as HTMLButtonElement;
        expect(deleteButton).toBeDisabled();
        fireEvent.click(deleteButton);
        expect(onChange).not.toHaveBeenCalled();
    });

    it('should adjust selectedIndex when stops are reduced externally', async () => {
        const valueWithThreeStops: IGradientValue = {
            ...defaultValue,
            stops: [
                { color: '#ffffff', offset: 0 },
                { color: '#ff0000', offset: 50 },
                { color: '#000000', offset: 100 },
            ],
        };
        const { container, rerender } = render(<GradientColorPicker value={valueWithThreeStops} />);

        // Select the third stop (index 2)
        const stops = container.querySelectorAll('[data-u-comp="gradient-color-picker-stop"]');
        fireEvent.click(stops[2]);
        expect(stops[2]).toHaveAttribute('data-selected', 'true');

        // Externally reduce stops to 2
        rerender(<GradientColorPicker value={defaultValue} />);

        // selectedIndex should be clamped to the last valid index (1)
        await waitFor(() => {
            const updatedStops = container.querySelectorAll('[data-u-comp="gradient-color-picker-stop"]');
            expect(updatedStops[1]).toHaveAttribute('data-selected', 'true');
            expect(updatedStops[0]).toHaveAttribute('data-selected', 'false');
        });
    });
});
