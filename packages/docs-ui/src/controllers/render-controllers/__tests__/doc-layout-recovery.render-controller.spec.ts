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

// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import { acquireDocLayoutRecoveryInteractionLock } from '../doc-layout-recovery.render-controller';

describe('document layout recovery interaction lock', () => {
    it('blocks pointer and shortcut input until recovery completes, then restores prior canvas state', () => {
        const canvas = document.createElement('canvas');
        canvas.style.pointerEvents = 'auto';
        canvas.style.opacity = '0.8';
        canvas.setAttribute('aria-busy', 'mixed');
        const blurSelection = vi.fn();
        const releaseShortcuts = vi.fn();
        const shortcutService = {
            forceDisable: vi.fn(() => ({ dispose: releaseShortcuts })),
        };

        const lock = acquireDocLayoutRecoveryInteractionLock(canvas, shortcutService, blurSelection);

        expect(blurSelection).toHaveBeenCalledOnce();
        expect(shortcutService.forceDisable).toHaveBeenCalledOnce();
        expect(canvas.style.pointerEvents).toBe('none');
        expect(canvas.style.opacity).toBe('0.55');
        expect(canvas.getAttribute('aria-busy')).toBe('true');

        lock.dispose();

        expect(releaseShortcuts).toHaveBeenCalledOnce();
        expect(canvas.style.pointerEvents).toBe('auto');
        expect(canvas.style.opacity).toBe('0.8');
        expect(canvas.getAttribute('aria-busy')).toBe('mixed');
    });
});
