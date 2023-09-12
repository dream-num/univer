import { Collapse, Panel } from './Collapse';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Components/Collapse',
    component: Collapse,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        children: (
            <>
                <Panel header="test">
                    <div>test Collapse</div>
                </Panel>
                <Panel header="test1">
                    <div>test Collapse1</div>
                </Panel>
            </>
        ),
    },
};

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Playground = {
    args: {},
};
