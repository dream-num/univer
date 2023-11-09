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
        value: { defaultPattern: '', defaultValue: 123123 },
        onChange(pattern) {
            console.log(pattern);
        },
    },
};
