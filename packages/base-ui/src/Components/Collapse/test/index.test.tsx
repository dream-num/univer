// test Collapse

import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Collapse } from '../Collapse';

describe('Collapse', () => {
    test('renders correctly', () => {
        const { container } = render(<Collapse header="Collapse Header">Collapse Content</Collapse>);
        expect(container);
    });
});
