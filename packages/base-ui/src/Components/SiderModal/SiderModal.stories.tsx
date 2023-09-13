import { SiderModal } from './SiderModal';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Components/SiderModal',
    component: SiderModal,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        name: 'sider',
        title: 'test sider modal',
        children: <div>test test</div>,
    },
};

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Playground = {
    args: {},
};
