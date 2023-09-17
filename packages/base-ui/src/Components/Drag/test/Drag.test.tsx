import { render } from '@testing-library/react';

import { Drag } from '../Drag';

describe('Drag', () => {
    test('should display initial Drag', () => {
        const { container } = render(<Drag>drag content text</Drag>);

        expect(container.textContent).toMatch('drag content text');
    });
});
