import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Container } from '..';

describe('Container', () => {
    test('should display initial Container', () => {
        const { container } = render(<Container>container content Text</Container>);

        expect(container.textContent).toMatch('container content Text');
    });
});
