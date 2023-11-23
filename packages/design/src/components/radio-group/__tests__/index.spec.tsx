import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, test } from 'vitest';

import { Radio } from '../../radio/Radio';
import { RadioGroup } from '../RadioGroup';

describe('RadioGroup', () => {
    let active = '0';
    const group = (
        <RadioGroup
            value={active}
            onChange={(value) => {
                active = value as string;
            }}
        >
            <Radio value="0">0</Radio>
            <Radio value="1">1</Radio>
        </RadioGroup>
    );

    test('click Radio', async () => {
        render(group);

        fireEvent.click(screen.getByText('1'));

        expect(active).toBe('1');
    });
});
