import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, test } from 'vitest';

import { Slider } from '../Slider';

describe('Slider', () => {
    test('renders correctly', () => {
        const { container } = render(<Slider min={0} max={100} value={90} />);
        expect(container);
    });

    test('renders correctly with resetPoint', () => {
        let value = 90;

        function handleChange(point: number) {
            value = point;
        }

        const { container } = render(<Slider value={value} resetPoint={30} onChange={handleChange} />);

        fireEvent.click(container.querySelector('[role=reset button]')!);

        expect(value).toBe(30);
    });

    test('renders correctly with steps', () => {
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

    test('renders correctly with shortcuts', () => {
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
