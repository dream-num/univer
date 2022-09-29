import { render } from '@testing-library/preact';

import { Demo } from '..';

describe('Demo', () => {
    test('should display initial Demo', () => {
        const { container } = render(<Demo>container content Text</Demo>);

        expect(container.textContent).toMatch('container content Text');
    });
});
