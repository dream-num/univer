import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-preact-pure';
import { render, screen } from '@testing-library/preact';
import { Modal } from '..';

Enzyme.configure({ adapter: new Adapter() });

describe('Modal', () => {
    const title = 'title';
    const div = <div>btn</div>;
    const modal = (
        <Modal visible={true} title={title}>
            {div}
        </Modal>
    );
    test('Find Modal title', async () => {
        render(modal);

        // fireEvent.click(screen.getByText('1'));

        expect(screen.getByText('btn'));
    });
});
