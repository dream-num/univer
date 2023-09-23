import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Checkbox } from '..';

describe('checkbox', () => {
    test('checkbox', () => {
        const { container } = render(
            <Checkbox value={`Header`} checked={true}>
                foo
            </Checkbox>
        );
        expect(container);
    });
});
