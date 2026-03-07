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
import { DatePicker } from '../DatePicker';
import '@testing-library/jest-dom/vitest';

const { calendarPropsHistory } = vi.hoisted(() => ({
    calendarPropsHistory: [] as any[],
}));

vi.mock('../../dropdown/Dropdown', () => ({
    Dropdown: (props: any) => (
        <div data-testid="mock-dropdown" data-open={String(props.open)}>
            <button
                type="button"
                data-testid="mock-dropdown-toggle"
                onClick={() => props.onOpenChange?.(!props.open)}
            >
                toggle
            </button>
            <div data-testid="mock-dropdown-overlay">{props.overlay}</div>
            {props.children}
        </div>
    ),
}));

vi.mock('../../calendar/Calendar', () => ({
    Calendar: (props: any) => {
        calendarPropsHistory.push(props);
        return (
            <button
                type="button"
                data-testid="mock-calendar-select"
                onClick={() => props.onValueChange?.(new Date('2026-01-02T00:00:00.000Z'))}
            >
                select-date
            </button>
        );
    },
}));

afterEach(() => {
    cleanup();
    calendarPropsHistory.length = 0;
});

describe('DatePicker', () => {
    it('should render value, open dropdown and emit value change', () => {
        const onValueChange = vi.fn();
        const value = new Date('2026-01-01T00:00:00.000Z');

        render(
            <DatePicker
                value={value}
                className="custom-date-picker"
                onValueChange={onValueChange}
            />
        );

        expect(screen.getByText('2026-01-01')).toBeInTheDocument();
        expect(calendarPropsHistory[0].value).toEqual(value);

        fireEvent.click(screen.getByTestId('mock-dropdown-toggle'));
        expect(screen.getByTestId('mock-dropdown')).toHaveAttribute('data-open', 'true');

        fireEvent.click(screen.getByTestId('mock-calendar-select'));
        expect(onValueChange).toHaveBeenCalledWith(new Date('2026-01-02T00:00:00.000Z'));
        expect(screen.getByTestId('mock-dropdown')).toHaveAttribute('data-open', 'false');

        const dateButton = screen.getByText('2026-01-01').closest('button') as HTMLButtonElement;
        expect(dateButton.className).toContain('custom-date-picker');
    });
});
