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
        children: (
            <>
                <TabPane tab="test">
                    <div>test</div>
                </TabPane>
                <TabPane tab="test1">
                    <div>test1</div>
                </TabPane>
            </>
        ),
    },
};

export default meta;

export const Playground = {
    args: {},
};
