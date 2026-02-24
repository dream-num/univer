/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Button } from '../../button/Button';
import { message, Messager, MessageType, removeMessage } from '../Message';

afterEach(cleanup);

describe('Message', () => {
    it('renders correctly', async () => {
        const { container } = render(
            <>
                <Button
                    onClick={() => {
                        message({
                            type: MessageType.Success,
                            content: 'success content',
                        });
                    }}
                >
                    btn2
                </Button>
                <Messager />
            </>
        );

        fireEvent.click(container.querySelector('button')!);

        await waitFor(() => {
            expect(screen.getByText('success content')).toBeTruthy();
        });
    });

    it('removes message by id', async () => {
        render(<Messager />);

        message({
            id: 'message-test-id',
            type: MessageType.Info,
            content: 'message will be removed',
            duration: Infinity,
        });

        await waitFor(() => {
            expect(screen.getByText('message will be removed')).toBeTruthy();
        });

        removeMessage('message-test-id');

        await waitFor(() => {
            expect(screen.queryByText('message will be removed')).toBeNull();
        });
    });

    it('renders loading icon for loading message', async () => {
        render(<Messager />);

        message({
            id: 'message-loading-id',
            type: MessageType.Loading,
            content: 'loading icon content',
            duration: Infinity,
        });

        await waitFor(() => {
            expect(screen.getByText('loading icon content')).toBeTruthy();
        });

        const toastNode = screen.getByText('loading icon content').closest('[data-sonner-toast]');
        expect(toastNode?.querySelector('[data-icon] svg')).toBeTruthy();
    });
});
