import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Layout } from '..';

describe('Container', () => {
    test('should display initial Container', () => {
        const { container } = render(<Layout>container content Text</Layout>);

        expect(container.textContent).toMatch('container content Text');
    });
});
