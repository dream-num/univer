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

/** @vitest-environment jsdom */

import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useWorkbenchPortal } from '../use-workbench-portal';

describe('useWorkbenchPortal', () => {
    it('keeps each body portal in its own host font when an embed changes its font', async () => {
        const firstHost = document.createElement('div');
        const secondHost = document.createElement('div');
        firstHost.style.fontFamily = 'serif';
        secondHost.style.fontFamily = 'monospace';
        document.body.append(firstHost, secondHost);
        const first = renderHook(() => useWorkbenchPortal(firstHost, 'rtl'));
        const second = renderHook(() => useWorkbenchPortal(secondHost, 'ltr'));
        try {
            expect(first.result.current.parentElement).toBe(document.body);
            expect(first.result.current.style.fontFamily).toBe('serif');
            firstHost.style.fontFamily = 'sans-serif';
            await waitFor(() => expect(first.result.current.style.fontFamily).toBe('sans-serif'));
            expect(second.result.current.style.fontFamily).toBe('monospace');
        } finally {
            first.unmount();
            second.unmount();
            firstHost.remove();
            secondHost.remove();
        }
    });
});
