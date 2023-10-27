import { fireEvent, render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Button } from '../Button';

describe('Button', () => {
    test('renders correctly', () => {
        const { container } = render(<Button type="primary">btn1</Button>);
        expect(container);
    });

    test('click onClick function', () => {
        let a = 1;

        const { container } = render(
            <Button
                onClick={() => {
                    a++;
                }}
            >
                btn2
            </Button>
        );

        fireEvent.click(container.querySelector('button')!);

        expect(a).toEqual(2);
    });

    test('should prevent event when button is disabled', () => {
        let a = 1;

        const { container } = render(
            <Button
                disabled
                onClick={() => {
                    a++;
                }}
            >
                btn3
            </Button>
        );

        fireEvent.click(container.querySelector('button')!);

        expect(a).toEqual(1);
    });
});
