import { Confirm } from './Confirm';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Components/Confirm',
    component: Confirm,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        color: '#abcdef',
    },
};

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Playground = {
    args: {},
};
