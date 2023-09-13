import { ResizeDialog } from './ResizeDialog';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Components/ResizeDialog',
    component: ResizeDialog,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        left: 20,
        top: 20,
        width: 20,
        height: 20,
        children: <div>test ResizeDialog</div>,
        ratio: 1,
    },
};

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Playground = {
    args: {},
};
