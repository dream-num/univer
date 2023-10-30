import { fireEvent, render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Checkbox } from '../Checkbox';

describe('Checkbox', () => {
    const component = <Checkbox value="0">text</Checkbox>;

    test('click Checkbox', async () => {
        const { container } = render(component);

        fireEvent.click(container.querySelector('input')!);

        const $input = container.querySelector('input');

        expect($input?.checked).toBe(true);
    });
});
