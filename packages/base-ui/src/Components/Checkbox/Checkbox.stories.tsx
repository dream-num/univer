import { Checkbox } from './Checkbox';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Components/Checkbox',
    component: Checkbox,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {},
};

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Playground = {
    args: {},
};
