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

import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { IGradientValue } from '../GradientColorPicker';
import enUS from '../../../locale/en-US';
import { ConfigProvider } from '../../config-provider/ConfigProvider';
import { GradientColorPicker } from '../GradientColorPicker';
import '@testing-library/jest-dom/vitest';

beforeEach(() => {
    vi.stubGlobal('CSS', { ...globalThis.CSS, supports: () => false });
    vi.stubGlobal('ResizeObserver', class {
        observe() {}
        disconnect() {}
    });
});
afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

const defaultValue: IGradientValue = {
    type: 'linear',
    stops: [
        { color: '#ffffff', offset: 0 },
        { color: '#000000', offset: 100 },
    ],
    angle: 0,
};

describe('GradientColorPicker', () => {
    it.each([false, true])('changes gradient type without changing its stops (compact: %s)', (compact) => {
        const onChange = vi.fn();
        const view = render(
            <ConfigProvider mountContainer={document.body} locale={enUS.design}>
                <GradientColorPicker compact={compact} value={defaultValue} onChange={onChange} />
            </ConfigProvider>
        );
        fireEvent.click(view.getByRole('button', { name: enUS.design.GradientColorPicker.radial }));
        expect(onChange).toHaveBeenLastCalledWith({ ...defaultValue, type: 'radial' });
        expect(view.getByRole('button', { name: enUS.design.GradientColorPicker.radial })).toHaveAttribute('aria-pressed', 'true');
        expect(view.queryByText(enUS.design.GradientColorPicker.angle)).toBeNull();
    });

    it('edits only the selected stop when its offset changes', () => {
        const onChange = vi.fn();
        const { container } = render(<GradientColorPicker value={defaultValue} onChange={onChange} />);

        fireEvent.click(container.querySelectorAll('[data-u-comp="gradient-color-picker-stop"]')[1]);
        const offsetInput = container.querySelectorAll('input')[1];

        fireEvent.change(offsetInput, { target: { value: '50' } });

        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
            stops: [defaultValue.stops[0], { ...defaultValue.stops[1], offset: 50 }],
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

        const deleteButton = container.querySelector('[data-u-comp="gradient-color-picker-delete"]')!;
        fireEvent.click(deleteButton);

        expect(onChange).toHaveBeenCalled();
        const calledValue = onChange.mock.calls[0][0] as IGradientValue;
        expect(calledValue.stops).toEqual(valueWithThreeStops.stops.slice(1));
    });

    it('should call onChange when clicking the bar to add a stop', () => {
        const onChange = vi.fn();
        const { container } = render(<GradientColorPicker value={defaultValue} onChange={onChange} />);

        const bar = container.querySelector('[data-u-comp="gradient-color-picker-bar"]')!;
        vi.spyOn(bar, 'getBoundingClientRect').mockReturnValue({
            left: 0,
            width: 100,
            top: 0,
            height: 10,
            bottom: 10,
            right: 100,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        });
        fireEvent.click(bar, { clientX: 50 });

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

        const presetButton = container.querySelector('[data-u-comp="color-picker-presets"] button[aria-pressed="false"]') as HTMLButtonElement;
        fireEvent.click(presetButton);

        expect(onChange).toHaveBeenCalled();
        const next = onChange.mock.calls[0][0] as IGradientValue;
        expect(next.stops).toEqual([
            { ...defaultValue.stops[0], color: presetButton.getAttribute('aria-label')!.toLowerCase() },
            defaultValue.stops[1],
        ]);
    });

    it('should drag a stop and emit new offset', () => {
        const onChange = vi.fn();
        const { container } = render(<GradientColorPicker value={defaultValue} onChange={onChange} />);
        const bar = container.querySelector('[data-u-comp="gradient-color-picker-bar"]') as HTMLDivElement;
        const stop = container.querySelector('[data-u-comp="gradient-color-picker-stop"]') as HTMLButtonElement;

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
    it('supports selecting, moving, adding and deleting stops with keyboard controls', () => {
        const onChange = vi.fn();
        const view = render(
            <ConfigProvider mountContainer={document.body} locale={enUS.design}>
                <GradientColorPicker value={defaultValue} onChange={onChange} />
            </ConfigProvider>
        );
        const second = view.getAllByRole('slider')[1];
        fireEvent.focus(second);
        fireEvent.keyDown(second, { key: 'ArrowLeft' });
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({
            stops: [defaultValue.stops[0], { ...defaultValue.stops[1], offset: 99 }],
        }));
        fireEvent.click(view.getByRole('button', { name: enUS.design.GradientColorPicker.add }));
        expect(view.getAllByRole('slider')).toHaveLength(3);
        fireEvent.click(view.getByRole('button', { name: enUS.design.GradientColorPicker.delete }));
        expect(view.getAllByRole('slider')).toHaveLength(2);
        expect(view.getByRole('textbox', { name: enUS.design.GradientColorPicker.transparency })).toBeTruthy();
    });

    it.each(['pointerUp', 'pointerCancel', 'unmount'] as const)('ends a drag exactly once on %s', (end) => {
        const onDragStart = vi.fn();
        const onDragEnd = vi.fn();
        const view = render(<GradientColorPicker value={defaultValue} onDragStart={onDragStart} onDragEnd={onDragEnd} />);
        fireEvent.pointerDown(view.getAllByRole('slider')[0], { clientX: 0 });
        expect(onDragStart).toHaveBeenCalledOnce();
        if (end === 'unmount') {
            view.unmount();
        } else {
            fireEvent[end](window);
            view.unmount();
        }
        expect(onDragEnd).toHaveBeenCalledOnce();
    });
});
