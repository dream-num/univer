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

import { BaselineOffset } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { GlyphType } from '../../../../basics/i-document-skeleton-cached';
import { Vector2 } from '../../../../basics/vector2';
import { CheckboxShape } from '../../../../shape';
import { FontAndBaseLine } from '../font-and-base-line';

function createContext() {
    return {
        fillStyle: '',
        font: '10px Arial',
        save: vi.fn(),
        restore: vi.fn(),
        fillText: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
    } as any;
}

function createGlyph(content: string, overrides?: Partial<any>) {
    return {
        content,
        width: 16,
        left: 0,
        xOffset: 0,
        glyphType: GlyphType.WORD,
        parent: {
            parent: {},
        },
        bBox: {
            aba: 10,
            abd: 2,
            sbo: 2,
            spo: 3,
        },
        fontStyle: {
            fontString: '12px Arial',
        },
        ts: {
            fs: 12,
            cl: { rgb: '#223344' },
        },
        ...overrides,
    } as any;
}

describe('docs font and baseline extension', () => {
    it('handles text drawing with baseline offsets and vertical text branch', () => {
        const extension = new FontAndBaseLine();
        const context = createContext();
        extension.extensionOffset = {
            spanPointWithFont: Vector2.create(12, 20),
            spanStartPoint: Vector2.create(10, 10),
            centerPoint: Vector2.create(8, 8),
            renderConfig: {
                vertexAngle: 0,
                centerAngle: 0,
            },
        } as any;

        extension.draw(context, { scaleX: 1, scaleY: 1 } as any, createGlyph('A'));
        expect(context.fillText).toHaveBeenCalledWith('A', 12, 20);

        const superscript = createGlyph('S', {
            ts: {
                fs: 12,
                cl: { rgb: '#111111' },
                va: BaselineOffset.SUPERSCRIPT,
            },
        });
        extension.draw(context, { scaleX: 1, scaleY: 1 } as any, superscript);
        expect(context.fillText).toHaveBeenCalledWith('S', 12, 17);

        extension.extensionOffset = {
            spanPointWithFont: Vector2.create(12, 20),
            spanStartPoint: Vector2.create(10, 10),
            centerPoint: Vector2.create(8, 8),
            renderConfig: {
                vertexAngle: 0,
                centerAngle: 0,
            },
        } as any;
        const subscript = createGlyph('s', {
            ts: {
                fs: 12,
                cl: { rgb: '#111111' },
                va: BaselineOffset.SUBSCRIPT,
            },
        });
        extension.draw(context, { scaleX: 1, scaleY: 1 } as any, subscript);
        expect(context.fillText).toHaveBeenCalledWith('s', 12, 22);

        extension.extensionOffset = {
            spanPointWithFont: Vector2.create(16, 26),
            spanStartPoint: Vector2.create(16, 26),
            centerPoint: Vector2.create(8, 8),
            renderConfig: {
                vertexAngle: 90,
                centerAngle: 90,
            },
        } as any;
        extension.draw(context, { scaleX: 1, scaleY: 1 } as any, createGlyph('X'));
        expect(context.rotate).toHaveBeenCalled();
    });

    it('renders checkbox list glyphs and clears cache', () => {
        const extension = new FontAndBaseLine();
        const context = createContext();
        const checkSpy = vi.spyOn(CheckboxShape, 'drawWith').mockImplementation(() => undefined);

        extension.extensionOffset = {
            spanPointWithFont: Vector2.create(30, 50),
            spanStartPoint: Vector2.create(24, 44),
            centerPoint: Vector2.create(8, 8),
            renderConfig: {
                vertexAngle: 0,
                centerAngle: 0,
            },
        } as any;

        const checkedGlyph = createGlyph('\u2611', {
            glyphType: GlyphType.LIST,
            ts: {
                fs: 10,
                cl: { rgb: '#111111' },
            },
        });
        extension.draw(context, { scaleX: 1, scaleY: 1 } as any, checkedGlyph);
        expect(checkSpy).toHaveBeenCalled();

        extension.clearCache();
        extension.extensionOffset = {
            renderConfig: {},
        } as any;
        context.fillText.mockClear();
        extension.draw(context, { scaleX: 1, scaleY: 1 } as any, createGlyph('A', { parent: null }));
        expect(context.fillText).not.toHaveBeenCalled();
    });
});
