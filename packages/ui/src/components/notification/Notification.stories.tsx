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
import { Button, Toaster } from '@univerjs/design';

import { notification } from './Notification';

const meta: Meta<typeof Notification> = {
    title: 'Components / Notification',
    component: Toaster,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {},
};

export default meta;

export const Playground = {
    render: () => (
        <>
            <Toaster />
            <Button
                variant="primary"
                onClick={() =>
                    notification.show({
                        title: 'Event has been created',
                        type: 'success',
                        content: 'Sunday, December 03, 2023 at 9:00 AM',
                    })}
            >
                Notification Success
            </Button>
            <Button
                onClick={() =>
                    notification.show({
                        type: 'info',
                        title: 'Notification Info',
                        content: 'Notification content',
                    })}
            >
                Notification Info
            </Button>
            <Button
                variant="primary"
                onClick={() =>
                    notification.show({
                        type: 'warning',
                        title: 'Notification Warning',
                        content: 'Notification content',
                    })}
            >
                Notification Warning
            </Button>
            <Button
                variant="danger"
                onClick={() =>
                    notification.show({
                        type: 'error',
                        title: 'Notification Error',
                        content: 'Notification content',
                    })}
            >
                Notification Error
            </Button>
        </>
    ),
};
