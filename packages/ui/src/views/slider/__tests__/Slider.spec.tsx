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

import type { ISliderProps } from '../Slider';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { DesktopLogService, ILogService, Injector, LocaleService } from '@univerjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import { ComponentManager, IconManager } from '../../../common';
import { RediProvider } from '../../../utils/di';
import { Slider } from '../Slider';

type SliderTestProps = Partial<Omit<ISliderProps, 'onChange'>> & {
    onChange?: (value: number) => void;
};

describe('Slider', () => {
    afterEach(() => {
        cleanup();
    });

    function renderSlider(props: SliderTestProps = {}, direction: 'ltr' | 'rtl' = 'ltr') {
        const injector = new Injector([
            [ILogService, { useClass: DesktopLogService }],
            [LocaleService],
            [ComponentManager],
            [IconManager],
        ]);
        injector.get(LocaleService).setDirection(direction);
        const { onChange = () => {}, ...sliderProps } = props;

        return render(
            <RediProvider value={{ injector }}>
                <Slider value={100} shortcuts={[50, 100, 200, 400]} onChange={onChange} {...sliderProps} />
            </RediProvider>
        );
    }

    function defineTrackRect(track: HTMLDivElement) {
        Object.defineProperty(track, 'getBoundingClientRect', {
            configurable: true,
            value: () => ({
                x: 0,
                y: 0,
                top: 0,
                left: 0,
                width: 200,
                height: 6,
                right: 200,
                bottom: 6,
                toJSON: () => ({}),
            } as DOMRect),
        });
    }

    function wait(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function getTrack(container: HTMLElement) {
        return container.querySelector('[role="track"]') as HTMLDivElement;
    }

    function getNativeButtons(container: HTMLElement) {
        return Array.from(container.querySelectorAll('button'));
    }

    it('keeps drag visual responsive, throttles real zoom updates and flushes on pointer up', async () => {
        const changes: number[] = [];
        const { container, getByRole } = renderSlider({ onChange: (value) => changes.push(value) });
        const track = getTrack(container);
        const handle = getByRole('slider');
        defineTrackRect(track);

        fireEvent.pointerDown(track, { clientX: 120 });
        expect(changes).toEqual([]);
        expect(handle.getAttribute('aria-valuenow')).toBe('160');

        fireEvent.pointerMove(window, { clientX: 200 });
        expect(changes).toEqual([]);
        expect(handle.getAttribute('aria-valuenow')).toBe('400');

        await wait(60);
        expect(changes).toEqual([400]);

        fireEvent.pointerMove(window, { clientX: 0 });
        expect(handle.getAttribute('aria-valuenow')).toBe('0');
        expect(changes).toEqual([400]);

        fireEvent.pointerUp(window);
        expect(changes).toEqual([400, 0]);

        await wait(60);
        expect(changes).toEqual([400, 0]);
    });

    it('clamps dragging to min and max', async () => {
        const changes: number[] = [];
        const { container, getByRole } = renderSlider({ min: 10, max: 300, onChange: (value) => changes.push(value) });
        const track = getTrack(container);
        const handle = getByRole('slider');
        defineTrackRect(track);

        fireEvent.pointerDown(track, { clientX: -80 });
        expect(handle.getAttribute('aria-valuenow')).toBe('10');

        await wait(60);
        expect(changes).toEqual([10]);

        fireEvent.pointerMove(window, { clientX: 280 });
        expect(handle.getAttribute('aria-valuenow')).toBe('300');

        fireEvent.pointerUp(window);
        expect(changes).toEqual([10, 300]);
    });

    it('maps dragging from right to left in rtl', () => {
        const changes: number[] = [];
        const { container, getByRole } = renderSlider({ onChange: (value) => changes.push(value) }, 'rtl');
        const track = getTrack(container);
        const handle = getByRole('slider');
        defineTrackRect(track);

        fireEvent.pointerDown(track, { clientX: 200 });
        expect(handle.getAttribute('aria-valuenow')).toBe('0');

        fireEvent.pointerMove(window, { clientX: 0 });
        expect(handle.getAttribute('aria-valuenow')).toBe('400');

        fireEvent.pointerUp(window);
        expect(changes).toEqual([400]);
    });

    it('steps down, resets, and steps up with the toolbar buttons', () => {
        const changes: number[] = [];
        const { container } = renderSlider({ value: 125, onChange: (value) => changes.push(value) });
        const buttons = getNativeButtons(container);
        const reduceButton = buttons[0];
        const increaseButton = buttons[2];
        const resetButton = container.querySelector('a[role="button"]') as HTMLElement;

        fireEvent.click(reduceButton);
        fireEvent.click(resetButton);
        fireEvent.click(increaseButton);

        expect(changes).toEqual([115, 100, 135]);
    });

    it('clamps step buttons at the min and max boundaries', () => {
        const minChanges: number[] = [];
        const minRender = renderSlider({ value: 10, min: 10, onChange: (value) => minChanges.push(value) });
        fireEvent.click(getNativeButtons(minRender.container)[0]);
        expect(minChanges).toEqual([]);
        minRender.unmount();

        const maxChanges: number[] = [];
        const maxRender = renderSlider({ value: 400, max: 400, onChange: (value) => maxChanges.push(value) });
        fireEvent.click(getNativeButtons(maxRender.container)[2]);
        expect(maxChanges).toEqual([]);
    });

    it('selects shortcut zoom values from the dropdown', async () => {
        const changes: number[] = [];
        const { container, getByText } = renderSlider({ onChange: (value) => changes.push(value) });
        const dropdownButton = getNativeButtons(container)[3];

        fireEvent.pointerDown(dropdownButton);
        await wait(0);
        fireEvent.click(getByText('200%'));

        expect(changes).toEqual([200]);
    });

    it('edits exact zoom without committing until blur', () => {
        const changes: number[] = [];
        const { getByDisplayValue } = renderSlider({ onChange: (value) => changes.push(value) });
        const input = getByDisplayValue('100%');

        fireEvent.focus(input);
        expect((input as HTMLInputElement).value).toBe('100');

        fireEvent.change(input, { target: { value: '125' } });
        expect(changes).toEqual([]);

        fireEvent.blur(input);
        expect(changes).toEqual([125]);
    });

    it('restores invalid exact zoom input without committing', () => {
        const changes: number[] = [];
        const { getByDisplayValue } = renderSlider({ onChange: (value) => changes.push(value) });
        const input = getByDisplayValue('100%') as HTMLInputElement;

        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: 'abc' } });
        fireEvent.blur(input);

        expect(changes).toEqual([]);
        expect(input.value).toBe('100%');
    });

    it('rounds and clamps exact zoom input on blur', () => {
        const changes: number[] = [];
        const { getByDisplayValue } = renderSlider({ max: 400, onChange: (value) => changes.push(value) });
        const input = getByDisplayValue('100%') as HTMLInputElement;

        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: '399.4%' } });
        fireEvent.blur(input);
        expect(changes).toEqual([399]);
        expect(input.value).toBe('399%');

        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: '999' } });
        fireEvent.blur(input);
        expect(changes).toEqual([399, 400]);
        expect(input.value).toBe('400%');
    });

    it('commits exact zoom input on Enter and removes focus', () => {
        const changes: number[] = [];
        const { getByDisplayValue } = renderSlider({ onChange: (value) => changes.push(value) });
        const input = getByDisplayValue('100%') as HTMLInputElement;

        input.focus();
        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: '150' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(changes).toEqual([150]);
        expect(document.activeElement).not.toBe(input);
    });

    it('does not commit interactions when disabled', async () => {
        const changes: number[] = [];
        const { container, getByDisplayValue, getByRole } = renderSlider({
            disabled: true,
            onChange: (value) => changes.push(value),
        });
        const buttons = getNativeButtons(container);
        const track = getTrack(container);
        const input = getByDisplayValue('100%') as HTMLInputElement;
        defineTrackRect(track);

        fireEvent.click(buttons[0]);
        fireEvent.click(buttons[2]);
        fireEvent.click(container.querySelector('a[role="button"]') as HTMLElement);
        fireEvent.pointerDown(track, { clientX: 200 });
        fireEvent.focus(input);

        await wait(60);

        expect(changes).toEqual([]);
        expect(getByRole('slider').getAttribute('aria-valuenow')).toBe('100');
        expect(input.disabled).toBe(true);
        expect(input.value).toBe('100%');
    });
});
