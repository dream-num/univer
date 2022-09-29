// import Enzyme, { mount } from 'enzyme';
// import Adapter from 'enzyme-adapter-preact-pure';
// import { h } from 'preact';
// import { render, fireEvent, screen, findByText } from '@testing-library/preact';
// import { ColorPicker } from '..';
// Enzyme.configure({ adapter: new Adapter() });

// describe('ColorPicker', () => {
//     test('should display initial ColorPicker', () => {
//         const { container } = render(<ColorPicker onColor={(color) => {}} color="#000" />);
//         expect(container).toBe(true);
//     });
//     test('click onSwitch function', async () => {
//         render(<ColorPicker onColor={(color) => {}} color="#000" />);

//         fireEvent.click(screen.getByText('自定义'));

//         expect(screen.getByText('收起')).toBe(true);
//     });
// });
