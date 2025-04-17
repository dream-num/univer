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

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Avatar } from '../Avatar';

describe('Avatar', () => {
    afterEach(cleanup);

    it('renders correctly', () => {
        const { container } = render(<Avatar size="small">Jane Doe</Avatar>);
        expect(container);
    });

    it('renders the children', () => {
        const { getByText } = render(<Avatar>Test</Avatar>);
        const childrenElement = getByText('Test');
        expect(childrenElement).not.toBeNull();
    });

    it('renders the image', () => {
        const { container } = render(<Avatar src="test.png" />);

        expect(container.querySelector('img')).not.toBeNull();
    });

    it('renders the image with fit', () => {
        const { container } = render(<Avatar src="test.png" fit="contain" />);

        expect(container.innerHTML).contains('object-fit: contain');
    });

    it('renders the size with number', () => {
        const { container } = render(<Avatar size={100} />);

        expect(container.innerHTML).contains('width: 100px');
        expect(container.innerHTML).contains('height: 100px');
        expect(container.innerHTML).contains('line-height: 100px');
    });
});
