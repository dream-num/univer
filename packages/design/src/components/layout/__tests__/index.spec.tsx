import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Layout } from '../Layout';

describe('Layout', () => {
    test('should display initial Layout', () => {
        const { container } = render(<Layout>layout content Text</Layout>);

        expect(container.textContent).toMatch('layout content Text');
    });
});
