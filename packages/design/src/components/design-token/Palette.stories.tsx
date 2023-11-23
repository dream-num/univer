import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { defaultTheme, greenTheme } from '../../themes';
import { Palette } from './Palette';

const themes: Record<string, Record<string, string>> = {
    default: defaultTheme,
    green: greenTheme,
};

const meta: Meta = {
    title: 'Design / Design Token',
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {},
};

export default meta;

export const Playground: StoryObj = {
    render: (_, context) => <Palette theme={themes[context.globals.theme]} />,
};
