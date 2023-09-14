import { fireEvent, render, screen } from '@testing-library/react';

import { Slider } from '../Slider';

describe('Slider', () => {
    test('renders correctly', () => {
        const { container } = render(<Slider min={0} max={50}></Slider>);
        expect(container);
    });

    test('click onClick function', () => {
        let a = 1;

        render(
            <Slider
                id={'test'}
                onClick={() => {
                    a++;
                }}
            ></Slider>
        );

        fireEvent.click(screen.getByRole('slider-group'));

        expect(a).toEqual(2);
    });
});
