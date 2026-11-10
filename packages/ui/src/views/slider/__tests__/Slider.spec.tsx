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

import { cleanup, fireEvent, render } from '@testing-library/react';
import { DesktopLogService, ILogService, Injector, LocaleService, LocaleType } from '@univerjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import type { ISliderProps } from '../Slider';
import { ComponentManager } from '../../../common/component-manager';
import { IconManager } from '../../../common/icon-manager';
import enUS from '../../../locale/en-US';
import zhCN from '../../../locale/zh-CN';
import { RediProvider } from '../../../utils/di';
import { Slider } from '../Slider';

type SliderTestProps = Partial<Omit<ISliderProps, 'onChange'>> & {
    onChange?: (value: number) => void;
};

describe('Slider', () => {
    const injectors: Injector[] = [];
    afterEach(() => {
        cleanup();
        injectors.splice(0).forEach((injector) => injector.dispose());
    });

    function renderSlider(
        props: SliderTestProps = {},
        direction: 'ltr' | 'rtl' = 'ltr',
        locale = LocaleType.EN_US
    ) {
        const injector = new Injector([
            [ILogService, { useClass: DesktopLogService }],
            [LocaleService],
            [ComponentManager],
            [IconManager],
        ]);
        injectors.push(injector);
        const localeService = injector.get(LocaleService);
        localeService.load({ [LocaleType.EN_US]: enUS, [LocaleType.ZH_CN]: zhCN });
        localeService.setLocale(locale);
        localeService.setDirection(direction);
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
        const { getByRole } = renderSlider({ value: 125, onChange: (value) => changes.push(value) });

        fireEvent.click(getByRole('button', { name: 'Zoom out' }));
        fireEvent.click(getByRole('button', { name: 'Reset zoom' }));
        fireEvent.click(getByRole('button', { name: 'Zoom in' }));

        expect(changes).toEqual([115, 100, 135]);
    });

    it('resets once without dragging when the reset target is pressed off-center', () => {
        const changes: number[] = [];
        const { container, getByRole } = renderSlider({ value: 200, onChange: (value) => changes.push(value) });
        const resetButton = getByRole('button', { name: 'Reset zoom' });
        defineTrackRect(getTrack(container));

        fireEvent.pointerDown(resetButton, { clientX: 106.25 });
        fireEvent.pointerUp(resetButton, { clientX: 106.25 });
        fireEvent.click(resetButton);

        expect(changes).toEqual([100]);
    });

    it('continues dragging across the reset target without resetting', () => {
        const changes: number[] = [];
        const { container, getByRole } = renderSlider({ value: 50, onChange: (value) => changes.push(value) });
        const track = getTrack(container);
        const resetButton = getByRole('button', { name: 'Reset zoom' });
        defineTrackRect(track);

        fireEvent.pointerDown(getByRole('slider'), { clientX: 50 });
        fireEvent.pointerMove(resetButton, { clientX: 106.25 });
        fireEvent.pointerUp(resetButton, { clientX: 106.25 });

        expect(changes).toEqual([119]);
    });

    it.each(['Enter', ' '])('resets with the %s key', (key) => {
        const changes: number[] = [];
        const { getByRole } = renderSlider({ value: 200, onChange: (value) => changes.push(value) });

        fireEvent.keyDown(getByRole('button', { name: 'Reset zoom' }), { key });

        expect(changes).toEqual([100]);
    });

    it('shows the reset percentage on hover and keyboard focus', () => {
        const { getByRole, queryByRole } = renderSlider({ resetPoint: 125 });
        const resetButton = getByRole('button', { name: 'Reset zoom' });

        fireEvent.mouseOver(resetButton);
        expect(getByRole('tooltip').textContent).toBe('Reset zoom (125%)');

        fireEvent.mouseOut(resetButton);
        expect(queryByRole('tooltip')).toBeNull();

        fireEvent.focus(resetButton);
        expect(getByRole('tooltip').textContent).toBe('Reset zoom (125%)');
    });

    it.each([
        [LocaleType.EN_US, enUS.ui.accessibility],
        [LocaleType.ZH_CN, zhCN.ui.accessibility],
    ])('exposes UI-owned zoom labels and keyboard input in %s', (locale, labels) => {
        const changes: number[] = [];
        const { getByRole } = renderSlider(
            { value: 125, min: 10, max: 400, onChange: (value) => changes.push(value) },
            'ltr',
            locale
        );
        const slider = getByRole('slider', { name: labels.zoom });

        expect(getByRole('button', { name: labels.zoomOut })).toBeTruthy();
        expect(getByRole('button', { name: labels.zoomIn })).toBeTruthy();
        expect(getByRole('button', { name: labels.resetZoom })).toBeTruthy();
        expect(getByRole('textbox', { name: labels.zoom })).toBeTruthy();
        expect(getByRole('button', { name: labels.menu })).toBeTruthy();

        fireEvent.keyDown(slider, { key: 'ArrowRight' });
        fireEvent.keyDown(slider, { key: 'PageUp' });
        fireEvent.keyDown(slider, { key: 'Home' });
        fireEvent.keyDown(slider, { key: 'End' });

        expect(changes).toEqual([135, 225, 10, 400]);
    });

    it('clamps step buttons at the min and max boundaries', () => {
        const minChanges: number[] = [];
        const minRender = renderSlider({ value: 10, min: 10, onChange: (value) => minChanges.push(value) });
        fireEvent.click(minRender.getByRole('button', { name: 'Zoom out' }));
        expect(minChanges).toEqual([]);
        minRender.unmount();

        const maxChanges: number[] = [];
        const maxRender = renderSlider({ value: 400, max: 400, onChange: (value) => maxChanges.push(value) });
        fireEvent.click(maxRender.getByRole('button', { name: 'Zoom in' }));
        expect(maxChanges).toEqual([]);
    });

    it('selects shortcut zoom values from the dropdown', async () => {
        const changes: number[] = [];
        const { getByRole, getByText } = renderSlider({ onChange: (value) => changes.push(value) });
        const dropdownButton = getByRole('button', { name: 'Menu' });

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
        const track = getTrack(container);
        const input = getByDisplayValue('100%') as HTMLInputElement;
        defineTrackRect(track);

        fireEvent.click(getByRole('button', { name: 'Zoom out' }));
        fireEvent.click(getByRole('button', { name: 'Zoom in' }));
        fireEvent.click(getByRole('button', { name: 'Reset zoom' }));
        fireEvent.pointerDown(track, { clientX: 200 });
        fireEvent.focus(input);

        await wait(60);

        expect(changes).toEqual([]);
        expect(getByRole('slider').getAttribute('aria-valuenow')).toBe('100');
        expect(input.disabled).toBe(true);
        expect(input.value).toBe('100%');
    });
});
