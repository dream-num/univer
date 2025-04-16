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

import type { Meta } from '@storybook/react';

import { Button } from '../button/Button';
import { message, Messager, MessageType } from './Message';

const meta: Meta = {
    title: 'Components / Message',
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {},
};

export default meta;

export const Playground = {
    render: () => {
        function handleOpen(type: MessageType) {
            message({
                type,
                content: 'Hello world!',
            });
        }

        return (
            <section className="univer-space-x-2">
                <Button variant="primary" onClick={() => handleOpen(MessageType.Success)}>
                    success
                </Button>
                <Button variant="primary" onClick={() => handleOpen(MessageType.Info)}>
                    info / default
                </Button>
                <Button variant="primary" onClick={() => handleOpen(MessageType.Warning)}>
                    warning
                </Button>
                <Button variant="primary" onClick={() => handleOpen(MessageType.Error)}>
                    error
                </Button>
                <Button variant="primary" onClick={() => handleOpen(MessageType.Loading)}>
                    loading
                </Button>

                <Messager />
            </section>
        );
    },
};
