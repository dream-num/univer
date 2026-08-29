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

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MobileActionRow } from '../MobileActionRow';

describe('MobileActionRow', () => {
    it('provides a full-width touch action without desktop hover behavior', () => {
        const onClick = vi.fn();
        render(<MobileActionRow title="Rename" aria-label="Rename" onClick={onClick} />);

        const button = screen.getByRole('button', { name: 'Rename' });
        expect(button.className).toContain('univer-min-h-12');
        expect(button.className).not.toContain('hover:');
        fireEvent.click(button);
        expect(onClick).toHaveBeenCalledOnce();
    });
});
