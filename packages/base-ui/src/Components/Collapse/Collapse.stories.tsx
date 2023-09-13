import type { Meta } from '@storybook/react';

import { Collapse, Panel } from './Collapse';

const meta: Meta<typeof Collapse> = {
    title: 'Components / Collapse',
    component: Collapse,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        children: (
            <>
                <Panel header="test">
                    <div>test Collapse</div>
                </Panel>
                <Panel header="test1">
                    <div>test Collapse1</div>
                </Panel>
            </>
        ),
    },
};

export default meta;

export const Playground = {
    args: {},
};
