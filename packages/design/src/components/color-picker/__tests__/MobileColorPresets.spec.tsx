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
import { MobileColorPresets } from '../MobileColorPresets';
import { colorPresets } from '../presets';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

describe('MobileColorPresets', () => {
    it('renders large preset targets and applies the selected color', () => {
        const onSelect = vi.fn();
        const { container } = render(<MobileColorPresets value="#FFFFFF" onSelect={onSelect} />);
        const buttons = container.querySelectorAll('button');

        expect(buttons[0]).toHaveAttribute('aria-pressed', 'true');

        fireEvent.click(buttons[1]);
        expect(onSelect).toHaveBeenCalledWith(colorPresets.flat()[1]);
    });
});
