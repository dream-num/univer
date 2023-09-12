import { Separator } from './Separator';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Components/Separator',
    component: Separator,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        mode: false,
    },
};

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Playground = {
    args: {},
};
