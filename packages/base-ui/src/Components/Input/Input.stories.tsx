import { Input } from './input';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Components/Input',
    component: Input,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        placeholder: 'Your Content',
        bordered: true,
    },
};

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Playground = {
    args: {},
};
