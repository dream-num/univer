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
import { useState } from 'react';
import { Button } from '../button/Button';
import { Gallery } from './Gallery';

const meta: Meta<typeof Gallery> = {
    title: 'Components / Gallery',
    component: Gallery,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const GalleryBasic = {
    render() {
        const [open, setOpen] = useState(false);

        const images = ['https://github.com/dream-num.png', 'https://github.com/awesome-univer.png', 'https://github.com/dream-num.png'];

        return (
            <>
                <div>
                    <Button onClick={() => setOpen(true)}>Open Gallery</Button>
                    <Gallery open={open} onOpenChange={setOpen} images={images} />
                </div>
            </>
        );
    },
};
