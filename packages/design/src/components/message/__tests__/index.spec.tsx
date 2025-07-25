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

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Button } from '../../button/Button';
import { message, Messager, MessageType } from '../Message';

afterEach(cleanup);

describe('Message', () => {
    it('renders correctly', () => {
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

        expect(screen.getByText('success content')).toBeTruthy();
    });
});
