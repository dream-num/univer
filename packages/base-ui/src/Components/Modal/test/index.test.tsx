import { render, screen } from '@testing-library/react';

import { Modal } from '..';

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
