import { fireEvent, render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Slider } from '../Slider';

describe('Slider', () => {
    test('renders correctly', () => {
        const { container } = render(<Slider min={0} max={50}></Slider>);
        expect(container);
    });

    test('click onClick function', () => {
        let a = 1;

        const { container } = render(
            <Slider
                id={'test'}
                onClick={() => {
                    a++;
                }}
            />
        );

        fireEvent.click(container.querySelector('[role=slider-group]')!);

        expect(a).toEqual(2);
    });

    test('test change event', () => {
        let a = 1;
        const { container } = render(<Slider onChange={() => a++} />);
        const slider = container.querySelector('[role=slider-group]')!;
        const input = slider.querySelector('input');
        fireEvent.input(input!);
        expect(a).toEqual(2);
    });
});
