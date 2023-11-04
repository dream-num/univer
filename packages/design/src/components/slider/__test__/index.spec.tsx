import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Slider } from '../Slider';

describe('Slider', () => {
    test('renders correctly', () => {
        const { container } = render(<Slider min={0} max={100} value={90} />);
        expect(container);
    });
});
