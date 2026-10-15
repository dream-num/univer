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
import enUS from '../../../locale/en-US';
import { ConfigProvider } from '../../config-provider/ConfigProvider';
import { MobileSelect } from '../MobileSelect';
import '@testing-library/jest-dom/vitest';

const options = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3', disabled: true },
    { label: 'Group', options: [
        { label: 'G1', value: 'g1' },
        { label: 'G2', value: 'g2' },
    ] },
];

afterEach(cleanup);

describe('MobileSelect', () => {
    it('should render mobile options in a touch-first dialog explicitly', () => {
        const handleChange = vi.fn();
        render(
            <ConfigProvider locale={enUS.design} mountContainer={document.body}>
                <MobileSelect aria-label="Choice" value="1" options={options} onChange={handleChange} />
            </ConfigProvider>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Choice' }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Option 2'));
        expect(handleChange).toHaveBeenCalledExactlyOnceWith('2');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('does not open a disabled mobile select', () => {
        const onChange = vi.fn();
        render(<MobileSelect value="1" options={options} disabled onChange={onChange} />);
        const trigger = screen.getByRole('button', { name: 'Option 1' });
        expect(trigger).toBeDisabled();
        fireEvent.click(trigger);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(onChange).not.toHaveBeenCalled();
    });

    it('should fall back to the mobile select value when its option label is empty', () => {
        render(<MobileSelect value="fallback" options={[{ label: '', value: 'fallback' }]} onChange={() => {}} />);

        expect(screen.getByText('fallback')).toBeInTheDocument();
    });
});
