import type { Meta } from '@storybook/react';

import { Button } from '../button/Button';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
    title: 'Components / Divider',
    component: Divider,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const Playground = {
    render() {
        return (
            <div style={{ display: 'flex' }}>
                <Button>Button 1</Button>
                <Divider length={16} />
                <Button>Button 2</Button>
            </div>
        );
    },
};
