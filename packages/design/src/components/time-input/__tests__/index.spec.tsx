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
import dayjs from 'dayjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TimeInput } from '../TimeInput';
import '@testing-library/jest-dom/vitest';

describe('TimeInput', () => {
    afterEach(cleanup);

    it('should render with current value and custom class', () => {
        const value = new Date('2024-01-01T01:02:03.000Z');
        const { container, getByDisplayValue } = render(<TimeInput value={value} className="custom-time" />);
        const expected = dayjs(value).format('HH:mm:ss');

        expect(container.querySelector('[data-u-comp="time-input"]')).toBeInTheDocument();
        expect(container.querySelector('.custom-time')).toBeInTheDocument();
        expect(getByDisplayValue(expected)).toBeInTheDocument();
    });

    it('should emit changed date when time input changes', () => {
        const onValueChange = vi.fn();
        const value = new Date('2024-01-01T00:00:00.000Z');
        const { container } = render(<TimeInput value={value} onValueChange={onValueChange} />);

        const input = container.querySelector('input[type="time"]') as HTMLInputElement;
        expect(input).toBeInTheDocument();
        fireEvent.change(input, { target: { value: '12:34:56' } });

        expect(onValueChange).toHaveBeenCalledTimes(1);
        const changed = onValueChange.mock.calls[0][0] as Date;
        expect(changed.getHours()).toBe(12);
        expect(changed.getMinutes()).toBe(34);
        expect(changed.getSeconds()).toBe(56);
    });
});
