import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-preact-pure';
import { render } from '@testing-library/preact';
import { Icon } from '../AddIcon';

Enzyme.configure({ adapter: new Adapter() });

describe('icon', () => {
    test('icon', () => {
        const { container } = render(
            <Icon spin rotate={90}>
                <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5565" width="1em" height="1em" fill="currentColor">
                    <path
                        d="M287.018667 419.328h310.997333v42.666667H286.72l84.48 84.437333a21.333333 21.333333 0 1 1-30.208 30.165333l-120.746667-120.704a21.248 21.248 0 0 1 0-30.165333l120.746667-120.661333a21.333333 21.333333 0 0 1 30.165333 30.165333L287.018667 419.328z m524.330666 213.333333a213.333333 213.333333 0 0 0-213.333333-213.333333v42.666667a170.666667 170.666667 0 0 1 170.666667 170.666666h42.666666z m0 0h-42.666666v64a21.333333 21.333333 0 1 0 42.666666 0v-64z"
                        p-id="5566"
                    ></path>
                </svg>
            </Icon>
        );
        expect(container);
    });
});
