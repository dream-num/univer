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

import type { DocumentFlavor, ITable } from '@univerjs/core';
import type { IDocumentSkeletonPage } from '../../basics/i-document-skeleton-cached';
import { TableTextWrapType } from '@univerjs/core';
import { DocumentSkeletonPageType } from '../../basics/i-document-skeleton-cached';
import { getDocumentCompatibilityPolicy, shouldAllowImportedTableMarginOverflow } from './document-compatibility';

/** Shared by the canvas renderer and interactive table viewport provider. */
export function getDocsTableLayoutViewportWidth(
    page: Pick<IDocumentSkeletonPage, 'pageWidth' | 'marginLeft' | 'marginRight'> & Partial<Pick<IDocumentSkeletonPage, 'type'>>,
    tableLeft: number,
    tableSource: unknown,
    documentFlavor?: DocumentFlavor
): number {
    const { pageWidth, marginLeft = 0, marginRight = 0 } = page;
    const policy = getDocumentCompatibilityPolicy(documentFlavor);
    const allowMarginOverflow = shouldAllowImportedTableMarginOverflow(policy, tableSource);
    const width = allowMarginOverflow
        ? Math.max(0, pageWidth - Math.max(0, marginLeft + tableLeft))
        : Math.max(0, pageWidth - marginLeft - marginRight - tableLeft);
    const table = tableSource as Partial<ITable> | undefined;
    if (allowMarginOverflow && page.type === DocumentSkeletonPageType.CELL && table?.textWrap === TableTextWrapType.WRAP) {
        // A floating nested table owns its grid width, not its anchor cell's width.
        const gridWidth = table.tableColumns?.reduce((sum, column) => sum + column.size.width.v, 0) ?? 0;
        return Math.max(width, gridWidth);
    }
    return width;
}

export interface IDocsTableRenderViewport {
    contentWidth: number;
    leadingInsetLeft?: number;
    scrollLeft: number;
    trailingInsetRight?: number;
    viewportLeft?: number;
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

export function getDocsTableViewportLeft(
    viewport: IDocsTableRenderViewport | null | undefined,
    fallbackLeft: number,
    docsLeft = 0
): number {
    return viewport?.viewportLeft != null
        ? viewport.viewportLeft - docsLeft
        : fallbackLeft;
}

export function hasDocsTableHorizontalViewport(viewport: IDocsTableRenderViewport | null | undefined): viewport is IDocsTableRenderViewport {
    return viewport != null && getDocsTableVirtualContentWidth(viewport) > viewport.viewportWidth;
}
