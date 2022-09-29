import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-preact-pure';
import { render, fireEvent, screen } from '@testing-library/preact';
import { RadioGroup, Radio } from '..';

Enzyme.configure({ adapter: new Adapter() });

describe('RadioGroup', () => {
    let active = '0';
    const group = (
        <RadioGroup
            active={active}
            onChange={(value) => {
                active = value;
            }}
        >
            <Radio value="0" label="0"></Radio>
            <Radio value="1" label="1"></Radio>
        </RadioGroup>
    );
    test('click Radio', async () => {
        render(group);

        fireEvent.click(screen.getByText('1'));

        expect(active).toBe('1');
    });
});
