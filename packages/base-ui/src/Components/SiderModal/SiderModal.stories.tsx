import type { Meta } from '@storybook/react';

import { SiderModal } from './SiderModal';

const meta: Meta<typeof SiderModal> = {
    title: 'Components / SiderModal',
    component: SiderModal,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        name: 'sider',
        title: 'test sider modal',
        children: <div>test test</div>,
    },
};

export default meta;

export const Playground = {
    args: {},
};
