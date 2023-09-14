import type { Meta } from '@storybook/react';

import { Input } from '../Input';
import { Dropdown } from './Dropdown';

const meta: Meta<typeof Dropdown> = {
    title: 'Components / Dropdown',
    component: Dropdown,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        children: <Input type="number" value="test"></Input>,
        menu: {
            menu: [
                {
                    label: 'test',
                    value: 'test',
                    show: true,
                },
                {
                    label: 'test1',
                    value: 'test1',
                    show: true,
                },
            ],
        },
    },
};

export default meta;

export const Playground = {
    args: {},
};
