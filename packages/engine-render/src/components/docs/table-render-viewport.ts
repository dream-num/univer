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

export interface IDocsTableRenderViewport {
    contentWidth: number;
    leadingInsetLeft?: number;
    scrollLeft: number;
    trailingInsetRight?: number;
    viewportWidth: number;
}

export type DocsTableRenderViewportProvider = (unitId: string, tableId: string) => IDocsTableRenderViewport | null | undefined;

let docsTableRenderViewportProvider: DocsTableRenderViewportProvider | null = null;

export function setDocsTableRenderViewportProvider(provider: DocsTableRenderViewportProvider | null): void {
    docsTableRenderViewportProvider = provider;
}

export function getDocsTableRenderViewport(unitId: string, tableId: string): IDocsTableRenderViewport | null {
    return docsTableRenderViewportProvider?.(unitId, tableId) ?? null;
}

export function getDocsTableVirtualContentWidth(viewport: IDocsTableRenderViewport): number {
    return (viewport.leadingInsetLeft ?? 0) + viewport.contentWidth + (viewport.trailingInsetRight ?? 0);
}

export function hasDocsTableHorizontalViewport(viewport: IDocsTableRenderViewport | null | undefined): viewport is IDocsTableRenderViewport {
    return viewport != null && getDocsTableVirtualContentWidth(viewport) > viewport.viewportWidth;
}
