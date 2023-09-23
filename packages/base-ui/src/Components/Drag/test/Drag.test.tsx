import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Drag } from '../Drag';

describe('Drag', () => {
    test('should display initial Drag', () => {
        const { container } = render(<Drag>drag content text</Drag>);

        expect(container.textContent).toMatch('drag content text');
    });
});
