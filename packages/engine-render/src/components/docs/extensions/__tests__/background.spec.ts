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

import { describe, expect, it, vi } from 'vitest';
import { Vector2 } from '../../../../basics/vector2';
import { Background } from '../background';

function createCtx() {
    return {
        fillRect: vi.fn(),
        fillStyle: '',
    } as any;
}

function createGlyph(overrides: Record<string, unknown> = {}) {
    return {
        content: 'A',
        width: 24,
        ts: {
            bg: { rgb: '#ff0000' },
        },
        parent: {
            parent: {
                contentHeight: 12,
            },
        },
        ...overrides,
    } as any;
}

describe('docs background extension', () => {
    it('draws span background using the span start point and line height', () => {
        const extension = new Background();
        extension.extensionOffset = {
            spanStartPoint: Vector2.create(10, 20),
        } as any;
        const ctx = createCtx();

        extension.draw(ctx, { scaleX: 1, scaleY: 1 }, createGlyph());

        expect(ctx.fillStyle).toBe('#ff0000');
        expect(ctx.fillRect).toHaveBeenCalledWith(9.5, 21, 25, 14);
    });

    it('skips spans without layout line, background color or visible content', () => {
        const extension = new Background();
        const ctx = createCtx();

        extension.draw(ctx, { scaleX: 1, scaleY: 1 }, createGlyph({ parent: null }));
        extension.draw(ctx, { scaleX: 1, scaleY: 1 }, createGlyph({ ts: {} }));
        extension.draw(ctx, { scaleX: 1, scaleY: 1 }, createGlyph({ content: '\r' }));

        expect(ctx.fillRect).not.toHaveBeenCalled();
    });

    it('clears cached color state', () => {
        const extension = new Background() as any;
        extension._preBackgroundColor = '#fff';

        extension.clearCache();

        expect(extension._preBackgroundColor).toBe('');
    });
});
