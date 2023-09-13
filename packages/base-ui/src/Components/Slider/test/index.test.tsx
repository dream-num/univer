import { render } from '@testing-library/react';

import { Slider } from '..';

describe('input', () => {
    test('input', () => {
        const { container } = render(<Slider value={2} min={10} max={200} step={1} className="slider" style={{ color: 'red' }} />);

        expect(container);
    });
});
