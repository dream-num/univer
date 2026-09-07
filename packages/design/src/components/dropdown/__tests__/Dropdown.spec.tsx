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

afterEach(cleanup);

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
        const mountContainer = document.createElement('div');
        render(
            <ConfigProvider mountContainer={mountContainer}>
                <Dropdown overlay={<div>Overlay Content</div>} open>
                    <button type="button">Trigger</button>
                </Dropdown>
            </ConfigProvider>
        );

        expect(mountContainer.textContent).toContain('Overlay Content');
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

    it('should render a touch-first dialog surface under a mobile provider', () => {
        render(
            <ConfigProvider locale={enUS.design} mountContainer={document.body} mobile>
                <Dropdown overlay={<div>Overlay Content</div>} open>
                    <button type="button">Trigger</button>
                </Dropdown>
            </ConfigProvider>
        );

        const dialog = screen.getByRole('dialog');
        expect(dialog.textContent).toContain('Overlay Content');
        expect(dialog.classList.contains('!univer-bottom-0')).toBe(true);
        expect(screen.getByText(enUS.design.Accessibility.menu)).toBeTruthy();
    });
});
