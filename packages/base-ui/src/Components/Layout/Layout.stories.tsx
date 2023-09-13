import { Layout } from './Layout';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Components/Layout',
    component: Layout,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        children: <div>test layout</div>,
    },
};

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Playground = {
    args: {},
};
