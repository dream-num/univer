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
import { Confirm } from '../Confirm';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

describe('Confirm', () => {
    it('should not render when visible is false', () => {
        const { queryByText } = render(<Confirm visible={false} title="T">content</Confirm>);
        expect(queryByText('T')).not.toBeInTheDocument();
    });

    it('should render with title and content', () => {
        const { getByText } = render(<Confirm visible title="Test Title">Dialog Content</Confirm>);
        expect(getByText('Test Title')).toBeInTheDocument();
        expect(getByText('Dialog Content')).toBeInTheDocument();
    });

    it('should render custom button text', () => {
        const { getByText } = render(<Confirm visible cancelText="No" confirmText="Yes">content</Confirm>);
        expect(getByText('No')).toBeInTheDocument();
        expect(getByText('Yes')).toBeInTheDocument();
    });
});
