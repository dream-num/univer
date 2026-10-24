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

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { toast, Toaster } from '../Toaster';

afterEach(() => {
    act(() => {
        toast.dismiss();
    });
    cleanup();
});

describe('Toaster', () => {
    it('shows notifications and limits the visible stack', async () => {
        render(<Toaster visibleToasts={2} />);

        act(() => {
            toast('First notification');
            toast('Second notification');
            toast('Third notification');
        });

        await waitFor(() => {
            const visibleToasts = screen.getAllByRole('listitem').filter((item) => item.dataset.visible === 'true');
            expect(visibleToasts).toHaveLength(2);
            expect(visibleToasts.map((item) => item.textContent)).toEqual(['Third notification', 'Second notification']);
        });
    });
});
