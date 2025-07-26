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

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Badge } from '../Badge';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

describe('Badge', () => {
    it('renders children', () => {
        render(<Badge>Test Badge</Badge>);
        expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('renders closable badge', () => {
        const onClose = vi.fn();
        render(<Badge closable onClose={onClose}>Closable Badge</Badge>);
        const closeButton = screen.getByLabelText('Close badge');
        expect(closeButton).toBeInTheDocument();
        fireEvent.click(closeButton);
        expect(onClose).toHaveBeenCalled();
    });
});
