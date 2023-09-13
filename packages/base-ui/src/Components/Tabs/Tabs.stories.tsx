import { Tab, TabPane } from './Tabs';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Components/Tab',
    component: Tab,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        children: (
            <>
                <TabPane tab="test">
                    <div>test</div>
                </TabPane>
                <TabPane tab="test1">
                    <div>test1</div>
                </TabPane>
            </>
        ),
    },
};

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Playground = {
    args: {},
};
