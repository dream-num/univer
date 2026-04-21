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

import type { IScale } from '@univerjs/core';
import type { IDocumentSkeletonGlyph } from '../../../../basics/i-document-skeleton-cached';
import type { UniverRenderingContext } from '../../../../context';
import type { IExtensionConfig } from '../../../extension';
import { BaselineOffset } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { GlyphType } from '../../../../basics/i-document-skeleton-cached';
import { Vector2 } from '../../../../basics/vector2';
import { CheckboxShape } from '../../../../shape';
import { FontAndBaseLine } from '../font-and-base-line';

type MockRenderContext = UniverRenderingContext & {
    save: ReturnType<typeof vi.fn>;
    restore: ReturnType<typeof vi.fn>;
    fillText: ReturnType<typeof vi.fn>;
    translate: ReturnType<typeof vi.fn>;
    rotate: ReturnType<typeof vi.fn>;
};

type GlyphOverrides = Omit<Partial<IDocumentSkeletonGlyph>, 'bBox' | 'parent'> & {
    bBox?: Partial<IDocumentSkeletonGlyph['bBox']>;
    parent?: IDocumentSkeletonGlyph['parent'] | null;
};

const DEFAULT_SCALE: IScale = { scaleX: 1, scaleY: 1 };

function createContext(): MockRenderContext {
    return {
        fillStyle: '',
        font: '10px Arial',
        save: vi.fn(),
        restore: vi.fn(),
        fillText: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
    } as unknown as MockRenderContext;
}

function createGlyph(content: string, overrides?: GlyphOverrides): IDocumentSkeletonGlyph {
    const baseGlyph = {
        content,
        raw: content,
        width: 16,
        left: 0,
        xOffset: 0,
        glyphType: GlyphType.WORD,
        streamType: 'LETTER',
        count: 1,
        adjustability: {
            stretchability: [0, 0],
            shrinkability: [0, 0],
        },
        isJustifiable: false,
        parent: {
            parent: {},
        },
        bBox: {
            width: 10,
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
    };

    return {
        ...baseGlyph,
        ...overrides,
        parent: overrides?.parent === null ? undefined : overrides?.parent ?? baseGlyph.parent,
        bBox: {
            ...baseGlyph.bBox,
            ...overrides?.bBox,
        },
    } as unknown as IDocumentSkeletonGlyph;
}

describe('docs font and baseline extension', () => {
    it('handles text drawing with baseline offsets and vertical text branch', () => {
        const extension = new FontAndBaseLine();
        const TestContext = createContext();
        extension.extensionOffset = {
            spanPointWithFont: Vector2.create(12, 20),
            spanStartPoint: Vector2.create(10, 10),
            centerPoint: Vector2.create(8, 8),
            renderConfig: {
                vertexAngle: 0,
                centerAngle: 0,
            },
        } as IExtensionConfig;

        extension.draw(TestContext, DEFAULT_SCALE, createGlyph('A'));
        expect(TestContext.fillText).toHaveBeenCalledWith('A', 12, 20);

        const superscript = createGlyph('S', {
            ts: {
                fs: 12,
                cl: { rgb: '#111111' },
                va: BaselineOffset.SUPERSCRIPT,
            },
        });
        extension.draw(TestContext, DEFAULT_SCALE, superscript);
        expect(TestContext.fillText).toHaveBeenCalledWith('S', 12, 17);

        extension.extensionOffset = {
            spanPointWithFont: Vector2.create(12, 20),
            spanStartPoint: Vector2.create(10, 10),
            centerPoint: Vector2.create(8, 8),
            renderConfig: {
                vertexAngle: 0,
                centerAngle: 0,
            },
        } as IExtensionConfig;
        const subscript = createGlyph('s', {
            ts: {
                fs: 12,
                cl: { rgb: '#111111' },
                va: BaselineOffset.SUBSCRIPT,
            },
        });
        extension.draw(TestContext, DEFAULT_SCALE, subscript);
        expect(TestContext.fillText).toHaveBeenCalledWith('s', 12, 22);

        extension.extensionOffset = {
            spanPointWithFont: Vector2.create(16, 26),
            spanStartPoint: Vector2.create(16, 26),
            centerPoint: Vector2.create(8, 8),
            renderConfig: {
                vertexAngle: 90,
                centerAngle: 90,
            },
        } as IExtensionConfig;
        extension.draw(TestContext, DEFAULT_SCALE, createGlyph('X'));
        expect(TestContext.rotate).toHaveBeenCalled();

        TestContext.fillText.mockClear();
        extension.draw(TestContext, DEFAULT_SCALE, createGlyph('阿', {
            bBox: {
                width: 12,
                aba: 10,
                abd: 2,
                ba: 10,
                bd: 2,
                sp: 0,
                sbr: 0,
                sbo: 2,
                spr: 0,
                spo: 3,
            },
        }));
        expect(TestContext.fillText).toHaveBeenCalledWith('阿', 18, 22);
    });

    it('renders checkbox list glyphs and clears cache', () => {
        const extension = new FontAndBaseLine();
        const TestContext = createContext();
        const checkSpy = vi.spyOn(CheckboxShape, 'drawWith').mockImplementation(() => undefined);

        extension.extensionOffset = {
            spanPointWithFont: Vector2.create(30, 50),
            spanStartPoint: Vector2.create(24, 44),
            centerPoint: Vector2.create(8, 8),
            renderConfig: {
                vertexAngle: 0,
                centerAngle: 0,
            },
        } as IExtensionConfig;

        const checkedGlyph = createGlyph('\u2611', {
            glyphType: GlyphType.LIST,
            ts: {
                fs: 10,
                cl: { rgb: '#111111' },
            },
        });
        extension.draw(TestContext, DEFAULT_SCALE, checkedGlyph);
        expect(checkSpy).toHaveBeenCalled();

        extension.clearCache();
        extension.extensionOffset = {
            renderConfig: {},
        } as IExtensionConfig;
        TestContext.fillText.mockClear();
        extension.draw(TestContext, DEFAULT_SCALE, createGlyph('A', { parent: null }));
        expect(TestContext.fillText).not.toHaveBeenCalled();
    });
});
