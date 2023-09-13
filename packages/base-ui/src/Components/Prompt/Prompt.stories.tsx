import { Prompt } from './Prompt';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Components/Prompt',
    component: Prompt,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        title: 'test',
        content: 'test prompt',
    },
};

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Playground = {
    args: {},
};
