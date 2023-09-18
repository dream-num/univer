import type { Meta } from '@storybook/react';

import { Tab, TabPane } from './Tabs';

const meta: Meta<typeof Tab> = {
    title: 'Components / Tabs',
    component: Tab,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        children: [
            <TabPane label="test" keys="test" active>
                <div>test content</div>
            </TabPane>,
            <TabPane label="test1" keys="test1">
                <div>test1 content</div>
            </TabPane>,
        ],
        activeKey: 'test1',
    },
};

export default meta;

export const Playground = {
    args: {},
};
