// import Enzyme, { mount } from 'enzyme';
// import Adapter from 'enzyme-adapter-preact-pure';
// import { h } from 'preact';
// import { render, fireEvent, screen, waitFor } from '@testing-library/preact';
// import { Tooltip } from '..';
// Enzyme.configure({ adapter: new Adapter() });

// describe('Tooltip', () => {
//     const title = 'this is title';
//     const div = <div>提示</div>;
//     const tooltip = <Tooltip title={title}>{div}</Tooltip>;
//     it('MouseLeave tooltip', async () => {
//         render(tooltip);
//         fireEvent.mouseLeave(screen.getByText('提示'));

//         const ti = screen.getByText(title);
//         const parent = ti.parentElement?.style.display;
//         expect(ti).toEqual('inline-block');
//     });

//     it('MouseOver tooltip', () => {
//         render(tooltip);

//         fireEvent.mouseOver(screen.getByText('tooltip'));

//         const ti = screen.getByText(title).parentElement?.style.display;
//         expect(ti).toEqual('none');
//     });
// });
