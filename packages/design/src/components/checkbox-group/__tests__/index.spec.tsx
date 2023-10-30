import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Checkbox } from '../../checkbox/Checkbox';
import { CheckboxGroup } from '../CheckboxGroup';

describe('CheckboxGroup', () => {
    let active = ['0'];
    const group = (
        <CheckboxGroup
            value={active}
            onChange={(value) => {
                active = value as string[];
            }}
        >
            <Checkbox value="0">0</Checkbox>
            <Checkbox value="1">1</Checkbox>
        </CheckboxGroup>
    );

    test('click Checkbox', async () => {
        render(group);

        fireEvent.click(screen.getByText('1'));

        expect(active).toEqual(['0', '1']);
    });
});
