import type { Meta, StoryObj } from '@storybook/react';

import { themes } from '../../../.storybook/preview';
import { Palette } from './Palette';

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
