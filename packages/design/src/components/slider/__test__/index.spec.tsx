/**
 * Copyright 2023-present DreamNum Inc.
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

import { fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { Slider } from '../Slider';

describe('Slider', () => {
    it('renders correctly', () => {
        const { container } = render(<Slider min={0} max={100} value={90} />);
        expect(container);
    });

    it('renders correctly with resetPoint', () => {
        let value = 90;

        function handleChange(point: number) {
            value = point;
        }

        const { container } = render(<Slider value={value} resetPoint={30} onChange={handleChange} />);

        fireEvent.click(container.querySelector('[role=button]')!);

        expect(value).toBe(30);
    });

    it('renders correctly with steps', () => {
        let result = 10;
        function Demo() {
            const [value, setValue] = useState(result);

            function handleChange(point: number) {
                setValue(point);
                result = point;
            }

            return <Slider max={20} value={value} onChange={handleChange} />;
        }

        const { container } = render(<Demo />);

        const [prev, next] = container.querySelectorAll('button');

        fireEvent.click(prev);
        fireEvent.click(prev);
        fireEvent.click(next);
        fireEvent.click(next);
        fireEvent.click(next);

        expect(result).toBe(20);
    });

    it('renders correctly with shortcuts', () => {
        let result = 10;
        function Demo() {
            const [value, setValue] = useState(result);

            function handleChange(point: number) {
                setValue(point);
                result = point;
            }

            return <Slider value={value} shortcuts={[10, 50]} onChange={handleChange} />;
        }

        const { container } = render(<Demo />);

        fireEvent.click(screen.getByText('10%'));
        fireEvent.click(screen.getByText('50%'));

        expect(result).toBe(50);
    });
});
