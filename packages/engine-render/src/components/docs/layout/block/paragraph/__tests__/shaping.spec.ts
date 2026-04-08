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

import { BooleanNumber, DataStreamTreeTokenType, GridType, PositionedObjectLayoutType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { Lang } from '../../../hyphenation/lang';

import { shaping } from '../shaping';

const h = vi.hoisted(() => ({
    createSkeletonCustomBlockGlyphMock: vi.fn(),
    createSkeletonLetterGlyphMock: vi.fn(),
    createSkeletonTabGlyphMock: vi.fn(),
    glyphShrinkLeftMock: vi.fn(),
    glyphShrinkRightMock: vi.fn(),
    getBoundingBoxMock: vi.fn(() => ({
        width: 12,
        height: 6,
    })),
    textShapeMock: vi.fn(),
    prepareParagraphBodyMock: vi.fn(() => 'paragraph-body'),
    getCharSpaceApplyMock: vi.fn(() => 2),
    getFontCreateConfigMock: vi.fn((index: number) => ({ index })),
    emojiHandlerMock: vi.fn(),
    arabicHandlerMock: vi.fn(),
    tibetanHandlerMock: vi.fn(),
    otherHandlerMock: vi.fn(),
    hyphenEnhancerCtorMock: vi.fn(),
    fontLibraryMock: {
        isReady: false,
    },
}));

function createGlyph(content: string, width = 8, streamType?: string) {
    return {
        content,
        width,
        xOffset: 0,
        streamType,
        adjustability: {
            shrinkability: [6, 6],
            stretchability: [1, 1],
        },
        bBox: {
            width: Math.max(width - 1, 1),
        },
    } as any;
}

vi.mock('../../../../../../basics/tools', () => ({
    hasArabic: (char: string) => char === 'ع',
    hasCJK: (char: string) => char === '中' || char === '，',
    hasCJKPunctuation: (char: string) => char === '，',
    hasCJKText: (char: string) => char === '中' || char === '，',
    hasTibetan: (char: string) => char === 'ཀ',
    startWithEmoji: (src: string) => src.startsWith('😀'),
}));

vi.mock('../../../line-breaker', () => ({
    LineBreaker: class {
        private _used = false;

        constructor(private _content: string) {}

        nextBreakPoint() {
            if (this._used) {
                return null;
            }
            this._used = true;
            return {
                position: this._content.length,
                type: 0,
            };
        }
    },
}));

vi.mock('../../../line-breaker/enhancers/link-enhancer', () => ({
    LineBreakerLinkEnhancer: class {
        constructor(private _breaker: any) {}

        nextBreakPoint() {
            return this._breaker.nextBreakPoint();
        }
    },
}));

vi.mock('../../../line-breaker/enhancers/hyphen-enhancer', () => ({
    LineBreakerHyphenEnhancer: class {
        constructor(private _breaker: any) {
            h.hyphenEnhancerCtorMock();
        }

        nextBreakPoint() {
            return this._breaker.nextBreakPoint();
        }
    },
}));

vi.mock('../../../line-breaker/extensions/tab-linebreak-extension', () => ({
    tabLineBreakExtension: vi.fn(),
}));

vi.mock('../../../line-breaker/extensions/custom-block-linebreak-extension', () => ({
    customBlockLineBreakExtension: vi.fn(),
}));

vi.mock('../../../model/glyph', () => ({
    createSkeletonCustomBlockGlyph: (...args: any[]) => (h.createSkeletonCustomBlockGlyphMock as any)(...args),
    createSkeletonLetterGlyph: (...args: any[]) => (h.createSkeletonLetterGlyphMock as any)(...args),
    createSkeletonTabGlyph: (...args: any[]) => (h.createSkeletonTabGlyphMock as any)(...args),
    glyphShrinkLeft: (...args: any[]) => (h.glyphShrinkLeftMock as any)(...args),
    glyphShrinkRight: (...args: any[]) => (h.glyphShrinkRightMock as any)(...args),
}));

vi.mock('../../../model/line', () => ({
    getBoundingBox: (...args: any[]) => (h.getBoundingBoxMock as any)(...args),
}));

vi.mock('../../../shaping-engine/text-shaping', () => ({
    textShape: (...args: any[]) => (h.textShapeMock as any)(...args),
}));

vi.mock('../../../shaping-engine/utils', () => ({
    prepareParagraphBody: (...args: any[]) => (h.prepareParagraphBodyMock as any)(...args),
}));

vi.mock('../../../shaping-engine/font-library', () => ({
    fontLibrary: h.fontLibraryMock,
}));

vi.mock('../../../tools', () => ({
    getCharSpaceApply: (...args: any[]) => (h.getCharSpaceApplyMock as any)(...args),
    getFontCreateConfig: (...args: any[]) => (h.getFontCreateConfigMock as any)(...args),
}));

vi.mock('../language-ruler', () => ({
    emojiHandler: (...args: any[]) => (h.emojiHandlerMock as any)(...args),
    ArabicHandler: (...args: any[]) => (h.arabicHandlerMock as any)(...args),
    TibetanHandler: (...args: any[]) => (h.tibetanHandlerMock as any)(...args),
    otherHandler: (...args: any[]) => (h.otherHandlerMock as any)(...args),
}));

describe('paragraph shaping', () => {
    it('handles custom blocks, language handlers, punctuation and hyphen pattern loading', () => {
        h.fontLibraryMock.isReady = false;
        h.hyphenEnhancerCtorMock.mockClear();
        h.textShapeMock.mockReset();

        h.createSkeletonLetterGlyphMock.mockImplementation((char: string, _config: any, width?: number) => {
            if (char === DataStreamTreeTokenType.PARAGRAPH && width === 0) {
                return createGlyph(char, 0);
            }
            return createGlyph(char, 8);
        });
        h.createSkeletonTabGlyphMock.mockImplementation(() => createGlyph(DataStreamTreeTokenType.TAB, 4));
        h.createSkeletonCustomBlockGlyphMock.mockImplementation((_config: any, width: number, _height: number, _drawingId: string) => {
            return createGlyph(DataStreamTreeTokenType.CUSTOM_BLOCK, width, DataStreamTreeTokenType.CUSTOM_BLOCK);
        });
        h.glyphShrinkLeftMock.mockImplementation((glyph: any, delta: number) => {
            glyph.width -= delta;
        });
        h.glyphShrinkRightMock.mockImplementation((glyph: any, delta: number) => {
            glyph.width -= delta;
        });

        h.emojiHandlerMock.mockImplementation((_i: number, _src: string) => ({
            step: '😀'.length,
            glyphGroup: [createGlyph('😀', 10)],
        }));
        h.arabicHandlerMock.mockImplementation(() => ({
            step: 1,
            glyphGroup: [createGlyph('ع', 9)],
        }));
        h.tibetanHandlerMock.mockImplementation(() => ({
            step: 1,
            glyphGroup: [createGlyph('ཀ', 9)],
        }));
        h.otherHandlerMock.mockImplementation(() => ({
            step: 1,
            glyphGroup: [createGlyph('x', 7)],
        }));

        const ctx = {
            hyphen: {
                hasPattern: vi.fn(() => false),
                loadPattern: vi.fn(),
            },
            languageDetector: {
                detect: vi.fn(() => Lang.EnUs),
            },
        } as any;

        const viewModel = {
            getParagraph: vi.fn(() => ({
                startIndex: 0,
                paragraphStyle: {
                    snapToGrid: BooleanNumber.TRUE,
                    suppressHyphenation: BooleanNumber.FALSE,
                },
            })),
            getBody: vi.fn(() => ({ dataStream: '' })),
            getCustomBlockWithoutSetCurrentIndex: vi.fn((index: number) => {
                if (index === 0) {
                    return { blockId: 'inline-block' };
                }
                if (index === 1) {
                    return { blockId: 'float-block' };
                }
                return null;
            }),
        } as any;

        const paragraphNode = {
            startIndex: 0,
            endIndex: 1,
        } as any;

        const sectionBreakConfig = {
            gridType: GridType.LINES,
            charSpace: 1,
            defaultTabStop: 10.5,
            drawings: {
                'inline-block': {
                    drawingId: 'inline-block',
                    layoutType: PositionedObjectLayoutType.INLINE,
                    docTransform: {
                        angle: 30,
                        size: {
                            width: 20,
                            height: 10,
                        },
                    },
                },
                'float-block': {
                    drawingId: 'float-block',
                    layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                    docTransform: {
                        angle: 0,
                        size: {
                            width: 20,
                            height: 10,
                        },
                    },
                },
            },
            autoHyphenation: BooleanNumber.TRUE,
            doNotHyphenateCaps: BooleanNumber.FALSE,
            renderConfig: {
                zeroWidthParagraphBreak: BooleanNumber.TRUE,
            },
        } as any;

        const content = `${DataStreamTreeTokenType.CUSTOM_BLOCK}${DataStreamTreeTokenType.CUSTOM_BLOCK}\t${DataStreamTreeTokenType.PARAGRAPH}中😀عཀx，，中a中`;
        const shaped = shaping(ctx, content, viewModel, paragraphNode, sectionBreakConfig, false);

        expect(shaped.length).toBeGreaterThan(0);
        expect(h.getBoundingBoxMock).toHaveBeenCalled();
        expect(h.createSkeletonCustomBlockGlyphMock).toHaveBeenCalledTimes(2);
        expect(h.emojiHandlerMock).toHaveBeenCalled();
        expect(h.arabicHandlerMock).toHaveBeenCalled();
        expect(h.tibetanHandlerMock).toHaveBeenCalled();
        expect(h.otherHandlerMock).toHaveBeenCalled();
        expect(h.glyphShrinkLeftMock).toHaveBeenCalled();
        expect(h.glyphShrinkRightMock).toHaveBeenCalled();
        expect(ctx.hyphen.loadPattern).toHaveBeenCalledWith(Lang.EnUs);
        expect(h.hyphenEnhancerCtorMock).not.toHaveBeenCalled();
    });

    it('uses openType shaping path and hyphen enhancer when pattern exists', () => {
        h.fontLibraryMock.isReady = true;
        h.hyphenEnhancerCtorMock.mockClear();

        h.createSkeletonLetterGlyphMock.mockImplementation((char: string, _config: any, _width?: number, glyphInfo?: any) => {
            return createGlyph(glyphInfo ? `${char}-ot` : char, 8);
        });
        h.createSkeletonTabGlyphMock.mockImplementation(() => createGlyph(DataStreamTreeTokenType.TAB, 4));
        h.textShapeMock.mockReturnValue([
            { start: 0, end: 1, char: 'A' },
            { start: 1, end: 2, char: DataStreamTreeTokenType.TAB },
            { start: 2, end: 4, char: '😀' },
        ]);

        const ctx = {
            hyphen: {
                hasPattern: vi.fn(() => true),
                loadPattern: vi.fn(),
            },
            languageDetector: {
                detect: vi.fn(() => Lang.EnUs),
            },
        } as any;

        const viewModel = {
            getParagraph: vi.fn(() => ({
                startIndex: 0,
                paragraphStyle: {
                    suppressHyphenation: BooleanNumber.FALSE,
                },
            })),
            getBody: vi.fn(() => ({ dataStream: '' })),
            getCustomBlockWithoutSetCurrentIndex: vi.fn(() => null),
        } as any;

        const shaped = shaping(
            ctx,
            `A${DataStreamTreeTokenType.TAB}😀`,
            viewModel,
            { startIndex: 0, endIndex: 1 } as any,
            {
                autoHyphenation: BooleanNumber.TRUE,
                doNotHyphenateCaps: BooleanNumber.TRUE,
                drawings: {},
            } as any,
            true
        );

        expect(shaped.length).toBeGreaterThan(0);
        expect(h.prepareParagraphBodyMock).toHaveBeenCalled();
        expect(h.textShapeMock).toHaveBeenCalled();
        expect(h.createSkeletonTabGlyphMock).toHaveBeenCalled();
        expect(h.createSkeletonLetterGlyphMock).toHaveBeenCalled();
        expect(h.hyphenEnhancerCtorMock).toHaveBeenCalled();
        expect(ctx.hyphen.loadPattern).not.toHaveBeenCalled();
    });
});
