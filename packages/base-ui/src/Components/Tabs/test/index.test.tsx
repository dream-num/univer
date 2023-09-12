import { render } from '@testing-library/react';

import { Tab, TabPane } from '..';

describe('tab', () => {
    test('tab', () => {
        const { container } = render(
            <Tab activeKey="tab" type="card">
                <TabPane tab="tab1" keys="tab">
                    test tab
                </TabPane>
                <TabPane tab="tab2" keys="tabs">
                    test tabs
                </TabPane>
            </Tab>
        );

        expect(container);
    });
});
