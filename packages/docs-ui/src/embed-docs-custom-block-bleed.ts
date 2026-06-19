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

const DOCS_CUSTOM_BLOCK_VIEWPORT_INSET = 10;

export interface IDocsCustomBlockBleedViewport {
    bleedLeft: number;
    bleedRight: number;
    bleedWidth: number;
    contentWidth: number;
    virtualWidth: number;
}

export interface IDocsCustomBlockBleedViewportHint {
    bleedLeft?: number;
    bleedWidth?: number;
}

export function createDefaultDocsTableLikeCustomBlockBleedViewport(): IDocsCustomBlockBleedViewport {
    if (typeof window === 'undefined') {
        return { bleedLeft: 0, bleedRight: 0, bleedWidth: 1, contentWidth: 1, virtualWidth: 1 };
    }

    const bleedWidth = Math.max(1, window.innerWidth - DOCS_CUSTOM_BLOCK_VIEWPORT_INSET * 2);
    return {
        bleedLeft: 0,
        bleedRight: 0,
        bleedWidth,
        contentWidth: 1,
        virtualWidth: bleedWidth,
    };
}

export function resolveDocsTableLikeCustomBlockBleedViewport(root: HTMLElement, contentWidth: number, hint?: IDocsCustomBlockBleedViewportHint): IDocsCustomBlockBleedViewport {
    const rootRect = root.getBoundingClientRect();
    const rootWidth = Math.max(1, rootRect.width);
    const normalizedContentWidth = Math.max(1, contentWidth);
    const hintedBleedLeft = hint?.bleedLeft;
    const hintedBleedWidth = hint?.bleedWidth;
    if (Number.isFinite(hintedBleedWidth) && (hintedBleedWidth ?? 0) > 0) {
        const bleedLeft = Math.max(0, hintedBleedLeft ?? 0);
        const bleedWidth = Math.max(1, hintedBleedWidth!);
        return {
            bleedLeft,
            bleedRight: Math.max(0, bleedWidth - bleedLeft - rootWidth),
            bleedWidth,
            contentWidth: normalizedContentWidth,
            virtualWidth: Math.max(bleedWidth, bleedLeft + normalizedContentWidth),
        };
    }

    if (normalizedContentWidth <= rootWidth) {
        return {
            bleedLeft: 0,
            bleedRight: 0,
            bleedWidth: rootWidth,
            contentWidth: normalizedContentWidth,
            virtualWidth: rootWidth,
        };
    }

    const bounds = resolveDocsTableLikeCustomBlockBleedBounds(root);
    const viewportLeft = bounds.left + DOCS_CUSTOM_BLOCK_VIEWPORT_INSET;
    const viewportWidth = Math.max(1, bounds.width - DOCS_CUSTOM_BLOCK_VIEWPORT_INSET * 2);
    const bleedLeft = Math.max(0, rootRect.left - viewportLeft);
    const bleedRight = Math.max(0, viewportLeft + viewportWidth - rootRect.right);

    return {
        bleedLeft,
        bleedRight,
        bleedWidth: viewportWidth,
        contentWidth: normalizedContentWidth,
        virtualWidth: Math.max(viewportWidth, bleedLeft + normalizedContentWidth),
    };
}

export function resolveDocsTableLikeCustomBlockContentWidth(authoritativeContentWidth: number | undefined, fallbackContentWidth: number): number {
    return Number.isFinite(authoritativeContentWidth) && (authoritativeContentWidth ?? 0) > 0
        ? authoritativeContentWidth!
        : Math.max(1, fallbackContentWidth);
}

export function resolveDocsTableLikeCustomBlockContentHeight(authoritativeContentHeight: number | undefined, fallbackContentHeight: number): number {
    return Number.isFinite(authoritativeContentHeight) && (authoritativeContentHeight ?? 0) > 0
        ? authoritativeContentHeight!
        : Math.max(1, fallbackContentHeight);
}

function resolveDocsTableLikeCustomBlockBleedBounds(root: HTMLElement): { left: number; width: number } {
    const clippingAncestor = findClippingAncestor(root);
    if (clippingAncestor) {
        const rect = clippingAncestor.getBoundingClientRect();
        if (Number.isFinite(rect.width) && rect.width > 0) {
            return { left: rect.left, width: rect.width };
        }
    }

    return {
        left: 0,
        width: typeof window === 'undefined' ? 1 : Math.max(1, window.innerWidth),
    };
}

function findClippingAncestor(root: HTMLElement): HTMLElement | null {
    let current = root.parentElement;
    while (current && current !== document.body && current !== document.documentElement) {
        if (clipsOverflow(current)) {
            return current;
        }
        current = current.parentElement;
    }

    return null;
}

function clipsOverflow(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return hasClippingOverflow(style.overflow) ||
        hasClippingOverflow(style.overflowX) ||
        hasClippingOverflow(style.overflowY);
}

function hasClippingOverflow(value: string): boolean {
    return value === 'hidden' || value === 'auto' || value === 'scroll' || value === 'clip';
}
