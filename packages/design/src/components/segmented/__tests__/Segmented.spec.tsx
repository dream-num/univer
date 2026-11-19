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
import { ConfigProvider } from '../../config-provider/ConfigProvider';
import { Segmented } from '../Segmented';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe('Segmented', () => {
    const items = [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
        { label: 'C', value: 'c' },
    ];

    it('selects the first enabled option and updates uncontrolled selection on click', () => {
        const onChange = vi.fn();
        const { getByRole } = render(
            <Segmented items={[{ label: 'Unavailable', value: 'disabled', disabled: true }, ...items]} onChange={onChange} />
        );
        expect(getByRole('button', { name: 'A' })).toHaveAttribute('aria-pressed', 'true');
        fireEvent.click(getByRole('button', { name: 'Unavailable' }));
        expect(onChange).not.toHaveBeenCalled();
        fireEvent.click(getByRole('button', { name: 'B' }));
        expect(onChange).toHaveBeenCalledWith('b');
        expect(getByRole('button', { name: 'A' })).toHaveAttribute('aria-pressed', 'false');
        expect(getByRole('button', { name: 'B' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('starts from defaultValue but accepts later user selection', () => {
        const { getByRole } = render(<Segmented items={items} defaultValue="b" />);
        expect(getByRole('button', { name: 'B' })).toHaveAttribute('aria-pressed', 'true');
        fireEvent.click(getByRole('button', { name: 'C' }));
        expect(getByRole('button', { name: 'C' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('notifies selection changes while leaving a controlled value to its owner', () => {
        const onChange = vi.fn();
        const options = [{ label: <span>Icon label</span>, value: 'icon' }, ...items];
        const { getByRole, rerender } = render(<Segmented items={options} value="a" onChange={onChange} />);
        fireEvent.click(getByRole('button', { name: 'Icon label' }));
        expect(onChange).toHaveBeenCalledWith('icon');
        expect(getByRole('button', { name: 'A' })).toHaveAttribute('aria-pressed', 'true');
        expect(getByRole('button', { name: 'Icon label' })).toHaveAttribute('aria-pressed', 'false');
        rerender(<Segmented items={options} value="icon" onChange={onChange} />);
        expect(getByRole('button', { name: 'Icon label' })).toHaveAttribute('aria-pressed', 'true');
    });

    it.each(['ltr', 'rtl'] as const)('navigates tabs in %s order, skipping disabled options and linking panels', (direction) => {
        const { getByRole } = render(
            <ConfigProvider mountContainer={document.body} direction={direction}>
                <Segmented
                    role="tablist"
                    aria-label="Chart editor"
                    items={[
                        { label: 'Setup', value: 'setup', id: 'setup-tab', 'aria-controls': 'setup-panel' },
                        { label: 'Unavailable', value: 'disabled', disabled: true },
                        { label: 'Style', value: 'style' },
                        { label: 'Data', value: 'data' },
                    ]}
                />
            </ConfigProvider>
        );
        const setup = getByRole('tab', { name: 'Setup' });
        const style = getByRole('tab', { name: 'Style' });
        const data = getByRole('tab', { name: 'Data' });
        expect(getByRole('tablist', { name: 'Chart editor' })).toBeInTheDocument();
        expect(setup).toHaveAttribute('aria-controls', 'setup-panel');
        expect(setup).toHaveAttribute('aria-selected', 'true');
        expect(style).toHaveAttribute('tabindex', '-1');
        expect(getByRole('tab', { name: 'Unavailable' })).toBeDisabled();
        setup.focus();
        fireEvent.keyDown(setup, { key: direction === 'ltr' ? 'ArrowRight' : 'ArrowLeft' });
        expect(style).toHaveFocus();
        expect(style).toHaveAttribute('aria-selected', 'true');
        expect(setup).toHaveAttribute('tabindex', '-1');
        fireEvent.keyDown(style, { key: direction === 'ltr' ? 'ArrowLeft' : 'ArrowRight' });
        expect(setup).toHaveFocus();
        fireEvent.keyDown(setup, { key: direction === 'ltr' ? 'ArrowLeft' : 'ArrowRight' });
        expect(data).toHaveFocus();
        fireEvent.keyDown(data, { key: 'Home' });
        expect(setup).toHaveFocus();
        fireEvent.keyDown(setup, { key: 'End' });
        expect(data).toHaveFocus();
    });

    it('repositions the indicator when a hidden drawer becomes measurable and disconnects on unmount', () => {
        let resize = () => {};
        const disconnect = vi.fn();
        vi.stubGlobal('ResizeObserver', class {
            constructor(callback: () => void) {
                resize = callback;
            }

            observe() {}
            disconnect = disconnect;
        });
        const { container, getByRole, unmount } = render(<Segmented items={items} />);
        const root = container.querySelector('[data-u-comp="segmented"]') as HTMLDivElement;
        const slider = root.firstElementChild as HTMLDivElement;
        vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({ left: 16, width: 358 } as DOMRect);
        vi.spyOn(getByRole('button', { name: 'A' }), 'getBoundingClientRect')
            .mockReturnValue({ left: 20, width: 173 } as DOMRect);
        resize();
        expect(slider).toHaveStyle({ width: '173px', transform: 'translateX(0px)' });
        unmount();
        expect(disconnect).toHaveBeenCalledOnce();
    });

    it('should position the selected slider from a stable physical left origin in rtl', () => {
        const { container, getByText } = render(
            <ConfigProvider mountContainer={document.body} direction="rtl">
                <Segmented items={items} />
            </ConfigProvider>
        );
        const root = container.querySelector('[data-u-comp="segmented"]') as HTMLDivElement;
        const slider = root.firstElementChild as HTMLDivElement;
        const buttonB = getByText('B') as HTMLButtonElement;

        vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({
            x: 100,
            y: 0,
            top: 0,
            left: 100,
            width: 180,
            height: 32,
            right: 280,
            bottom: 32,
            toJSON: () => ({}),
        } as DOMRect);
        vi.spyOn(buttonB, 'getBoundingClientRect').mockReturnValue({
            x: 156,
            y: 4,
            top: 4,
            left: 156,
            width: 48,
            height: 24,
            right: 204,
            bottom: 28,
            toJSON: () => ({}),
        } as DOMRect);

        fireEvent.click(buttonB);

        expect(slider).toHaveStyle({
            left: '4px',
            width: '48px',
            transform: 'translateX(52px)',
        });
    });
});
