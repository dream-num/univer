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
import { DateRangePicker } from '../DateRangePicker';
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
        const testId = props.max ? 'mock-calendar-start' : 'mock-calendar-end';
        const nextDate = props.max
            ? new Date('2026-02-15T00:00:00.000Z')
            : new Date('2026-02-03T00:00:00.000Z');

        return (
            <button
                type="button"
                data-testid={testId}
                onClick={() => props.onValueChange?.(nextDate)}
            >
                {testId}
            </button>
        );
    },
}));

afterEach(() => {
    cleanup();
    calendarPropsHistory.length = 0;
});

describe('DateRangePicker', () => {
    it('should render values, pass min/max and normalize start/end order', () => {
        const onValueChange = vi.fn();
        const value = [
            new Date('2026-02-10T00:00:00.000Z'),
            new Date('2026-02-01T00:00:00.000Z'),
        ] as [Date, Date];

        render(<DateRangePicker value={value} onValueChange={onValueChange} />);

        expect(screen.getByText('2026-02-10')).toBeInTheDocument();
        expect(screen.getByText('2026-02-01')).toBeInTheDocument();

        expect(calendarPropsHistory[0].value).toEqual(value[0]);
        expect(calendarPropsHistory[0].max).toEqual(value[1]);
        expect(calendarPropsHistory[1].value).toEqual(value[1]);
        expect(calendarPropsHistory[1].min).toEqual(value[0]);

        fireEvent.click(screen.getByTestId('mock-dropdown-toggle'));
        expect(screen.getByTestId('mock-dropdown')).toHaveAttribute('data-open', 'true');

        fireEvent.click(screen.getByTestId('mock-calendar-start'));

        expect(onValueChange).toHaveBeenCalledWith([
            new Date('2026-02-01T00:00:00.000Z'),
            new Date('2026-02-15T00:00:00.000Z'),
        ]);
        expect(screen.getByTestId('mock-dropdown')).toHaveAttribute('data-open', 'false');
    });
});
