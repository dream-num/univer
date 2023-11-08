import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Button } from '../../button/Button';
import { Message } from '../Message';

describe('Message', () => {
    test('renders correctly', () => {
        const message = new Message(document.body);

        const { container } = render(
            <Button
                onClick={() => {
                    message.success({
                        content: 'success content',
                    });
                }}
            >
                btn2
            </Button>
        );

        fireEvent.click(container.querySelector('button')!);

        expect(screen.getByText('success content')).toBeTruthy();
    });
});
