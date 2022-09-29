import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-preact-pure';
import { render } from '@testing-library/preact';
import { Tab, TabPane } from '..';

Enzyme.configure({ adapter: new Adapter() });

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
