import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, test } from 'vitest';

import { Radio } from '../Radio';

describe('Radio', () => {
    const component = <Radio value="0">text</Radio>;

    test('click Radio', async () => {
        const { container } = render(component);

        fireEvent.click(container.querySelector('input')!);

        const $input = container.querySelector('input');

        expect($input?.checked).toBe(true);
    });
});
