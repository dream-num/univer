import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-preact-pure';
import { render, fireEvent, screen } from '@testing-library/preact';
import { Button } from '..';

Enzyme.configure({ adapter: new Adapter() });

describe('Button', () => {
    test('should display initial Button', () => {
        const { container } = render(
            <Button type="text" onClick={() => {}}>
                哈哈
            </Button>
        );
        expect(container);
    });
    test('click onSwitch function', async () => {
        let a = 1;

        render(
            <Button
                type="text"
                onClick={() => {
                    a++;
                }}
            >
                哈哈
            </Button>
        );

        fireEvent.click(screen.getByText('哈哈'));

        expect(a).toEqual(2);
    });
});
