import type { Meta } from '@storybook/react';

import { Radio } from './Radio';

const meta: Meta<typeof Radio> = {
    title: 'Components / Radio',
    component: Radio,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const RadioBasic = {
    render() {
        return <Radio>radio 1</Radio>;
    },
};

export const RadioDisabled = {
    render() {
        return (
            <>
                <Radio disabled>radio 1</Radio>
                <Radio disabled checked>
                    radio 2
                </Radio>
            </>
        );
    },
};
