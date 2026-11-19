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

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Switch } from '../Switch';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

describe('Switch', () => {
    it('exposes its label and supports changing the setting', () => {
        const onChange = vi.fn();
        const { rerender } = render(<Switch aria-label="Show grid" defaultChecked onChange={onChange} />);
        const checkbox = screen.getByRole('checkbox', { name: 'Show grid' });
        checkbox.focus();
        expect(checkbox).toHaveFocus();
        expect(checkbox).toBeChecked();
        fireEvent.click(checkbox);
        expect(checkbox).not.toBeChecked();
        expect(onChange).toHaveBeenCalledExactlyOnceWith(false);
        rerender(<Switch aria-label="Show grid" defaultChecked={false} onChange={onChange} />);
        rerender(<Switch aria-label="Show grid" defaultChecked onChange={onChange} />);
        expect(checkbox).toBeChecked();
    });

    it('associates the visible label with the setting', () => {
        render(
            <>
                <span id="grid-label">Show grid</span>
                <Switch aria-labelledby="grid-label" />
            </>
        );
        expect(screen.getByRole('checkbox', { name: 'Show grid' })).not.toBeChecked();
    });
});
