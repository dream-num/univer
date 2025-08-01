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

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import { ConfigProvider } from '../../config-provider/ConfigProvider';
import { Calendar } from '../Calendar';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

describe('Calendar', () => {
    const onChange = vi.fn();

    function renderCalendar(props = {}) {
        const date = new Date(2023, 7, 15);
        return render(
            <ConfigProvider mountContainer={null} locale={{ Calendar: enUS.design.Calendar }}>
                <Calendar value={date} onValueChange={onChange} {...props} />
            </ConfigProvider>
        );
    }

    it('should render calendar with correct year, month and day', () => {
        const { getByText } = renderCalendar();
        expect(getByText('2023')).toBeInTheDocument();
        // August
        expect(getByText(enUS.design.Calendar.months[7])).toBeInTheDocument();
        // 15th
        expect(getByText('15')).toBeInTheDocument();
    });

    it('should call onValueChange when a day is clicked', () => {
        const { getByText } = renderCalendar();
        getByText('20').click();
        expect(onChange).toHaveBeenCalled();
        const calledDate = onChange.mock.calls[0][0];
        expect(calledDate.getFullYear()).toBe(2023);
        expect(calledDate.getMonth()).toBe(7);
        expect(calledDate.getDate()).toBe(20);
    });

    it('should show TimeInput when showTime is true', () => {
        const { container } = renderCalendar({ showTime: true });
        expect(container.querySelector('[data-u-comp="time-input"]')).toBeInTheDocument();
    });

    it('should highlight today and selected day', () => {
        const { getByText } = renderCalendar();
        // 15th is selected
        expect(getByText('15').className).toMatch(/univer-bg-primary-600/);
    });
});
