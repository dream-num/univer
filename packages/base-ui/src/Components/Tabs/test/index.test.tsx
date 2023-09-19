import { fireEvent, render, screen } from '@testing-library/react';

import { TabPane, Tabs } from '..';

describe('tab', () => {
    test('tab render', () => {
        const { container } = render(
            <Tabs activeKey="tab" type="card">
                <TabPane label="tab1" keys="tab">
                    test tab
                </TabPane>
                <TabPane label="tab2" keys="tabs">
                    test tabs
                </TabPane>
            </Tabs>
        );

        expect(container);
    });

    test('click onTabClick function', () => {
        let a = 1;

        render(
            <Tabs activeKey="tab" type="card" onTabClick={() => a++}>
                <TabPane label="tab1" keys="tab">
                    test tab
                </TabPane>
                <TabPane label="tab2" keys="tabs">
                    test tabs
                </TabPane>
            </Tabs>
        );

        fireEvent.click(screen.getByText('tab1'));

        expect(a).toEqual(2);
    });
});
