import type { Meta, StoryObj } from '@storybook/react';

import { SheetNumfmtPanel, SheetNumfmtPanelProps } from '../index';

const meta: Meta = {
    title: 'numfmt',
    component: SheetNumfmtPanel,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const Test: StoryObj<SheetNumfmtPanelProps> = {
    args: {
        initValue: '123',
        initPattern: '',

        onConfirm(pattern) {
            console.log(pattern);
        },
        onCancel() {
            console.log('cancel');
        },
    },
};
