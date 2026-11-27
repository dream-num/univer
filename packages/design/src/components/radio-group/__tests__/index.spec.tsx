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
import { Radio } from '../../radio/Radio';
import { RadioGroup } from '../RadioGroup';

afterEach(cleanup);

describe('RadioGroup', () => {
    let active = '0';
    const group = (
        <RadioGroup
            value={active}
            onChange={(value) => {
                active = value as string;
            }}
        >
            <Radio value="0">0</Radio>
            <Radio value="1">1</Radio>
        </RadioGroup>
    );

    it('click Radio', async () => {
        render(group);

        fireEvent.click(screen.getByText('1'));

        expect(active).toBe('1');
    });

    it('assigns a shared name, radiogroup role, and preserves per-item disabled state', () => {
        const onChange = vi.fn();
        render(
            <RadioGroup aria-label="Mode" direction="vertical" value="a" onChange={onChange}>
                <Radio value="a">Option A</Radio>
                <Radio value="b" disabled>Option B</Radio>
            </RadioGroup>
        );

        const groupEl = screen.getByRole('radiogroup', { name: 'Mode' });
        expect(groupEl.getAttribute('aria-orientation')).toBe('vertical');

        const optionA = screen.getByLabelText('Option A') as HTMLInputElement;
        const optionB = screen.getByLabelText('Option B') as HTMLInputElement;
        expect(optionA.name).toBeTruthy();
        expect(optionA.name).toBe(optionB.name);
        expect(optionA.checked).toBe(true);
        expect(optionB.disabled).toBe(true);

        fireEvent.click(optionB);
        expect(onChange).not.toHaveBeenCalled();
    });
});
