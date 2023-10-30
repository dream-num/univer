import type { Meta } from '@storybook/react';

import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
    title: 'Components / Checkbox',
    component: Checkbox,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const CheckboxBasic = {
    render() {
        return <Checkbox value="c0">checkbox 1</Checkbox>;
    },
};

export const CheckboxDisabled = {
    render() {
        return (
            <>
                <Checkbox value="c1" disabled>
                    checkbox 1
                </Checkbox>
                <Checkbox value="c2" disabled checked>
                    checkbox 2
                </Checkbox>
            </>
        );
    },
};
