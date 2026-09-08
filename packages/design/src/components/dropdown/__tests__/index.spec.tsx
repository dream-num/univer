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

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import { ConfigProvider } from '../../config-provider/ConfigProvider';
import { Dropdown } from '../Dropdown';
import { MobileOverlayContext } from '../mobile-overlay-context';
import { MobileDropdown } from '../MobileDropdown';

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe('Dropdown', () => {
    it('should render trigger and not show overlay by default', () => {
        const { getByText, queryByText } = render(
            <Dropdown overlay={<div>Overlay Content</div>}>
                <button type="button">Trigger</button>
            </Dropdown>
        );
        expect(getByText('Trigger')).toBeTruthy();
        expect(queryByText('Overlay Content')).toBeNull();
    });

    it('should show overlay when open is true', () => {
        const { getByText } = render(
            <Dropdown overlay={<div>Overlay Content</div>} open>
                <button type="button">Trigger</button>
            </Dropdown>
        );
        expect(getByText('Overlay Content')).toBeTruthy();
    });

    it('should stop intercepting pointer input as soon as the overlay closes', () => {
        const { rerender } = render(
            <Dropdown overlay={<div>Overlay Content</div>} open>
                <button type="button">Trigger</button>
            </Dropdown>
        );

        expect(screen.getByText('Overlay Content').closest('[data-slot="popover-content"]')?.classList.contains('data-[state=closed]:univer-pointer-events-none')).toBe(true);

        rerender(
            <Dropdown overlay={<div>Overlay Content</div>} open={false}>
                <button type="button">Trigger</button>
            </Dropdown>
        );
        expect(screen.queryByText('Overlay Content')).toBeNull();
    });

    it('should call onOpenChange when trigger is clicked', () => {
        const handleOpenChange = vi.fn();
        const { getByText } = render(
            <Dropdown overlay={<div>Overlay Content</div>} onOpenChange={handleOpenChange}>
                <button type="button">Trigger</button>
            </Dropdown>
        );
        getByText('Trigger').click();
        expect(handleOpenChange).toHaveBeenCalled();
    });

    it('should render a touch-first dialog surface from MobileDropdown', () => {
        vi.stubGlobal('CSS', { supports: () => false });
        render(
            <ConfigProvider locale={enUS.design} mountContainer={document.body}>
                <MobileDropdown overlay={<div>Overlay Content</div>} open>
                    <button type="button">Trigger</button>
                </MobileDropdown>
            </ConfigProvider>
        );

        const dialog = screen.getByRole('dialog');
        expect(dialog.textContent).toContain('Overlay Content');
        expect(dialog.style.bottom).toBe('0px');
        expect(dialog.style.maxHeight).toBe('80vh');
        expect(screen.getByText(enUS.design.Accessibility.menu)).toBeTruthy();
    });

    it('registers a non-modal object surface and releases it when closed', () => {
        const release = vi.fn();
        const onMount = vi.fn((_element: HTMLElement) => release);
        const overlay = { modal: false, onMount };
        const app = (open: boolean) => (
            <ConfigProvider locale={enUS.design} mountContainer={document.body}>
                <MobileOverlayContext.Provider value={overlay}>
                    <button type="button">Canvas action</button>
                    <MobileDropdown overlay={<div>Object options</div>} open={open}>
                        <button type="button">Trigger</button>
                    </MobileDropdown>
                </MobileOverlayContext.Provider>
            </ConfigProvider>
        );
        const view = render(app(true));
        const dialog = screen.getByRole('dialog');
        expect(onMount).toHaveBeenCalledWith(dialog);
        expect(dialog.getAttribute('aria-modal')).not.toBe('true');
        expect(screen.getByRole('button', { name: 'Canvas action' })).toBeTruthy();
        expect(dialog.style.height).toMatch(/^40(d?vh)$/);
        view.rerender(app(false));
        expect(release).toHaveBeenCalledTimes(1);
    });
});
