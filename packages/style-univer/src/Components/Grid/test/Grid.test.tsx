import { render } from '@testing-library/preact';

import { Grid } from '..';

describe('Grid', () => {
    test('should display initial Container', () => {
        const { container } = render(<Grid>container content Text</Grid>);

        expect(container.textContent).toMatch('container content Text');
    });
});
