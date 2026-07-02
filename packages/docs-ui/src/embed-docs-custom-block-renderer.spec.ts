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

/**
 * @vitest-environment jsdom
 */

import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import {
    blurHostDocSelectionWhenEmbedRuntimeEntersStage,
    createDocsTableLikeCustomBlockStage2WheelHandler,
    createDocsTableLikeCustomBlockWheelHandler,
    resolveDocsCustomBlockRuntimeOuterHeight,
    resolveDocsCustomBlockRuntimeViewportHeight,
    resolveDocsTableLikeCustomBlockRuntimeContentHeight,
    resolveDocsTableLikeCustomBlockRuntimeContentWidth,
    shouldSyncDocsTableLikeCustomBlockBleedOnScroll,
} from './EmbedDocsCustomBlockRenderer';

describe('createDocsTableLikeCustomBlockWheelHandler', () => {
    it('uses the latest bleed boundary when scrolling horizontally', () => {
        const live = createScrollableElement({
            clientWidth: 300,
            scrollWidth: 900,
        });
        let maxScrollLeft = 0;
        const onWheel = createDocsTableLikeCustomBlockWheelHandler({
            getLive: () => live,
            getMaxScrollLeft: () => maxScrollLeft,
        });

        maxScrollLeft = 210;
        const event = new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            deltaX: 120,
        });

        onWheel(event);

        expect(live.scrollLeft).toBe(120);
        expect(event.defaultPrevented).toBe(true);
    });

    it('uses the live element native scroll range when no explicit max is provided', () => {
        const live = createScrollableElement({
            clientWidth: 300,
            scrollWidth: 900,
        });
        const onWheel = createDocsTableLikeCustomBlockWheelHandler({
            getLive: () => live,
        });

        const event = new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            deltaX: 600,
        });

        onWheel(event);

        expect(live.scrollLeft).toBe(600);
        expect(event.defaultPrevented).toBe(true);
    });
});

describe('createDocsTableLikeCustomBlockStage2WheelHandler', () => {
    it('scrolls the custom block live viewport for stage2 horizontal wheel gestures', () => {
        const live = createScrollableElement({
            clientWidth: 300,
            scrollWidth: 900,
        });
        const onWheel = createDocsTableLikeCustomBlockStage2WheelHandler({
            getLive: () => live,
            getMaxScrollLeft: () => 210,
            getStage: () => 'stage2',
        });

        const event = new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            deltaX: 120,
            deltaY: 4,
        });

        onWheel(event);

        expect(live.scrollLeft).toBe(120);
        expect(event.defaultPrevented).toBe(true);
    });

    it('leaves inactive and vertical wheel gestures to the existing handlers', () => {
        const live = createScrollableElement({
            clientWidth: 300,
            scrollWidth: 900,
        });
        const onWheel = createDocsTableLikeCustomBlockStage2WheelHandler({
            getLive: () => live,
            getMaxScrollLeft: () => 210,
            getStage: () => 'inactive',
        });

        onWheel(new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            deltaX: 120,
            deltaY: 4,
        }));
        onWheel(new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            deltaX: 4,
            deltaY: 120,
        }));

        expect(live.scrollLeft).toBe(0);
    });
});

describe('resolveDocsCustomBlockRuntimeViewportHeight', () => {
    it('uses the visible runtime viewport height for sheet-like docs custom blocks', () => {
        expect(resolveDocsCustomBlockRuntimeViewportHeight({
            contentHeight: 1087,
            sheetLike: true,
            viewportHeight: 887,
        })).toBe(887);
    });

    it('keeps explicit viewport height for non-sheet-like custom blocks', () => {
        expect(resolveDocsCustomBlockRuntimeViewportHeight({
            contentHeight: 720,
            sheetLike: false,
            viewportHeight: 405,
        })).toBe(405);
    });
});

describe('resolveDocsCustomBlockRuntimeOuterHeight', () => {
    it('reserves vertical space for the floating menu above sheet-like docs custom blocks', () => {
        expect(resolveDocsCustomBlockRuntimeOuterHeight({
            contentHeight: 480,
            menuInsetTop: 52,
            sheetLike: true,
        })).toBe(532);
    });

    it('keeps fixed-size non-sheet-like docs custom blocks at their existing outer height', () => {
        expect(resolveDocsCustomBlockRuntimeOuterHeight({
            contentHeight: 405,
            menuInsetTop: 52,
            sheetLike: false,
        })).toBe(405);
    });
});

describe('docs custom block CSS', () => {
    const cssPath = existsSync('src/embed-docs-custom-block.css')
        ? 'src/embed-docs-custom-block.css'
        : 'packages/docs-ui/src/embed-docs-custom-block.css';
    const css = readFileSync(cssPath, 'utf8');

    it('centers every product floating menu above docs custom block containers', () => {
        expect(css).toContain('.univer-docs-embed-floating-menu');
        expect(css).toContain('.univer-sheet-embed-floating-menu');
        expect(css).toContain('.univer-base-embed-floating-menu');
        expect(css).toContain('.univer-slide-embed-floating-menu');
        expect(css).toContain('left: 50%');
        expect(css).toContain('transform: translateX(-50%)');
    });

    it('removes the embed content border only for sheet-like docs custom blocks', () => {
        expect(css).toContain(".univer-embed-docs-custom-block[data-embed-docs-custom-block-sheet-like='true']");
        expect(css).toContain('.univer-embed-float-dom__content::after');
        expect(css).toContain('border: 0');
    });
});

describe('resolveDocsTableLikeCustomBlockRuntimeContentHeight', () => {
    it('keeps sheet-like docs custom block content visible without runtime viewport props', () => {
        expect(resolveDocsTableLikeCustomBlockRuntimeContentHeight(undefined)).toBe(480);
        expect(resolveDocsTableLikeCustomBlockRuntimeContentHeight(0)).toBe(480);
    });

    it('uses authoritative measured content height when available', () => {
        expect(resolveDocsTableLikeCustomBlockRuntimeContentHeight(1087)).toBe(1087);
    });
});

describe('resolveDocsTableLikeCustomBlockRuntimeContentWidth', () => {
    it('uses authoritative width without measuring the runtime DOM', () => {
        let measured = false;

        const width = resolveDocsTableLikeCustomBlockRuntimeContentWidth(1280, () => {
            measured = true;
            return 640;
        });

        expect(width).toBe(1280);
        expect(measured).toBe(false);
    });

    it('measures the runtime DOM when authoritative width is unavailable', () => {
        expect(resolveDocsTableLikeCustomBlockRuntimeContentWidth(undefined, () => 640)).toBe(640);
        expect(resolveDocsTableLikeCustomBlockRuntimeContentWidth(0, () => 640)).toBe(640);
    });
});

describe('shouldSyncDocsTableLikeCustomBlockBleedOnScroll', () => {
    it('ignores scroll events from the inner live runtime', () => {
        const root = document.createElement('div');
        const live = document.createElement('div');
        root.appendChild(live);

        expect(shouldSyncDocsTableLikeCustomBlockBleedOnScroll(root, live)).toBe(false);
    });

    it('keeps syncing when an outer scrolling ancestor changes geometry', () => {
        const root = document.createElement('div');
        const outer = document.createElement('div');
        outer.appendChild(root);

        expect(shouldSyncDocsTableLikeCustomBlockBleedOnScroll(root, outer)).toBe(true);
        expect(shouldSyncDocsTableLikeCustomBlockBleedOnScroll(root, window)).toBe(true);
    });
});

describe('blurHostDocSelectionWhenEmbedRuntimeEntersStage', () => {
    it('blurs host doc selection when a docs custom block enters interactive stage2', () => {
        const blur = vi.fn();
        const renderManagerService = {
            getRenderById: vi.fn(() => ({
                with: vi.fn(() => ({ blur })),
            })),
        };

        blurHostDocSelectionWhenEmbedRuntimeEntersStage(renderManagerService as never, 'host-doc', 'stage2');

        expect(renderManagerService.getRenderById).toHaveBeenCalledWith('host-doc');
        expect(blur).toHaveBeenCalledTimes(1);
    });

    it('keeps host doc selection unchanged before the custom block becomes interactive', () => {
        const blur = vi.fn();
        const renderManagerService = {
            getRenderById: vi.fn(() => ({
                with: vi.fn(() => ({ blur })),
            })),
        };

        blurHostDocSelectionWhenEmbedRuntimeEntersStage(renderManagerService as never, 'host-doc', 'stage1');

        expect(renderManagerService.getRenderById).not.toHaveBeenCalled();
        expect(blur).not.toHaveBeenCalled();
    });
});

function createScrollableElement(params: {
    clientHeight?: number;
    clientWidth?: number;
    scrollHeight?: number;
    scrollWidth?: number;
}): HTMLElement {
    const element = document.createElement('div');
    Object.defineProperties(element, {
        clientHeight: { configurable: true, value: params.clientHeight ?? 300 },
        clientWidth: { configurable: true, value: params.clientWidth ?? 300 },
        scrollHeight: { configurable: true, value: params.scrollHeight ?? params.clientHeight ?? 300 },
        scrollWidth: { configurable: true, value: params.scrollWidth ?? params.clientWidth ?? 300 },
    });

    return element;
}
