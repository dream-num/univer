import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

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
});
