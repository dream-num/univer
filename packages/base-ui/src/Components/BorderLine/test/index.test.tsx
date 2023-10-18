import 'vitest-canvas-mock';

import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { BorderDashDot } from '../BorderLine';

describe('BorderLine', () => {
    test('renders BorderDashDot', () => {
        const { container } = render(<BorderDashDot />);

        expect(container).toMatchSnapshot();
    });
});
