import { fireEvent, render, screen } from '@testing-library/react';

import { Button } from '..';

describe('Button', () => {
    test('should display initial Button', () => {
        const { container } = render(
            <Button type="text" onClick={() => {}}>
                哈哈
            </Button>
        );
        expect(container);
    });
    test('click onSwitch function', async () => {
        let a = 1;

        render(
            <Button
                type="text"
                onClick={() => {
                    a++;
                }}
            >
                哈哈
            </Button>
        );

        fireEvent.click(screen.getByText('哈哈'));

        expect(a).toEqual(2);
    });
});
