import Drag from './Drag';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Components/Drag',
    component: Drag,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        isDrag: true,
        children: <div>test drag</div>,
    },
};

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Playground = {
    args: {},
};
