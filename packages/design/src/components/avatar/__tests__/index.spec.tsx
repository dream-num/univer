import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Avatar } from '../Avatar';

describe('Avatar', () => {
    test('renders correctly', () => {
        const { container } = render(<Avatar size="small">Jane Doe</Avatar>);
        expect(container);
    });

    test('renders the children', () => {
        const { getByText } = render(<Avatar>Test</Avatar>);
        const childrenElement = getByText('Test');
        expect(childrenElement).not.toBeNull();
    });
});
