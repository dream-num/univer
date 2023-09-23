import { fireEvent, render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { InputNumber } from '../InputNumber';

describe('input number', () => {
    test('render', () => {
        const { container } = render(<InputNumber value={0} />);
        expect(container);
    });

    test('min max', () => {
        const { container } = render(<InputNumber value={0} min={0} max={5} />);
        const input = container.querySelector('input') as HTMLInputElement;
        const buttonAddition = container?.querySelectorAll('button')[0];
        const buttonSubtraction = container?.querySelectorAll('button')[1];

        // buttonAddition clicked 10 times
        for (let i = 0; i < 10; i++) {
            fireEvent.click(buttonAddition!);
        }

        // Test the value of the input
        expect(input!.value).toBe('5');

        // buttonSubtraction click 10 times
        for (let i = 0; i < 10; i++) {
            fireEvent.click(buttonSubtraction!);
        }

        // Test the value of the input
        expect(input!.value).toBe('0');
    });

    test('input/change event', () => {
        const { container } = render(<InputNumber value={0} />);
        const input = container.querySelector('input');
        fireEvent.input(input!, { target: { value: 1 } });
        expect(input!.value).toBe('1');
        fireEvent.change(input!, { target: { value: 2 } });
        expect(input!.value).toBe('2');
    });

    test('blur event', () => {
        let a = 1;
        const { container } = render(<InputNumber value={0} onBlur={() => a++} disabled />);
        fireEvent.click(container.querySelector('input')!);
        fireEvent.blur(container.querySelector('input')!);
        expect(a).toEqual(2);
    });

    test('press enter event', () => {
        let a = 0;
        const { container } = render(
            <InputNumber
                value={1}
                onPressEnter={(v) => {
                    a = v;
                }}
            />
        );
        const input = container.querySelector('input');
        fireEvent.keyUp(input!, {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            charCode: 13,
        });
        expect(a).toEqual(1);
    });
});
