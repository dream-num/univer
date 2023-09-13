import { fireEvent, render, screen } from '@testing-library/react';

import { Button } from '..';

describe('Button', () => {
    test('renders correctly', () => {
        const { container } = render(
            <Button type="primary" onClick={() => {}}>
                lol
            </Button>
        );
        expect(container);
    });

    test('click onClick function', () => {
        let a = 1;

        render(
            <Button
                onClick={() => {
                    a++;
                }}
            >
                lol
            </Button>
        );

        fireEvent.click(screen.getByText('lol'));

        expect(a).toEqual(2);
    });

    test('should prevent event when button is disabled', () => {
        let a = 1;

        render(
            <Button
                disabled
                onClick={() => {
                    a++;
                }}
            >
                lol
            </Button>
        );

        fireEvent.click(screen.getByText('lol'));

        expect(a).toEqual(1);
    });
});
