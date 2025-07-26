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
import { KBD } from '../Kbd';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

describe('KBD', () => {
    it('should render with default props', () => {
        const { container } = render(<KBD keyboard="Ctrl" />);
        expect(container).toMatchSnapshot();
    });

    it('should render with custom className', () => {
        const { container } = render(<KBD className="custom-class" keyboard="Ctrl" />);
        expect(container.querySelector('.custom-class')).toBeTruthy();
    });

    it('should render with multiple keys', () => {
        const { container } = render(<KBD keyboard="Ctrl + Alt + Del" />);
        expect(container).toMatchSnapshot();
    });
});
