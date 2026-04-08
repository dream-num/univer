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

import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { ZenEditorController } from '../zen-editor.controller';

describe('ZenEditorController', () => {
    it('should calculate page placement and sync viewport scroll', () => {
        const resize = vi.fn();
        const translateDoc = vi.fn();
        const translateBg = vi.fn();
        const scrollToBarPos = vi.fn();

        const controller = new ZenEditorController(
            { position$: new Subject() } as any,
            { getRenderById: vi.fn(() => null) } as any
        );

        (controller as any)._calculatePagePosition({
            document: {
                width: 200,
                height: 300,
                pageMarginLeft: 20,
                pageMarginTop: 10,
                translate: translateDoc,
            },
            scene: {
                getParent: () => ({ width: 600, height: 500 }),
                getAncestorScale: () => ({ scaleX: 1, scaleY: 1 }),
                resize,
                getViewport: () => ({
                    transScroll2ViewportScrollValue: (x: number) => ({ x }),
                    scrollToBarPos,
                }),
            },
            docBackground: {
                translate: translateBg,
            },
        });

        expect(resize).toHaveBeenCalled();
        expect(translateDoc).toHaveBeenCalled();
        expect(translateBg).toHaveBeenCalled();
        expect(scrollToBarPos).toHaveBeenCalled();

        controller.dispose();
    });

    it('should ignore invalid render state and still support scroll-to-top helper', () => {
        const scrollToRange = vi.fn();
        const controller = new ZenEditorController(
            { position$: new Subject() } as any,
            {
                getRenderById: () => ({
                    with: () => ({ scrollToRange }),
                }),
            } as any
        );

        const result = (controller as any)._calculatePagePosition({
            document: {
                width: Number.POSITIVE_INFINITY,
                height: Number.POSITIVE_INFINITY,
                pageMarginLeft: 20,
                pageMarginTop: 10,
                translate: vi.fn(),
            },
            scene: {
                getParent: () => null,
                getAncestorScale: () => ({ scaleX: 1, scaleY: 1 }),
                resize: vi.fn(),
                getViewport: vi.fn(),
            },
            docBackground: {
                translate: vi.fn(),
            },
        });

        expect(result).toBeUndefined();

        (controller as any)._scrollToTop();
        expect(scrollToRange).toHaveBeenCalledWith({ startOffset: 0, endOffset: 0 });

        controller.dispose();
    });
});
