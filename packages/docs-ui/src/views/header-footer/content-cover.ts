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

import type { IDocumentData } from '@univerjs/core';
import type {
    Documents,
    IBoundRectNoAngle,
    IDocumentSkeletonCached,
    IDocumentSkeletonPage,
    IViewportInfo,
    Scene,
    UniverRenderingContext,
} from '@univerjs/engine-render';
import { BooleanNumber, DocumentFlavor } from '@univerjs/core';
import { getDrawingShapeKeyByDrawingSearch } from '@univerjs/drawing';
import { BaseObject, DocumentEditArea, PageLayoutType, RENDER_CLASS_TYPE, Vector2 } from '@univerjs/engine-render';

/** A paint-only overlay. It never participates in hit testing or selection. */
export class HeaderFooterContentCover extends BaseObject {
    color = '';

    constructor(key: string, private readonly _documents: Documents, private readonly _scene: Scene) {
        super(key);
        this.evented = false;
    }

    override render(ctx: UniverRenderingContext, viewport?: IViewportInfo): void {
        const skeleton = this._documents.getSkeleton();
        const viewModel = skeleton?.getViewModel();
        const data = skeleton?.getSkeletonData();
        if (!data || !viewModel || !this.color || viewModel.getEditArea() !== DocumentEditArea.BODY
            || viewModel.getDataModel().documentStyle.documentFlavor !== DocumentFlavor.TRADITIONAL) {
            return;
        }

        const content: IBoundRectNoAngle[] = [];
        this._collectStoryBounds(data, content, viewport);
        this._collectDrawingBounds(viewModel.getSnapshot(), content, viewport?.viewBound);
        if (content.length === 0) {
            return;
        }
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (const rect of content) {
            ctx.rect(rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top);
        }
        // One nonzero fill forms the union, so overlapping blocks are not faded twice.
        ctx.fill();
        ctx.restore();
        this.makeDirty(false);
    }

    private _collectStoryBounds(data: IDocumentSkeletonCached, content: IBoundRectNoAngle[], viewport?: IViewportInfo): void {
        const { pageLayoutType, pageMarginTop, pageMarginLeft } = this._documents.getOffsetConfig();
        let pageLeft = 0;
        let pageTop = 0;
        for (const page of data.pages) {
            if (!page.isLayoutPlaceholder && !page.isMaterializationPlaceholder
                && !this._documents.isSkipByDiffBounds(page, pageTop, pageLeft, viewport)) {
                const pageBounds = this._transformBounds({ left: pageLeft, top: pageTop, right: pageLeft + page.pageWidth, bottom: pageTop + page.pageHeight });
                const header = data.skeHeaders.get(page.headerId)?.get(page.pageWidth);
                const footer = data.skeFooters.get(page.footerId)?.get(page.pageWidth);
                const local: IBoundRectNoAngle[] = [];
                if (header) {
                    this._collectTextAndTables(header, pageLeft + page.marginLeft, pageTop + header.marginTop, local);
                }
                if (footer) {
                    this._collectTextAndTables(footer, pageLeft + page.marginLeft, pageTop + page.pageHeight - footer.height - footer.marginBottom, local);
                }
                for (const rect of local) {
                    this._appendClipped(content, this._transformBounds(rect), pageBounds);
                }
            }
            if (pageLayoutType === PageLayoutType.HORIZONTAL) {
                pageLeft += page.pageWidth + pageMarginLeft;
            } else {
                pageTop += page.pageHeight + pageMarginTop;
            }
        }
    }

    private _collectDrawingBounds(snapshot: IDocumentData, content: IBoundRectNoAngle[], viewport?: IBoundRectNoAngle): void {
        // Drawing render objects already contain page-relative anchoring, grouping,
        // crop and repeated-page transforms. Do not calculate a second placement.
        const unitId = snapshot.id;
        const prefix = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId: unitId, drawingId: '' });
        for (const object of this._scene.getAllObjects()) {
            if (!object.visible || object.classType === RENDER_CLASS_TYPE.GROUP || !object.oKey.startsWith(prefix)) {
                continue;
            }
            const drawingId = object.oKey.slice(prefix.length).split('#-#', 1)[0];
            const drawing = snapshot.drawings?.[drawingId];
            if (drawing?.isMultiTransform !== BooleanNumber.TRUE) {
                continue;
            }
            const effect = drawing.effectExtent;
            const rect = this._transformBounds({
                left: -(effect?.left ?? 0),
                top: -(effect?.top ?? 0),
                right: object.width + (effect?.right ?? 0),
                bottom: object.height + (effect?.bottom ?? 0),
            }, object.ancestorTransform);
            const clip = (object as { clipBounds?: { left: number; top: number; width: number; height: number } }).clipBounds;
            const clipped: IBoundRectNoAngle[] = [];
            this._appendClipped(clipped, rect, clip
                ? { left: clip.left, top: clip.top, right: clip.left + clip.width, bottom: clip.top + clip.height }
                : undefined);
            for (const bounds of clipped) {
                this._appendClipped(content, bounds, viewport);
            }
        }
    }

    private _transformBounds(rect: IBoundRectNoAngle, transform = this._documents.getOffsetConfig().documentTransform): IBoundRectNoAngle {
        const points = [
            [rect.left, rect.top],
            [rect.right, rect.top],
            [rect.right, rect.bottom],
            [rect.left, rect.bottom],
        ].map(([x, y]) => transform.applyPoint(new Vector2(x, y)));
        return {
            left: Math.min(...points.map((point) => point.x)),
            right: Math.max(...points.map((point) => point.x)),
            top: Math.min(...points.map((point) => point.y)),
            bottom: Math.max(...points.map((point) => point.y)),
        };
    }

    private _appendClipped(result: IBoundRectNoAngle[], rect: IBoundRectNoAngle, clip?: IBoundRectNoAngle): void {
        const bounds = clip
            ? {
                left: Math.max(rect.left, clip.left),
                right: Math.min(rect.right, clip.right),
                top: Math.max(rect.top, clip.top),
                bottom: Math.min(rect.bottom, clip.bottom),
            }
            : rect;
        if (Object.values(bounds).every(Number.isFinite) && bounds.right > bounds.left && bounds.bottom > bounds.top) {
            result.push(bounds);
        }
    }

    private _collectTextAndTables(page: IDocumentSkeletonPage, left: number, top: number, result: IBoundRectNoAngle[]): void {
        for (const section of page.sections) {
            for (const column of section.columns) {
                for (const line of column.lines) {
                    const lineTop = top + section.top + line.top + line.marginTop + line.paddingTop;
                    for (const divide of line.divides) {
                        for (const glyph of divide.glyphGroup) {
                            if (!Array.from(glyph.content).some((character) => character.charCodeAt(0) > 32 && character.trim()) || glyph.width <= 0) {
                                continue;
                            }
                            const x = left + column.left + divide.left + divide.paddingLeft + glyph.left + glyph.xOffset;
                            const baseline = lineTop + line.asc;
                            result.push({
                                left: x - 1,
                                right: x + Math.max(glyph.width, glyph.bBox.width) + 1,
                                top: Math.min(lineTop, baseline - glyph.bBox.aba) - 1,
                                bottom: Math.max(lineTop + line.lineHeight, baseline + glyph.bBox.abd) + 1,
                            });
                        }
                    }
                    if (line.borderTop || line.borderBottom || line.borderLeft || line.borderRight || line.borderBetween) {
                        result.push({ left: left + column.left, right: left + column.left + column.width, top: lineTop - 2, bottom: lineTop + line.lineHeight + 2 });
                    }
                }
            }
        }
        for (const table of page.skeTables.values()) {
            result.push({ left: left + table.left - 1, right: left + table.left + table.width + 1, top: top + table.top - 1, bottom: top + table.top + table.height + 1 });
        }
    }
}
