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

// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { MobileZoomIndicator } from '../mobile-zoom-indicator';

describe('MobileZoomIndicator', () => {
    afterEach(() => {
        vi.useRealTimers();
        document.body.replaceChildren();
    });

    it('shows the current percentage and fades after the gesture ends', () => {
        vi.useFakeTimers();
        const container = document.createElement('div');
        const canvas = document.createElement('canvas');
        const indicator = new MobileZoomIndicator(canvas);

        expect(container.children).toHaveLength(0);
        container.appendChild(canvas);
        document.body.appendChild(container);
        indicator.show(125);
        const element = container.querySelector('div');
        expect(element?.textContent).toBe('125%');
        expect((element as HTMLElement).style.opacity).toBe('1');

        indicator.hide();
        vi.advanceTimersByTime(300);
        expect((element as HTMLElement).style.opacity).toBe('0');

        indicator.dispose();
        expect(container.querySelector('div')).toBeNull();
    });
});
