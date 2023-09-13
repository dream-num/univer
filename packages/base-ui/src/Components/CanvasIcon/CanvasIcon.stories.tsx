import type { Meta } from '@storybook/react';

import { CanvasIcon } from './CanvasIcon';

const meta: Meta<typeof CanvasIcon> = {
    title: 'Components / CanvasIcon',
    component: CanvasIcon,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        width: '100',
        height: '100',
        type: 'DASH_DOT',
        hv: 'h',
        mSt: 0,
        mEd: 5,
        lineSt: 100,
        lineEd: 5,
    },
};

export default meta;

export const Playground = {
    args: {},
};
