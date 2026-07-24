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
import { Switch } from '../Switch';

afterEach(cleanup);

describe('Switch', () => {
    afterEach(cleanup);

    it('renders correctly', () => {
        const { container } = render(<Switch />);
        expect(container);
    });

    it('renders the checked', () => {
        const { container } = render(<Switch defaultChecked />);

        const checkboxElement = container.querySelector('[type="checkbox"]')! as HTMLInputElement;

        expect(checkboxElement.checked).toBeTruthy();
    });

    it('change the checked', () => {
        const { container } = render(<Switch defaultChecked />);

        const checkboxElement = container.querySelector('[type="checkbox"]')! as HTMLInputElement;

        checkboxElement.click();

        expect(checkboxElement.checked).toBeFalsy();
    });

    it('keeps the supplied checked value when the parent rejects a change', () => {
        const onChange = vi.fn();
        const { getByRole, rerender } = render(
            <Switch ariaLabel="Show legend" checked onChange={onChange} />
        );
        const checkbox = getByRole('checkbox', { name: 'Show legend' }) as HTMLInputElement;

        fireEvent.click(checkbox);
        expect(onChange).toHaveBeenCalledWith(false);

        rerender(<Switch ariaLabel="Show legend" checked onChange={onChange} />);
        expect(checkbox.checked).toBe(true);
    });

    it('follows delayed controlled commits', () => {
        const onChange = vi.fn();
        const { getByRole, rerender } = render(
            <Switch ariaLabel="Show legend" checked={false} onChange={onChange} />
        );
        const checkbox = getByRole('checkbox', { name: 'Show legend' }) as HTMLInputElement;

        fireEvent.click(checkbox);
        expect(onChange).toHaveBeenCalledWith(true);
        expect(checkbox.checked).toBe(false);

        rerender(<Switch ariaLabel="Show legend" checked onChange={onChange} />);
        expect(checkbox.checked).toBe(true);
    });

    it('does not emit changes when disabled', () => {
        const onChange = vi.fn();
        const { getByRole } = render(
            <Switch ariaLabel="Show legend" checked disabled onChange={onChange} />
        );
        const checkbox = getByRole('checkbox', { name: 'Show legend' });

        fireEvent.click(checkbox);
        expect((checkbox as HTMLInputElement).disabled).toBe(true);
        expect(onChange).not.toHaveBeenCalled();
    });
});
