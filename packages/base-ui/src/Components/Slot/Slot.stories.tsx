import { Slot } from './Slot';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Components/Slot',
    component: Slot,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        name: 'main',
    },
};

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Playground = {
    args: {},
};
