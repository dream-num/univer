import { fireEvent, render } from '@testing-library/react';

import { Input } from '..';

describe('input', () => {
    test('input', () => {
        const { container } = render(<Input value="test" readonly disabled placeholder="haha" bordered />);
        expect(container);
    });
    test('input event', () => {
        let a = 1;
        const { container } = render(<Input value="test" readonly onClick={() => a++} disabled placeholder="haha" className="test" />);
        fireEvent.click(document.querySelector('.test')!);
        expect(a).toEqual(2);
    });
    test('input focue', () => {
        let a = 1;
        const { container } = render(<Input value="test" readonly onBlur={() => a++} disabled placeholder="haha" className="test" />);
        fireEvent.blur(document.querySelector('.test')!);
        expect(a).toEqual(2);
    });
    test('input blur', () => {
        let a = 1;
        const { container } = render(<Input value="test" readonly onFocus={() => a++} disabled placeholder="haha" className="test" />);
        fireEvent.focus(document.querySelector('.test')!);
        expect(a).toEqual(2);
    });
    test('input change', () => {
        let a = 1;
        const { container } = render(<Input value="test" readonly onChange={() => a++} disabled placeholder="haha" className="test" />);
        fireEvent.change(document.querySelector('.test')!);
        expect(a).toEqual(2);
    });
});
