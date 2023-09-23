import { fireEvent, render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Input } from '..';

describe('input', () => {
    test('render', () => {
        const { container } = render(<Input value="test" readonly disabled placeholder="haha" bordered />);
        expect(container);
    });

    test('input event', () => {
        const { container } = render(<Input value="test" placeholder="haha" bordered />);
        const input = container.querySelector('input');
        fireEvent.input(input!, { target: { value: '23' } });
        expect(input!.value).toBe('23');
    });

    test('click event', () => {
        let a = 1;
        const { container } = render(<Input value="test" readonly onClick={() => a++} placeholder="haha" />);
        fireEvent.click(container.querySelector('input')!);
        expect(a).toEqual(2);
    });

    test('blur event', () => {
        let a = 1;
        const { container } = render(<Input value="test" readonly onBlur={() => a++} disabled placeholder="haha" />);
        fireEvent.blur(container.querySelector('input')!);
        expect(a).toEqual(2);
    });

    test('focus event', () => {
        let a = 1;
        const { container } = render(
            <Input value="test" readonly onFocus={() => a++} disabled placeholder="haha" className="test" />
        );
        fireEvent.focus(container.querySelector('input')!);
        expect(a).toEqual(2);
    });

    test('change event', () => {
        let a = 1;
        const { container } = render(<Input value="test" onChange={() => a++} placeholder="haha" className="test" />);
        const input = container.querySelector('input');
        fireEvent.change(input!, { target: { value: 'new value' } });
        expect(a).toEqual(2);
    });
});
