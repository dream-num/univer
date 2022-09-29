import { fireEvent, render, screen } from '@testing-library/preact';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-preact-pure';
import { Checkbox, CheckboxGroup } from '..';

Enzyme.configure({ adapter: new Adapter() });

describe('checkbox', () => {
    test('checkbox', () => {
        const { container } = render(
            <Checkbox value={`Header`} checked={true}>
                Header
            </Checkbox>
        );
        expect(container);
    });
    test('checkbox group', () => {
        let a = 1;
        let checkGroups = [
            {
                checked: true,
                disabled: false,
                name: '123',
                label: '哈哈',
                value: '1',
            },
        ];
        const { container } = render(<CheckboxGroup options={checkGroups} onChange={() => a++}></CheckboxGroup>);
        expect(container);
        fireEvent.click(screen.getByText('哈哈'));
        expect(a).toEqual(2);
    });
});
