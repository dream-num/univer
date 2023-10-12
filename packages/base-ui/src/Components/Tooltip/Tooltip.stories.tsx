import type { Meta } from '@storybook/react';

import { Button } from '../Button/Button';
import { Tooltip } from './Tooltip';

const meta: Meta<typeof Tooltip> = {
    title: 'Components / Tooltip',
    component: Tooltip,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        children: <div>test</div>,
        title: 'test tooltip',
    },
};

export default meta;

export const Playground = {
    render() {
        return (
            <>
                <div>
                    <Tooltip title="hello world" placement="top">
                        <Button>top</Button>
                    </Tooltip>
                </div>
                <div>
                    <Tooltip title="hello world" placement="bottom">
                        <Button>bottom</Button>
                    </Tooltip>
                </div>
            </>
        );
    },
};
