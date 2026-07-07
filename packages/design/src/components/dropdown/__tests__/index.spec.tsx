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
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Dropdown } from '../Dropdown';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

describe('Dropdown', () => {
    it('should render trigger and not show overlay by default', () => {
        const { getByText, queryByText } = render(
            <Dropdown overlay={<div>Overlay Content</div>}>
                <button type="button">Trigger</button>
            </Dropdown>
        );
        expect(getByText('Trigger')).toBeInTheDocument();
        expect(queryByText('Overlay Content')).not.toBeInTheDocument();
    });

    it('should show overlay when open is true', () => {
        const { getByText } = render(
            <Dropdown overlay={<div>Overlay Content</div>} open>
                <button type="button">Trigger</button>
            </Dropdown>
        );
        expect(getByText('Overlay Content')).toBeInTheDocument();
    });

    it('should call onOpenChange when trigger is clicked', () => {
        const handleOpenChange = vi.fn();
        const { getByText } = render(
            <Dropdown overlay={<div>Overlay Content</div>} onOpenChange={handleOpenChange}>
                <button type="button">Trigger</button>
            </Dropdown>
        );
        getByText('Trigger').click();
        expect(handleOpenChange).toHaveBeenCalled();
    });
});
