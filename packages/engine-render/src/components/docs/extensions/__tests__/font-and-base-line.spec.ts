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
import { COLOR_BLACK_RGB } from '../../../../basics/const';
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
    createLinearGradient: ReturnType<typeof vi.fn>;
    createRadialGradient: ReturnType<typeof vi.fn>;
    createPattern: ReturnType<typeof vi.fn>;
    _context: {
        createConicGradient: ReturnType<typeof vi.fn>;
    };
};

type GlyphOverrides = Omit<Partial<IDocumentSkeletonGlyph>, 'bBox' | 'parent'> & {
    bBox?: Partial<IDocumentSkeletonGlyph['bBox']>;
    parent?: IDocumentSkeletonGlyph['parent'] | null;
};

interface ITestableFontAndBaseLine {
    _clamp: (value: number, min: number, max: number) => number;
    _colorWithOpacity: (color: string, opacity?: number) => string;
    _getTextFillImage: (source: string) => HTMLImageElement | null;
    _normalizeGradientStops: (stops: undefined, fallbackColor: string) => unknown;
    _textFillImageCache: Map<string, unknown>;
    draw: FontAndBaseLine['draw'];
    extensionOffset: IExtensionConfig;
    parent: { onTextFillImageLoaded?: () => void };
}

const DEFAULT_SCALE: IScale = { scaleX: 1, scaleY: 1 };

function createContext(): MockRenderContext {
    const gradient = {
        addColorStop: vi.fn(),
    };
    return {
        fillStyle: '',
        filter: 'none',
        font: '10px Arial',
        globalCompositeOperation: 'source-over',
        shadowColor: 'transparent',
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        save: vi.fn(),
        restore: vi.fn(),
        fillText: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        createLinearGradient: vi.fn(() => gradient),
        createRadialGradient: vi.fn(() => gradient),
        createPattern: vi.fn(() => ({ setTransform: vi.fn() })),
        _context: {
            createConicGradient: vi.fn(() => gradient),
        },
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
    it('keeps existing document text colors unchanged', () => {
        const screenExtension = new FontAndBaseLine();
        const ScreenContext = createContext();
        ScreenContext.__mode = 'rendering';
        screenExtension.extensionOffset = {
            spanPointWithFont: Vector2.create(12, 20),
            spanStartPoint: Vector2.create(10, 10),
            centerPoint: Vector2.create(8, 8),
            renderConfig: {
                vertexAngle: 0,
                centerAngle: 0,
            },
        };

        screenExtension.draw(ScreenContext, DEFAULT_SCALE, createGlyph('Header', {
            ts: { fs: 12 },
        }));

        expect(ScreenContext.fillStyle).toBe(COLOR_BLACK_RGB);

        screenExtension.draw(ScreenContext, DEFAULT_SCALE, createGlyph('Explicit black', {
            ts: { fs: 12, cl: { rgb: '#000000' } },
        }));

        expect(ScreenContext.fillStyle).toBe('#000000');
    });

    it('renders public glow and outer shadow behind the source text without canvas filters', () => {
        const extension = new FontAndBaseLine();
        const TestContext = createContext();
        const effectsDuringDraw: Array<{ composite: string; color: string; blur: number; offsetX: number; offsetY: number }> = [];
        TestContext.fillText.mockImplementation(() => {
            effectsDuringDraw.push({
                composite: TestContext.globalCompositeOperation,
                color: TestContext.shadowColor,
                blur: TestContext.shadowBlur,
                offsetX: TestContext.shadowOffsetX,
                offsetY: TestContext.shadowOffsetY,
            });
        });
        extension.extensionOffset = {
            spanPointWithFont: Vector2.create(12, 20),
            spanStartPoint: Vector2.create(10, 10),
            centerPoint: Vector2.create(8, 8),
            renderConfig: {
                vertexAngle: 0,
                centerAngle: 0,
            },
        };

        extension.draw(TestContext, DEFAULT_SCALE, createGlyph('A', {
            ts: {
                fs: 12,
                cl: { rgb: '#223344' },
                glow: {
                    color: '#5b9bd5',
                    radius: 4,
                },
                outerShadow: {
                    color: '#000000',
                    opacity: 0.4,
                    blurRadius: 3,
                    distance: 2,
                    direction: 0,
                },
            },
        }));

        expect(TestContext.fillText).toHaveBeenCalledTimes(2);
        expect(effectsDuringDraw[0]).toEqual({
            composite: 'source-over',
            color: '#5b9bd5',
            blur: 2,
            offsetX: 0,
            offsetY: 0,
        });
        expect(effectsDuringDraw[1]).toEqual({
            composite: 'source-over',
            color: 'rgba(0,0,0,0.4)',
            blur: 3,
            offsetX: 2,
            offsetY: 0,
        });
        expect(TestContext.filter).toBe('none');
        expect(TestContext.save).toHaveBeenCalledTimes(1);
        expect(TestContext.restore).toHaveBeenCalledTimes(1);
    });

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
            bBox: {
                width: 18,
                aba: 14,
                abd: 4,
            },
            ts: {
                fs: 10,
                cl: { rgb: '#111111' },
            },
        });
        extension.draw(TestContext, DEFAULT_SCALE, checkedGlyph);
        expect(TestContext.translate).toHaveBeenCalledWith(29.5, 35.5);
        expect(checkSpy).toHaveBeenCalledWith(TestContext, {
            width: 18,
            height: 18,
            checked: true,
        });

        extension.clearCache();
        extension.extensionOffset = {
            renderConfig: {},
        } as IExtensionConfig;
        TestContext.fillText.mockClear();
        extension.draw(TestContext, DEFAULT_SCALE, createGlyph('A', { parent: null }));
        expect(TestContext.fillText).not.toHaveBeenCalled();
    });

    it('renders solid and gradient text fills with normalized colors', () => {
        const extension = new FontAndBaseLine() as unknown as ITestableFontAndBaseLine;
        const TestContext = createContext();
        extension.extensionOffset = {
            spanPointWithFont: Vector2.create(10, 24),
            spanStartPoint: Vector2.create(10, 24),
            centerPoint: Vector2.create(8, 8),
            renderConfig: {
                vertexAngle: 0,
                centerAngle: 0,
            },
        } as IExtensionConfig;

        extension.draw(TestContext, DEFAULT_SCALE, createGlyph('S', {
            ts: {
                fs: 12,
                cl: { rgb: '#000000' },
                textFill: {
                    type: 'solid',
                    color: '#abc',
                    opacity: 0.5,
                },
            } as IDocumentSkeletonGlyph['ts'],
        }));
        expect(TestContext.fillStyle).toBe('rgba(170, 187, 204, 0.5)');

        extension.draw(TestContext, DEFAULT_SCALE, createGlyph('L', {
            ts: {
                fs: 12,
                cl: { rgb: '#111111' },
                textFill: {
                    type: 'gradient',
                    color: '#123456',
                    opacity: 0.5,
                    gradient: {
                        type: 'linear',
                        angle: 45,
                        stops: [
                            { offset: 0, color: '#000000', opacity: 1 },
                            { offset: 100, color: '#ffffff', opacity: 0.5 },
                        ],
                    },
                },
            } as IDocumentSkeletonGlyph['ts'],
        }));
        expect(TestContext.createLinearGradient).toHaveBeenCalled();

        extension.draw(TestContext, DEFAULT_SCALE, createGlyph('R', {
            ts: {
                fs: 12,
                cl: { rgb: '#111111' },
                textFill: {
                    type: 'gradient',
                    color: '#123456',
                    gradient: { type: 'radial' },
                },
            } as IDocumentSkeletonGlyph['ts'],
        }));
        extension.draw(TestContext, DEFAULT_SCALE, createGlyph('D', {
            ts: {
                fs: 12,
                cl: { rgb: '#111111' },
                textFill: {
                    type: 'gradient',
                    color: '#123456',
                    gradient: { type: 'diamond' },
                },
            } as IDocumentSkeletonGlyph['ts'],
        }));
        expect(TestContext.createRadialGradient).toHaveBeenCalledTimes(2);

        extension.draw(TestContext, DEFAULT_SCALE, createGlyph('A', {
            ts: {
                fs: 12,
                cl: { rgb: '#111111' },
                textFill: {
                    type: 'gradient',
                    color: '#123456',
                    gradient: { type: 'angular', angle: 180 },
                },
            } as IDocumentSkeletonGlyph['ts'],
        }));
        expect(TestContext._context.createConicGradient).toHaveBeenCalled();

        expect(extension._normalizeGradientStops(undefined, '#010203')).toEqual([
            { color: '#010203', offset: 0, opacity: undefined },
            { color: '#ffffff', offset: 1, opacity: undefined },
        ]);
        expect(extension._colorWithOpacity('#123456', 0.25)).toBe('rgba(18, 52, 86, 0.25)');
        expect(extension._colorWithOpacity('rgb(1,2,3)', 0.25)).toBe('rgb(1,2,3)');
        expect(extension._clamp(2, 0, 1)).toBe(1);
    });

    it('renders picture text fills from cached images and ignores unsupported fill cases', () => {
        const extension = new FontAndBaseLine() as unknown as ITestableFontAndBaseLine;
        const TestContext = createContext();
        const image = document.createElement('canvas') as HTMLCanvasElement & {
            complete: boolean;
            naturalWidth: number;
            naturalHeight: number;
        };
        image.width = 4;
        image.height = 4;
        image.complete = true;
        image.naturalWidth = 4;
        image.naturalHeight = 4;
        extension._textFillImageCache.set('cached-image', image);
        extension.extensionOffset = {
            spanPointWithFont: Vector2.create(10, 24),
            spanStartPoint: Vector2.create(10, 24),
            centerPoint: Vector2.create(8, 8),
            renderConfig: {
                vertexAngle: 0,
                centerAngle: 0,
            },
        } as IExtensionConfig;

        extension.draw(TestContext, DEFAULT_SCALE, createGlyph('P', {
            ts: {
                fs: 12,
                cl: { rgb: '#111111' },
                textFill: {
                    type: 'picture',
                    picture: {
                        source: 'cached-image',
                        mode: 'tile',
                        scaleX: 0.5,
                        scaleY: 0.5,
                        offsetX: 1,
                        offsetY: 1,
                        opacity: 0.75,
                    },
                },
            } as IDocumentSkeletonGlyph['ts'],
        }));
        expect(TestContext.createPattern).toHaveBeenCalled();

        TestContext.fillText.mockClear();
        extension.draw(TestContext, DEFAULT_SCALE, createGlyph('N', {
            ts: {
                fs: 12,
                cl: { rgb: '#111111' },
                textFill: { type: 'none' },
            } as IDocumentSkeletonGlyph['ts'],
        }));
        expect(TestContext.fillText).not.toHaveBeenCalled();

        extension.extensionOffset = {
            spanPointWithFont: Vector2.create(10, 24),
            spanStartPoint: Vector2.create(10, 24),
            centerPoint: Vector2.create(8, 8),
            renderConfig: {
                vertexAngle: 90,
                centerAngle: 90,
            },
        } as IExtensionConfig;
        extension.draw(TestContext, DEFAULT_SCALE, createGlyph('V', {
            ts: {
                fs: 12,
                cl: { rgb: '#111111' },
                textFill: {
                    type: 'solid',
                    color: '#ff0000',
                },
            } as IDocumentSkeletonGlyph['ts'],
        }));
        expect(TestContext.fillText).toHaveBeenCalled();
    });

    it('loads picture text fills without forcing anonymous CORS mode', () => {
        const extension = new FontAndBaseLine() as unknown as ITestableFontAndBaseLine;
        const NativeImage = window.Image;
        class TestImage {
            complete = false;
            crossOrigin: string | null = null;
            src = '';
        }
        window.Image = TestImage as never;

        try {
            extension._getTextFillImage('https://github.com/dream-num.png');
            const image = extension._textFillImageCache.get('https://github.com/dream-num.png') as TestImage;

            expect(image.crossOrigin).toBeNull();
            expect(image.src).toBe('https://github.com/dream-num.png');
        } finally {
            window.Image = NativeImage;
        }
    });

    it('notifies the document when a picture text fill finishes loading', () => {
        const extension = new FontAndBaseLine() as unknown as ITestableFontAndBaseLine;
        const onTextFillImageLoaded = vi.fn();
        extension.parent = { onTextFillImageLoaded };
        const NativeImage = window.Image;
        class TestImage {
            complete = false;
            onload: (() => void) | null = null;
            src = '';
        }
        window.Image = TestImage as never;

        try {
            extension._getTextFillImage('https://example.com/text-fill.png');
            const image = extension._textFillImageCache.get('https://example.com/text-fill.png') as TestImage;

            expect(image.onload).toBeTypeOf('function');
            image.onload?.();
            expect(onTextFillImageLoaded).toHaveBeenCalledOnce();
        } finally {
            window.Image = NativeImage;
        }
    });

    it('notifies every document waiting for the same picture text fill', () => {
        const extension = new FontAndBaseLine() as unknown as ITestableFontAndBaseLine;
        const firstDocumentLoaded = vi.fn();
        const secondDocumentLoaded = vi.fn();
        const NativeImage = window.Image;
        class TestImage {
            complete = false;
            onload: (() => void) | null = null;
            src = '';
        }
        window.Image = TestImage as never;

        try {
            extension.parent = { onTextFillImageLoaded: firstDocumentLoaded };
            extension._getTextFillImage('https://example.com/shared-text-fill.png');
            extension.parent = { onTextFillImageLoaded: secondDocumentLoaded };
            extension._getTextFillImage('https://example.com/shared-text-fill.png');

            const image = extension._textFillImageCache.get('https://example.com/shared-text-fill.png') as TestImage;
            image.onload?.();

            expect(firstDocumentLoaded).toHaveBeenCalledOnce();
            expect(secondDocumentLoaded).toHaveBeenCalledOnce();
        } finally {
            window.Image = NativeImage;
        }
    });
});
