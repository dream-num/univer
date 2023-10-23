import type { Meta } from '@storybook/react';

import { Button } from '../Button/Button';
import { Dropdown2 } from './Dropdown2';

const meta: Meta<typeof Dropdown2> = {
    title: 'Components / Dropdown',
    component: Dropdown2,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const Playground = {
    render() {
        return (
            <Dropdown2 overlay={<div>overlay</div>}>
                <Button>Basic</Button>
            </Dropdown2>
        );
    },
};
