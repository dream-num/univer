import { fireEvent, render } from '@testing-library/react';
import React, { useState } from 'react';
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

        let result = ['0'];
        function Demo() {
            const [active, setActive] = useState(result);

            return (
                <CheckboxGroup
                    value={active}
                    onChange={(value) => {
                        setActive(value as string[]);
                        result = value as string[];
                    }}
                >
                    <Checkbox value="0">x</Checkbox>
                    <Checkbox value="1">y</Checkbox>
                </CheckboxGroup>
            );
        }

        const { getByText } = render(<Demo />);

        fireEvent.click(getByText('y'));
        fireEvent.click(getByText('y'));
        fireEvent.click(getByText('y'));

        expect(result).toEqual(['0', '1']);
    });
});
