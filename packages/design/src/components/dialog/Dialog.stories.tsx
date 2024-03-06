/**
 * Copyright 2023-present DreamNum Inc.
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
import { CloseSingle } from '@univerjs/icons';
import React, { useState } from 'react';

import { Button } from '../button/Button';
import { Dialog } from './Dialog';

const meta: Meta<typeof Dialog> = {
    title: 'Components / Dialog',
    component: Dialog,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const DialogBasic = {
    render() {
        const [visible, setVisible] = useState(false);

        function handleToggleVisible() {
            setVisible(!visible);
        }

        return (
            <>
                <Button onClick={handleToggleVisible}>open dialog</Button>
                <Dialog
                    visible={visible}
                    title="hello world"
                    closeIcon={<CloseSingle />}
                    footer={<footer>footer</footer>}
                    onClose={handleToggleVisible}
                >
                    xxxx
                </Dialog>
            </>
        );
    },
};

export const DialogDraggable = {
    render() {
        const [visible, setVisible] = useState(false);

        function handleToggleVisible() {
            setVisible(!visible);
        }

        return (
            <>
                <Button onClick={handleToggleVisible}>open dialog</Button>
                <Dialog
                    visible={visible}
                    title="hello world"
                    closeIcon={<CloseSingle />}
                    draggable
                    destroyOnClose
                    preservePositionOnDestroy
                    defaultPosition={{ x: 100, y: 100 }}
                    onClose={handleToggleVisible}
                >
                    xxxx
                </Dialog>
            </>
        );
    },
};
