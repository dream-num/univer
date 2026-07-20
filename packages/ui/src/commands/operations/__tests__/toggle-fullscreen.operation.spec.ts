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

import type { IAccessor } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { ILayoutService } from '../../../services/layout/layout.service';
import { ToggleFullscreenOperation } from '../toggle-fullscreen.operation';

function createAccessor(rootContainerElement: HTMLElement | null) {
    return {
        get: (token: unknown) => {
            if (token === ILayoutService) return { rootContainerElement };
            throw new Error('Unknown token');
        },
    } as IAccessor;
}

describe('ToggleFullscreenOperation', () => {
    it('requests fullscreen for the Univer root container', () => {
        const requestFullscreen = vi.fn(async () => undefined);
        const root = {
            ownerDocument: { fullscreenElement: null },
            requestFullscreen,
        } as unknown as HTMLElement;

        expect(ToggleFullscreenOperation.handler(createAccessor(root), {})).toBe(true);
        expect(requestFullscreen).toHaveBeenCalledOnce();
    });

    it('exits fullscreen when the Univer root container is fullscreen', () => {
        const exitFullscreen = vi.fn(async () => undefined);
        const root = {} as HTMLElement;
        Object.assign(root, {
            ownerDocument: { fullscreenElement: root, exitFullscreen },
            requestFullscreen: vi.fn(),
        });

        expect(ToggleFullscreenOperation.handler(createAccessor(root), {})).toBe(true);
        expect(exitFullscreen).toHaveBeenCalledOnce();
        expect(root.requestFullscreen).not.toHaveBeenCalled();
    });

    it('does nothing when the root container is unavailable', () => {
        expect(ToggleFullscreenOperation.handler(createAccessor(null), {})).toBe(false);
    });
});
