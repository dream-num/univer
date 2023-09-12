import { Item } from './Item';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Components/Item',
    component: Item,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        selected: true,
        border: true,
    },
};

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Playground = {
    args: {},
};
