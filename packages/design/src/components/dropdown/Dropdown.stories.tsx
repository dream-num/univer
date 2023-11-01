import type { Meta } from '@storybook/react';

import { Button } from '../button/Button';
import { Dropdown } from './Dropdown';

const meta: Meta<typeof Dropdown> = {
    title: 'Components / Dropdown',
    component: Dropdown,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const Playground = {
    render() {
        return (
            <Dropdown overlay={<div>overlay</div>}>
                <Button>Basic</Button>
            </Dropdown>
        );
    },
};
