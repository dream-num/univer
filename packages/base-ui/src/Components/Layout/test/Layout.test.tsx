import { render } from '@testing-library/preact';

import { Layout } from '..';

describe('Container', () => {
    test('should display initial Container', () => {
        const { container } = render(<Layout>container content Text</Layout>);

        expect(container.textContent).toMatch('container content Text');
    });
});
