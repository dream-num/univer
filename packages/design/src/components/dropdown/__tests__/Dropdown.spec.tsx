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

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Dropdown } from '../Dropdown';

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('Dropdown positioning', () => {
    it.each([
        { customAnchor: true, expectedLeft: 160 },
        { customAnchor: false, expectedLeft: 236 },
    ])('aligns to the selected anchor (customAnchor=$customAnchor)', async ({ customAnchor, expectedLeft }) => {
        vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function getRect(this: HTMLElement) {
            if (this.getAttribute('data-testid') === 'name-box') {
                return new DOMRect(160, 60, 96, 24);
            }
            if (this.tagName === 'BUTTON') {
                return new DOMRect(236, 60, 20, 24);
            }
            return new DOMRect();
        });

        const anchorRef = createRef<HTMLDivElement>();
        render(
            <div ref={anchorRef} data-testid="name-box">
                <input aria-label="Name box" />
                <Dropdown
                    anchorRef={customAnchor ? anchorRef : undefined}
                    align="start"
                    avoidCollisions={false}
                    overlay={<div>Named ranges</div>}
                    open
                >
                    <button type="button">Open named ranges</button>
                </Dropdown>
            </div>
        );

        await waitFor(() => {
            const positioner = screen.getByText('Named ranges').closest('[data-radix-popper-content-wrapper]');
            expect(positioner?.getAttribute('style')).toContain(`translate(${expectedLeft}px, 88px)`);
        });
    });
});
