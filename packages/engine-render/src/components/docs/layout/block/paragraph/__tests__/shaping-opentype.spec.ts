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

import type { ISectionBreakConfig } from '../../../../../../basics/interfaces';
import type { DataStreamTreeNode } from '../../../../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../../../../view-model/document-view-model';
import type { IOpenTypeGlyphInfo } from '../../../shaping-engine/text-shaping';
import type { ILayoutContext } from '../../../tools';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Lang } from '../../../hyphenation/lang';

const SLOW_CI_TIMEOUT = 30_000;

function flattenShapedContent(shaped: Array<{ glyphs: Array<{ content: string }> }>) {
    return shaped.flatMap((item) => item.glyphs.map((glyph) => glyph.content)).join('');
}

function createViewModel(content: string): DocumentViewModel {
    return {
        getParagraph: () => ({
            startIndex: 0,
            paragraphStyle: {},
        }),
        getBody: () => ({
            dataStream: `${content}\r`,
            paragraphs: [{ startIndex: content.length }],
            textRuns: [],
        }),
        getTextRun: () => null,
        getCustomDecoration: () => null,
        getCustomRange: () => null,
        getCustomBlockWithoutSetCurrentIndex: () => null,
    } as unknown as DocumentViewModel;
}

function createContext(): ILayoutContext {
    return {
        hyphen: {
            hasPattern: () => false,
            loadPattern: () => Promise.resolve(),
        },
        languageDetector: {
            detect: () => Lang.UNKNOWN,
        },
    } as unknown as ILayoutContext;
}

function createParagraphNode(content: string): DataStreamTreeNode {
    return {
        startIndex: 0,
        endIndex: content.length,
    } as unknown as DataStreamTreeNode;
}

describe('shaping with useOpenType switch', () => {
    afterEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        vi.unmock('../../../shaping-engine/text-shaping');
        vi.unmock('../../../shaping-engine/font-library');
    });

    it('should not invoke textShape when useOpenType is false, and fallback when true but no glyph infos', async () => {
        const textShapeMock = vi.fn((): IOpenTypeGlyphInfo[] => []);

        vi.doMock('../../../shaping-engine/text-shaping', () => ({
            textShape: textShapeMock,
        }));

        vi.doMock('../../../shaping-engine/font-library', () => ({
            fontLibrary: {
                isReady: true,
            },
        }));

        const { shaping } = await import('../shaping');
        const content = 'Hello';
        const ctx = createContext();
        const viewModel = createViewModel(content);
        const paragraphNode = createParagraphNode(content);
        const sectionBreakConfig = {
            drawings: {},
        } as ISectionBreakConfig;

        const shapedWithoutOpenType = shaping(ctx, content, viewModel, paragraphNode, sectionBreakConfig, false);
        const shapedWithOpenTypeFallback = shaping(ctx, content, viewModel, paragraphNode, sectionBreakConfig, true);

        expect(textShapeMock).toHaveBeenCalledTimes(1);
        expect(flattenShapedContent(shapedWithoutOpenType)).toBe(content);
        expect(flattenShapedContent(shapedWithOpenTypeFallback)).toBe(content);
        expect(flattenShapedContent(shapedWithOpenTypeFallback)).toBe(flattenShapedContent(shapedWithoutOpenType));
    }, SLOW_CI_TIMEOUT);

    it('should use textShape glyph infos when useOpenType is true and glyph infos are available', async () => {
        const content = 'AB CD';
        const textShapeMock = vi.fn((): IOpenTypeGlyphInfo[] => {
            const chars = content.match(/[\s\S]/gu) ?? [];
            let start = 0;

            return chars.map((char) => {
                const info: IOpenTypeGlyphInfo = {
                    char,
                    start,
                    end: start + char.length,
                    glyph: null,
                    font: null,
                    kerning: 0,
                    boundingBox: null,
                };

                start += char.length;

                return info;
            });
        });

        vi.doMock('../../../shaping-engine/text-shaping', () => ({
            textShape: textShapeMock,
        }));

        vi.doMock('../../../shaping-engine/font-library', () => ({
            fontLibrary: {
                isReady: true,
            },
        }));

        const { shaping } = await import('../shaping');
        const ctx = createContext();
        const viewModel = createViewModel(content);
        const paragraphNode = createParagraphNode(content);
        const sectionBreakConfig = {
            drawings: {},
        } as ISectionBreakConfig;

        const shapedWithOpenType = shaping(ctx, content, viewModel, paragraphNode, sectionBreakConfig, true);

        expect(textShapeMock).toHaveBeenCalledTimes(1);
        expect(flattenShapedContent(shapedWithOpenType)).toBe(content);
    }, SLOW_CI_TIMEOUT);
});
