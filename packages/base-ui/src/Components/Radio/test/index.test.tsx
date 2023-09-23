import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Radio, RadioGroup } from '..';

describe('RadioGroup', () => {
    let active = '0';
    const group = (
        <RadioGroup
            active={active}
            onChange={(value) => {
                active = value;
            }}
        >
            <Radio value="0" label="0"></Radio>
            <Radio value="1" label="1"></Radio>
        </RadioGroup>
    );

    test('click Radio', async () => {
        render(group);

        fireEvent.click(screen.getByText('1'));

        expect(active).toBe('1');
    });
});
