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

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ContextMenuIconPlaceholder } from '../ContextMenuPanel';

describe('ContextMenuPanel', () => {
    it('should reserve icon space for context menu items without icons', () => {
        const { container } = render(<ContextMenuIconPlaceholder visible />);

        const placeholder = container.firstElementChild;
        expect(placeholder).not.toBeNull();
        expect(placeholder?.getAttribute('aria-hidden')).toBe('true');
        expect(placeholder?.classList.contains('univer-size-4')).toBe(true);
        expect(placeholder?.classList.contains('univer-shrink-0')).toBe(true);
    });

    it('should not reserve icon space when it is disabled', () => {
        const { container } = render(<ContextMenuIconPlaceholder visible={false} />);

        expect(container.firstElementChild).toBeNull();
    });
});
