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

import { afterEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { cleanup, render } from '@testing-library/react';
import type { IPagerProps } from '../Pager';
import { Pager } from '../Pager';

describe('Pager', () => {
    const defaultProps: IPagerProps = {
        value: 1,
        total: 5,
        onChange: vi.fn(),
    };

    // cleanup after each test
    afterEach(cleanup);

    it('renders correctly with default props', () => {
        const { getByText } = render(<Pager {...defaultProps} />);
        expect(getByText('1/5')).toBeTruthy();
    });

    it('renders correctly with custom text', () => {
        const props: IPagerProps = { ...defaultProps, text: 'Custom Text' };
        const { getByText } = render(<Pager {...props} />);
        expect(getByText('Custom Text')).toBeTruthy();
    });

    it('renders only text when total is 0', () => {
        const props: IPagerProps = { ...defaultProps, total: 0 };
        const { getByText, queryByRole } = render(<Pager {...props} />);
        expect(getByText('1/0')).toBeTruthy();
        expect(queryByRole('button')).not.toBeTruthy();
    });
});
