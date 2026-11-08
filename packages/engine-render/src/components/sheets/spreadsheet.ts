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

import type { IPosition, IRange, Nullable } from '@univerjs/core';
import { BooleanNumber, sortRules, Tools } from '@univerjs/core';
import type { IBoundRectNoAngle, IViewportInfo, Vector2 } from '../../basics/vector2';
import type { UniverRenderingContext2D } from '../../context';
import type { Engine } from '../../engine';
import type { Scene } from '../../scene';
import type { SceneViewer } from '../../scene-viewer';
import type { IDrawInfo } from '../extension';
import type { Background } from './extensions/background';
import type { Border } from './extensions/border';
import type { Font } from './extensions/font';
import type { IPaintForRefresh, IPaintForScrolling } from './interfaces';
import type { SpreadsheetSkeleton } from './sheet.render-skeleton';
import { BORDER_TYPE, FIX_ONE_PIXEL_BLUR_OFFSET, RENDER_CLASS_TYPE } from '../../basics/const';
import { getColor } from '../../basics/tools';
import { Canvas } from '../../canvas';
import { Documents } from '../docs/document';
import { FontCache } from '../docs/layout/shaping-engine/font-cache';
import { SpreadsheetExtensionRegistry } from '../extension';
import { sheetContentViewportKeys, sheetHeaderViewportKeys } from './constants';
import { RenderPrimitiveCache } from './extensions/render-primitive-cache';
import { SHEET_EXTENSION_PREFIX, SHEET_EXTENSION_TYPE } from './extensions/sheet-extension';
import { SHEET_VIEWPORT_KEY } from './interfaces';
import { SheetComponent } from './sheet-component';

const OBJECT_KEY = '__SHEET_EXTENSION_FONT_DOCUMENT_INSTANCE__';
const MERGE_REPAIR_CACHE_REFRESH_RATIO = 0.6;
const SCROLL_REPAIR_INK_HALO = 2;
const BORDER_INK_HALO = 2;
const BORDER_EDGE_KEYS = new Set<string>([BORDER_TYPE.TOP, BORDER_TYPE.BOTTOM, BORDER_TYPE.LEFT, BORDER_TYPE.RIGHT]);
const CUSTOM_EXTENSION_KEY = 'DefaultCustomExtension';
const MARKER_EXTENSION_KEY = 'DefaultMarkerExtension';
const RANGE_PROTECTION_VIEW_EXTENSION_KEY = 'RANGE_PROTECTION_CAN_VIEW_RENDER_EXTENSION_KEY';
const RANGE_PROTECTION_HIDDEN_EXTENSION_KEY = 'RANGE_PROTECTION_CAN_NOT_VIEW_RENDER_EXTENSION_KEY';
const PRINTING_GRIDLINES_COLOR = getColor([214, 216, 219]);

interface IRepaintBound {
    bound: IBoundRectNoAngle;
    repairsMerge: boolean;
}

interface IScrollCacheState {
    canvas: Canvas;
    width: number;
    height: number;
    pixelRatio: number;
    scaleX: number;
    scaleY: number;
    left: number;
    top: number;
    axisAligned: boolean;
}

interface ISparseExtensionFeatureFlags {
    hasCustomRender: boolean;
    hasMarkers: boolean;
    hasSelectionProtection: boolean;
    customRenderRanges: IRange[];
    markerRanges: IRange[];
    selectionProtectionRanges: IRange[];
}

function pushSparseCellRange(ranges: IRange[], row: number, col: number) {
    const last = ranges[ranges.length - 1];
    if (last && last.startRow === row && last.endRow === row && last.endColumn + 1 === col) {
        last.endColumn = col;
        return;
    }

    ranges.push({
        startRow: row,
        endRow: row,
        startColumn: col,
        endColumn: col,
    });
}

function scanSparseExtensionFeatures(
    spreadsheetSkeleton: SpreadsheetSkeleton,
    ranges: IRange[],
    includeMergedAnchors: boolean
): ISparseExtensionFeatureFlags | null {
    const { worksheet } = spreadsheetSkeleton;
    if (!worksheet || !ranges.length) {
        return null;
    }
    const flags: ISparseExtensionFeatureFlags = {
        hasCustomRender: false,
        hasMarkers: false,
        hasSelectionProtection: false,
        customRenderRanges: [],
        markerRanges: [],
        selectionProtectionRanges: [],
    };

    const visitCell = (row: number, col: number, renderRow = row, renderCol = col) => {
        const cachedCell = spreadsheetSkeleton.stylesCache.fontMatrix.getValue(row, col)?.cellData as Nullable<{
            customRender?: unknown[];
            markers?: unknown;
            selectionProtection?: unknown[];
        }>;
        const cell = cachedCell ?? (worksheet.getCell(row, col) as typeof cachedCell);
        if (!cell) {
            return;
        }
        if (cell.customRender?.length) {
            flags.hasCustomRender = true;
            pushSparseCellRange(flags.customRenderRanges, renderRow, renderCol);
        }
        if (cell.markers) {
            flags.hasMarkers = true;
            pushSparseCellRange(flags.markerRanges, renderRow, renderCol);
        }
        if (cell.selectionProtection?.length) {
            flags.hasSelectionProtection = true;
            pushSparseCellRange(flags.selectionProtectionRanges, renderRow, renderCol);
        }
    };

    for (const range of ranges) {
        for (let row = range.startRow; row <= range.endRow; row++) {
            if (!worksheet.getRowVisible(row)) {
                continue;
            }
            for (let col = range.startColumn; col <= range.endColumn; col++) {
                if (worksheet.getColVisible(col)) {
                    visitCell(row, col);
                }
            }
        }
        if (!includeMergedAnchors) {
            continue;
        }
        for (const merge of worksheet.getMergedCellRange(range.startRow, range.startColumn, range.endRow, range.endColumn)) {
            if (merge.startRow >= range.startRow && merge.startColumn >= range.startColumn
                && worksheet.getRowVisible(merge.startRow) && worksheet.getColVisible(merge.startColumn)) {
                continue;
            }
            let row = Math.max(range.startRow, merge.startRow);
            let col = Math.max(range.startColumn, merge.startColumn);
            const endRow = Math.min(range.endRow, merge.endRow);
            const endColumn = Math.min(range.endColumn, merge.endColumn);
            while (row <= endRow && !worksheet.getRowVisible(row)) {
                row++;
            }
            while (col <= endColumn && !worksheet.getColVisible(col)) {
                col++;
            }
            if (row <= endRow && col <= endColumn) {
                visitCell(merge.startRow, merge.startColumn, row, col);
            }
        }
    }

    return flags;
}

function shouldSkipSparseExtension(uKey: string, flags: ISparseExtensionFeatureFlags | null) {
    if (!flags) {
        return false;
    }

    switch (uKey) {
        case CUSTOM_EXTENSION_KEY:
            return !flags.hasCustomRender;
        case MARKER_EXTENSION_KEY:
            return !flags.hasMarkers;
        case RANGE_PROTECTION_VIEW_EXTENSION_KEY:
        case RANGE_PROTECTION_HIDDEN_EXTENSION_KEY:
            return !flags.hasSelectionProtection;
        default:
            return false;
    }
}

function hasSparseExtension(extensions: Array<{ uKey: string }>) {
    return extensions.some((extension) => {
        switch (extension.uKey) {
            case CUSTOM_EXTENSION_KEY:
            case MARKER_EXTENSION_KEY:
            case RANGE_PROTECTION_VIEW_EXTENSION_KEY:
            case RANGE_PROTECTION_HIDDEN_EXTENSION_KEY:
                return true;
            default:
                return false;
        }
    });
}

function getSparseExtensionDiffRanges(uKey: string, flags: ISparseExtensionFeatureFlags | null, diffRanges: IRange[]) {
    if (!flags) {
        return diffRanges;
    }

    switch (uKey) {
        case CUSTOM_EXTENSION_KEY:
            return flags.customRenderRanges;
        case MARKER_EXTENSION_KEY:
            return flags.markerRanges;
        case RANGE_PROTECTION_VIEW_EXTENSION_KEY:
        case RANGE_PROTECTION_HIDDEN_EXTENSION_KEY:
            return flags.selectionProtectionRanges;
        default:
            return diffRanges;
    }
}

interface IBlitRect {
    sx: number;
    sy: number;
    sw: number;
    sh: number;
    dx: number;
    dy: number;
    dw: number;
    dh: number;
}

function boundsOverlap(a: IBoundRectNoAngle, b: IBoundRectNoAngle) {
    return a.left <= b.right && a.right >= b.left && a.top <= b.bottom && a.bottom >= b.top;
}

function getIntersectBound(a: IBoundRectNoAngle, b: IBoundRectNoAngle): Nullable<IBoundRectNoAngle> {
    const left = Math.max(a.left, b.left);
    const right = Math.min(a.right, b.right);
    const top = Math.max(a.top, b.top);
    const bottom = Math.min(a.bottom, b.bottom);
    return right > left && bottom > top ? { left, right, top, bottom } : null;
}

function getOutwardRoundedBound(bound: IBoundRectNoAngle): IBoundRectNoAngle {
    return {
        left: Math.floor(bound.left),
        top: Math.floor(bound.top),
        right: Math.ceil(bound.right),
        bottom: Math.ceil(bound.bottom),
    };
}

function getClippedBoundArea(bound: IBoundRectNoAngle, clipBound: IBoundRectNoAngle) {
    const width = Math.max(0, Math.min(bound.right, clipBound.right) - Math.max(bound.left, clipBound.left));
    const height = Math.max(0, Math.min(bound.bottom, clipBound.bottom) - Math.max(bound.top, clipBound.top));
    return width * height;
}

function exceedsMergeRepairThreshold(cacheBound: IBoundRectNoAngle, repaintBounds: IRepaintBound[], hasMergeRepair: boolean) {
    if (!hasMergeRepair) {
        return false;
    }
    const cacheArea = getClippedBoundArea(cacheBound, cacheBound);
    const repaintArea = repaintBounds.reduce((area, repaintBound) => area + getClippedBoundArea(repaintBound.bound, cacheBound), 0);
    return repaintArea >= cacheArea * MERGE_REPAIR_CACHE_REFRESH_RATIO;
}

/**
 * Clip a blit source rectangle to the source canvas bounds and shrink the destination
 * rectangle proportionally, as required by the HTML spec:
 * https://html.spec.whatwg.org/multipage/canvas.html#drawing-images
 * ("the source rectangle must be clipped to the source image and the destination
 * rectangle must be clipped in the same proportion").
 *
 * renderByViewports() blits a region larger than the cache canvas (viewport size plus
 * the row/column header margins, while frozen viewports use bufferEdge=0 on their long
 * axis) and relies on this behavior: compliant browsers treat the overflow as
 * transparent padding. WebKit only implements it since Safari 18 ("Fixed drawImage to
 * not alter the input source or the destination rectangles"), so on Safari < 18 the
 * overflowed blit is dropped or distorted and frozen viewports lose their content.
 *
 * Returns null when the source rectangle lies entirely outside the canvas, meaning
 * nothing visible remains to be drawn.
 */
function clipBlitRectToBounds(rect: IBlitRect, sourceWidth: number, sourceHeight: number): Nullable<IBlitRect> {
    let { sx, sy, sw, sh, dx, dy, dw, dh } = rect;

    if (sx < 0) {
        const cut = Math.min(-sx, sw);
        const ratio = cut / sw;
        dx += dw * ratio;
        dw -= dw * ratio;
        sw -= cut;
        sx = 0;
    }
    if (sy < 0) {
        const cut = Math.min(-sy, sh);
        const ratio = cut / sh;
        dy += dh * ratio;
        dh -= dh * ratio;
        sh -= cut;
        sy = 0;
    }
    if (sx + sw > sourceWidth) {
        const clamped = Math.max(sourceWidth - sx, 0);
        dw *= clamped / sw;
        sw = clamped;
    }
    if (sy + sh > sourceHeight) {
        const clamped = Math.max(sourceHeight - sy, 0);
        dh *= clamped / sh;
        sh = clamped;
    }

    if (sw <= 0 || sh <= 0) {
        return null;
    }

    return { sx, sy, sw, sh, dx, dy, dw, dh };
}

export class Spreadsheet extends SheetComponent {
    override viewportCacheReusable = this.constructor === Spreadsheet;

    override onViewportCacheReuse(viewportInfo: IViewportInfo): void {
        if (!sheetHeaderViewportKeys.includes(viewportInfo.viewportKey as SHEET_VIEWPORT_KEY)) {
            super.onViewportCacheReuse(viewportInfo);
        }
    }

    private _scrollBufferCanvases = new Map<string, Canvas>();
    private _scrollCacheStates = new Map<string, IScrollCacheState>();
    private readonly _gridlineCache = new RenderPrimitiveCache();
    private _backgroundExtension!: Background;

    private _borderExtension!: Border;

    private _fontExtension!: Font;

    private _refreshIncrementalState = false;

    private _dirtyBounds: IBoundRectNoAngle[] = [];

    private _forceDisableGridlines = false;

    private _documents: Documents = new Documents(OBJECT_KEY, undefined, {
        pageMarginLeft: 0,
        pageMarginTop: 0,
    });

    isPrinting = false;

    constructor(
        oKey: string,
        spreadsheetSkeleton?: SpreadsheetSkeleton,
        private _allowCache: boolean = true
    ) {
        super(oKey, spreadsheetSkeleton);
        this.disposeWithMe(this._gridlineCache);
        this._initialDefaultExtension();
        this.makeDirty(true);
    }

    get backgroundExtension() {
        return this._backgroundExtension;
    }

    get borderExtension() {
        return this._borderExtension;
    }

    get fontExtension() {
        return this._fontExtension;
    }

    override getDocuments() {
        return this._documents;
    }

    get allowCache() {
        return this._allowCache;
    }

    get forceDisableGridlines() {
        return this._forceDisableGridlines;
    }

    override dispose() {
        super.dispose();
        this._documents?.dispose();
        this._scrollBufferCanvases.forEach((canvas) => canvas.dispose());
        this._scrollBufferCanvases.clear();
        this._scrollCacheStates.clear();

        // TODO: fix memory leak without reassigning these properties
        this._documents = null as unknown as Documents;
        this._backgroundExtension = null as unknown as Background;
        this._borderExtension = null as unknown as Border;
        this._fontExtension = null as unknown as Font;
    }

    /**
     * draw by viewport
     * @param ctx
     * @param viewportInfo
     */
    override draw(ctx: UniverRenderingContext2D, viewportInfo: IViewportInfo, isMergeRepair = false, textClipBound?: IBoundRectNoAngle) {
        const spreadsheetSkeleton = this.getSkeleton();
        if (!spreadsheetSkeleton) {
            return;
        }
        const hasMergeData = spreadsheetSkeleton.worksheet.getMergeData().length > 0;
        const parentScale = this.getParentScale();

        const diffRanges = this._refreshIncrementalState && viewportInfo.diffBounds
            ? viewportInfo.diffBounds?.map((bound) => spreadsheetSkeleton.getRangeByViewBound(getOutwardRoundedBound(bound)))
            : [];

        const cacheRange = spreadsheetSkeleton.getCacheRangeByViewport(viewportInfo, this.isPrinting);
        const viewRanges = this._refreshIncrementalState && diffRanges.length > 0
            ? diffRanges
            : [cacheRange];
        const overflowSafeViewRanges = this._refreshIncrementalState && diffRanges.length > 0
            ? diffRanges.map((range) => ({
                ...range,
                startColumn: cacheRange.startColumn,
                endColumn: cacheRange.endColumn,
            }))
            : viewRanges;
        const borderViewRanges = this._refreshIncrementalState && diffRanges.length > 0
            ? this._getBorderRenderRanges(spreadsheetSkeleton, viewportInfo, overflowSafeViewRanges, hasMergeData)
            : viewRanges;
        const extensions = this.getExtensionsByOrder();
        const backgroundExtensions = extensions.filter((extension) => extension.type === SHEET_EXTENSION_TYPE.BACKGROUND);
        const gridExtensions = extensions.filter((extension) => extension.type !== SHEET_EXTENSION_TYPE.BACKGROUND);
        const sparseExtensionFeatures = hasSparseExtension(gridExtensions)
            ? scanSparseExtensionFeatures(spreadsheetSkeleton, viewRanges, isMergeRepair)
            : null;
        // At this moment, ctx.transform is at topLeft of sheet content, cell(0, 0)

        const scene = this.getScene();
        const drawBackgroundExtensions = (backgroundDiffRanges: IRange[], backgroundViewRanges: IRange[]) => {
            for (const extension of backgroundExtensions) {
                const timeKey = `${SHEET_EXTENSION_PREFIX}${extension.uKey}`;
                const st = Tools.now();
                extension.draw(ctx, parentScale, spreadsheetSkeleton, backgroundDiffRanges, {
                    viewRanges: backgroundViewRanges,
                    checkOutOfViewBound: true,
                    hasMergeData,
                    viewportKey: viewportInfo.viewportKey,
                    viewBound: viewportInfo.cacheBound,
                    diffBounds: viewportInfo.diffBounds,
                } as IDrawInfo);
                const cost = Tools.now() - st;
                this.addRenderFrameTimeMetricToScene(timeKey, cost, scene);
            }
        };

        drawBackgroundExtensions(diffRanges, viewRanges);
        // Overwrite opaque interiors only inside the offscreen cache's integer device clip.
        const repairNativeGridlines = !!ctx._context && ctx.__mode !== 'printing' && ctx.getSystemType() === 'Linux'
            && this.allowCache && ctx._context.canvas === (scene?.getViewport(viewportInfo.viewportKey)?.canvas ?? viewportInfo.cacheCanvas)?.getCanvasEle();
        this._gridlineCache.draw(ctx, () => {
            this._drawAuxiliary(ctx, hasMergeData, (clearedRanges) => {
                drawBackgroundExtensions(clearedRanges, clearedRanges);
            }, repairNativeGridlines);
        });

        for (const extension of gridExtensions) {
            if (shouldSkipSparseExtension(extension.uKey, sparseExtensionFeatures)) {
                continue;
            }

            let extensionViewRanges = viewRanges;
            if (extension === this._fontExtension) {
                extensionViewRanges = overflowSafeViewRanges;
            } else if (extension === this._borderExtension) {
                extensionViewRanges = borderViewRanges;
            }
            const extensionDiffRanges = extension === this._borderExtension && diffRanges.length
                ? borderViewRanges
                : getSparseExtensionDiffRanges(extension.uKey, sparseExtensionFeatures, diffRanges);
            const timeKey = `${SHEET_EXTENSION_PREFIX}${extension.uKey}`;
            const st = Tools.now();
            extension.draw(ctx, parentScale, spreadsheetSkeleton, extensionDiffRanges, {
                viewRanges: extensionViewRanges,
                checkOutOfViewBound: true,
                hasMergeData,
                viewportKey: viewportInfo.viewportKey,
                viewBound: viewportInfo.cacheBound,
                diffBounds: viewportInfo.diffBounds,
                textClipBound,
            } as IDrawInfo);
            const cost = Tools.now() - st;
            this.addRenderFrameTimeMetricToScene(timeKey, cost, scene);
        }
    }

    private _getBorderRenderRanges(
        skeleton: SpreadsheetSkeleton,
        viewportInfo: IViewportInfo,
        overflowSafeRanges: IRange[],
        hasMergeData: boolean
    ): IRange[] {
        if (this.isPrinting) {
            return overflowSafeRanges;
        }
        // Three-unit thick borders and double edges can reach beyond their owning cell.
        const ranges = viewportInfo.diffBounds!.map((bound) => skeleton.getRangeByViewBound(getOutwardRoundedBound({
            left: bound.left - BORDER_INK_HALO,
            top: bound.top - BORDER_INK_HALO,
            right: bound.right + BORDER_INK_HALO,
            bottom: bound.bottom + BORDER_INK_HALO,
        })));
        if (hasMergeData) {
            for (const range of ranges) {
                const merges = skeleton.worksheet.getMergedCellRange(range.startRow, range.startColumn, range.endRow, range.endColumn);
                for (const merge of merges) {
                    const border = skeleton.stylesCache.border?.getValue(merge.startRow, merge.startColumn);
                    if (border && Object.keys(border).some((key) => !BORDER_EDGE_KEYS.has(key))) {
                        // Preserve the existing full-row path for diagonals owned by an offscreen anchor.
                        return overflowSafeRanges;
                    }
                }
            }
        }
        return ranges;
    }

    addRenderFrameTimeMetricToScene(timeKey: string, val: number, scene: Scene) {
        scene = scene ?? this.getScene();
        // scene?.addRenderFrameTimeMetric(timeKey, val);
        const engine = scene.getEngine() as Engine;
        engine.renderFrameTimeMetric$.next([timeKey, val]);
    }

    addRenderTagToScene(renderKey: string, val: any, scene?: Scene) {
        scene = scene ?? this.getScene();
        const engine = scene.getEngine() as Engine;
        engine.renderFrameTags$.next([renderKey, val]);
        // scene?.addRenderFrameTags(timeKey, val);
    }

    /**
     * override for return type as Scene.
     * @returns Scene
     */
    override getScene() {
        return super.getScene() as Scene;
    }

    override isHit(coord: Vector2) {
        const oCoord = this.getInverseCoord(coord);
        const skeleton = this.getSkeleton();
        if (!skeleton) {
            return false;
        }
        const { rowHeaderWidthAndMarginLeft, columnHeaderHeightAndMarginTop } = skeleton;
        if (oCoord.x > rowHeaderWidthAndMarginLeft && oCoord.y > columnHeaderHeightAndMarginTop) {
            return true;
        }
        return false;
    }

    override getNoMergeCellPositionByIndex(rowIndex: number, columnIndex: number): IPosition {
        const skeleton = this.getSkeleton();
        if (!skeleton) {
            return { startX: 0, startY: 0, endX: 0, endY: 0 };
        }
        return skeleton.getNoMergeCellWithCoordByIndex(rowIndex, columnIndex);
    }

    override getScrollXYByRelativeCoords(coord: Vector2) {
        const scene = this.getParent() as Scene;
        let x = 0;
        let y = 0;
        const viewPort = scene.findViewportByPosToScene(coord);
        if (viewPort) {
            const actualX = viewPort.viewportScrollX || 0;
            const actualY = viewPort.viewportScrollY || 0;
            x += actualX;
            y += actualY;
        }
        return {
            x,
            y,
        };
    }

    override isForceDirty(): boolean {
        return this._forceDirty;
    }

    /**
     * canvas resize & zoom would call forceDirty
     * @param state
     */
    override makeForceDirty(state = true) {
        this.makeDirty(state);
        this._forceDirty = state;
    }

    setForceDisableGridlines(disabled: boolean) {
        this._forceDisableGridlines = disabled;
    }

    override getSelectionBounding(startRow: number, startColumn: number, endRow: number, endColumn: number) {
        return this.getSkeleton()?.expandRangeByMerge({ startRow, startColumn, endRow, endColumn });
    }

    /**
     * Since multiple controllers, not just the sheet-render.controller, invoke spreadsheet.makeDirty() — for instance, the cf.render-controller — it's essential to also call viewport.markDirty() whenever spreadsheet.makeDirty() is triggered.
     * @param state
     */
    override makeDirty(state: boolean = true) {
        (this.getParent() as Scene)?.getViewports().forEach((vp) => vp.markDirty(state));
        super.makeDirty(state);
        if (state === false) {
            this._dirtyBounds = [];
        }
        return this;
    }

    setDirtyArea(dirtyBounds: IBoundRectNoAngle[]) {
        this._dirtyBounds = dirtyBounds;
    }

    renderByViewports(mainCtx: UniverRenderingContext2D, inputViewportInfo: IViewportInfo, spreadsheetSkeleton: SpreadsheetSkeleton) {
        let viewportInfo = inputViewportInfo;
        const cacheState = this._getScrollCacheState(mainCtx, viewportInfo);
        const previousState = this._getReusableScrollCacheState(mainCtx, viewportInfo);
        if (previousState) {
            const diffX = (cacheState.left - previousState.left) / cacheState.scaleX;
            const diffY = (cacheState.top - previousState.top) / cacheState.scaleY;
            const { viewBound } = viewportInfo;
            const diffBounds = [...viewportInfo.diffBounds];
            if (!diffBounds.length) {
                if (diffX) {
                    const left = diffX < 0 ? viewBound.right + diffX : viewBound.left;
                    diffBounds.push({ ...viewBound, left, right: left + Math.abs(diffX) });
                }
                if (diffY) {
                    const top = diffY < 0 ? viewBound.bottom + diffY : viewBound.top;
                    diffBounds.push({ ...viewBound, top, bottom: top + Math.abs(diffY) });
                }
            }
            // View bounds and bitmap origins can round opposite sides of a half pixel.
            const expand = (bound: IBoundRectNoAngle) => ({
                left: bound.left - 1 / cacheState.scaleX,
                right: bound.right + 1 / cacheState.scaleX,
                top: bound.top - 1 / cacheState.scaleY,
                bottom: bound.bottom + 1 / cacheState.scaleY,
            });
            viewportInfo = { ...viewportInfo, diffX, diffY, diffBounds: diffBounds.map(expand), diffCacheBounds: viewportInfo.diffCacheBounds.map(expand) };
        }
        const { diffBounds, diffX, diffY, viewPortPosition, cacheCanvas, leftOrigin, topOrigin, bufferEdgeX, bufferEdgeY, isDirty: isViewportDirty, isForceDirty: isViewportForceDirty, shouldCacheUpdate } = viewportInfo as Required<IViewportInfo>;
        const { rowHeaderWidthAndMarginLeft, columnHeaderHeightAndMarginTop } = spreadsheetSkeleton;
        const { a: scaleX = 1, d: scaleY = 1 } = mainCtx.getTransform();
        const bufferEdgeSizeX = bufferEdgeX * scaleX / window.devicePixelRatio;
        const bufferEdgeSizeY = bufferEdgeY * scaleY / window.devicePixelRatio;

        let renderCacheCanvas = cacheCanvas;
        let cacheCtx = renderCacheCanvas.getContext();
        cacheCtx.save();

        const isForceDirty = isViewportForceDirty || this.isForceDirty();
        const isDirty = isViewportDirty || this.isDirty();
        const cachePixelRatio = cacheCanvas.getPixelRatio();
        const isScrollJumpOutsideCache =
            Math.abs(diffX) * scaleX >= cacheCanvas.getWidth() * cachePixelRatio ||
            Math.abs(diffY) * scaleY >= cacheCanvas.getHeight() * cachePixelRatio;
        const hasMergeData = spreadsheetSkeleton.worksheet.getMergeData().length > 0;
        const isScrolling = diffX !== 0 || diffY !== 0;
        const mergeRepairBounds = this._getMergeRepairBounds(spreadsheetSkeleton, viewportInfo, hasMergeData, isScrolling);
        const repaintBounds = this._getRepaintBounds(viewportInfo, mergeRepairBounds, mainCtx);
        const shouldRefreshForMergeRepairArea = exceedsMergeRepairThreshold(viewportInfo.cacheBound, repaintBounds, mergeRepairBounds.length > 0);
        const shouldRefreshForHorizontalResampling = this._requiresHorizontalResampling(mainCtx, viewportInfo);
        // Fractional frozen-column clipping changes translucent edge coverage after a vertical cache copy.
        const shouldRefreshForFrozenEdge = viewportInfo.viewportKey === SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT
            && diffY !== 0 && this._hasFractionalViewportPixels(viewportInfo);
        const incompatibleCache = this._scrollCacheStates.has(viewportInfo.viewportKey) && !previousState;
        const shouldRefreshCache = isDirty || isForceDirty || incompatibleCache || isScrollJumpOutsideCache || shouldRefreshForMergeRepairArea
            || shouldRefreshForHorizontalResampling || shouldRefreshForFrozenEdge ||
            (shouldCacheUpdate && diffX !== 0 && !this._canPaintHorizontalScrollIncrementally(mainCtx, viewportInfo));
        if (diffBounds.length === 0 || (diffX === 0 && diffY === 0) || shouldRefreshCache) {
            if (shouldRefreshCache) {
                this.addRenderTagToScene('scrolling', false);
                this.refreshCacheCanvas(viewportInfo, { cacheCanvas, cacheCtx, mainCtx, topOrigin, leftOrigin, bufferEdgeX, bufferEdgeY });
            }
        } else if (diffBounds.length !== 0 || diffX !== 0 || diffY !== 0) {
            // scrolling && no dirty
            this.addRenderTagToScene('scrolling', true);
            renderCacheCanvas = this.paintNewAreaForScrolling(viewportInfo, {
                cacheCanvas: renderCacheCanvas,
                cacheCtx,
                mainCtx,
                topOrigin,
                leftOrigin,
                bufferEdgeX,
                bufferEdgeY,
                scaleX,
                scaleY,
                columnHeaderHeightAndMarginTop,
                rowHeaderWidthAndMarginLeft,
            }, mergeRepairBounds);
            cacheCtx.restore();
            cacheCtx = renderCacheCanvas.getContext();
            cacheCtx.save();
        }
        // support for browser native zoom (only windows has this problem)
        const sourceLeft = bufferEdgeSizeX * Math.min(1, window.devicePixelRatio);
        const sourceTop = bufferEdgeSizeY * Math.min(1, window.devicePixelRatio);
        const { left, top, right, bottom } = viewPortPosition;
        const dw = right - left + rowHeaderWidthAndMarginLeft;
        const dh = bottom - top + columnHeaderHeightAndMarginTop;
        this._applyCache(renderCacheCanvas, mainCtx, sourceLeft, sourceTop, dw, dh, left, top, dw, dh);
        cacheCtx.restore();
        this._scrollCacheStates.set(viewportInfo.viewportKey, { ...cacheState, canvas: renderCacheCanvas });
    }

    private _getMergeRepairBounds(spreadsheetSkeleton: SpreadsheetSkeleton, viewportInfo: IViewportInfo, hasMergeData: boolean, isScrolling: boolean) {
        if (!hasMergeData || !isScrolling) {
            return [];
        }

        const { columnWidthAccumulation, rowHeightAccumulation, rowHeaderWidthAndMarginLeft, columnHeaderHeightAndMarginTop } = spreadsheetSkeleton;
        const dirtyBounds = viewportInfo.shouldCacheUpdate ? viewportInfo.diffCacheBounds : viewportInfo.diffBounds;
        const mergeBounds: IBoundRectNoAngle[] = [];
        const visited = new Set<string>();

        for (const dirtyBound of dirtyBounds) {
            const range = spreadsheetSkeleton.getRangeByViewBound(getOutwardRoundedBound(dirtyBound));
            const mergeRanges = spreadsheetSkeleton.worksheet.getMergedCellRange(range.startRow, range.startColumn, range.endRow, range.endColumn);
            for (const mergeRange of mergeRanges) {
                const key = `${mergeRange.startRow}:${mergeRange.startColumn}`;
                if (visited.has(key)) {
                    continue;
                }
                visited.add(key);

                mergeBounds.push({
                    left: (columnWidthAccumulation[mergeRange.startColumn - 1] ?? 0) + rowHeaderWidthAndMarginLeft,
                    top: (rowHeightAccumulation[mergeRange.startRow - 1] ?? 0) + columnHeaderHeightAndMarginTop,
                    right: columnWidthAccumulation[mergeRange.endColumn] + rowHeaderWidthAndMarginLeft,
                    bottom: rowHeightAccumulation[mergeRange.endRow] + columnHeaderHeightAndMarginTop,
                });
            }
        }

        return mergeBounds;
    }

    private _getRepaintBounds(
        viewportInfo: IViewportInfo,
        mergeRepairBounds: IBoundRectNoAngle[],
        mainCtx: UniverRenderingContext2D
    ): IRepaintBound[] {
        const transform = mainCtx.getTransform();
        if (!this._getReusableScrollCacheState(mainCtx, viewportInfo) && mergeRepairBounds.length && (!Number.isInteger(viewportInfo.diffX * transform.a)
            || !Number.isInteger(viewportInfo.diffY * transform.d))) {
            // Fractional bitmap shifts resample text. Rebuild the full merge to preserve its rasterization.
            const repaintBounds: IRepaintBound[] = viewportInfo.shouldCacheUpdate
                ? viewportInfo.diffCacheBounds.map((bound) => ({ bound: { ...bound }, repairsMerge: false }))
                : [];
            for (const mergeBound of mergeRepairBounds) {
                const overlapping = repaintBounds.find(({ bound }) => boundsOverlap(bound, mergeBound));
                if (overlapping) {
                    overlapping.bound.left = Math.min(overlapping.bound.left, mergeBound.left);
                    overlapping.bound.top = Math.min(overlapping.bound.top, mergeBound.top);
                    overlapping.bound.right = Math.max(overlapping.bound.right, mergeBound.right);
                    overlapping.bound.bottom = Math.max(overlapping.bound.bottom, mergeBound.bottom);
                    overlapping.repairsMerge = true;
                } else {
                    repaintBounds.push({ bound: { ...mergeBound }, repairsMerge: true });
                }
            }
            return repaintBounds;
        }
        const repaintBounds: IRepaintBound[] = [];
        const dirtyBounds = viewportInfo.shouldCacheUpdate ? viewportInfo.diffCacheBounds : viewportInfo.diffBounds;
        for (const dirtyBound of dirtyBounds) {
            const clipped = getIntersectBound(dirtyBound, viewportInfo.cacheBound);
            if (!clipped) {
                continue;
            }
            if (viewportInfo.shouldCacheUpdate) {
                repaintBounds.push({
                    bound: clipped,
                    repairsMerge: mergeRepairBounds.some((mergeBound) => getIntersectBound(clipped, mergeBound)),
                });
            } else {
                // Layout uses the full merge anchor; only the exposed pixels need repair.
                for (const mergeBound of mergeRepairBounds) {
                    const intersection = getIntersectBound(clipped, mergeBound);
                    if (intersection) {
                        repaintBounds.push({ bound: intersection, repairsMerge: true });
                    }
                }
            }
        }
        return repaintBounds;
    }

    private _requiresHorizontalResampling(mainCtx: UniverRenderingContext2D, viewportInfo: IViewportInfo): boolean {
        if (viewportInfo.diffX !== 0 && this._hasFractionalViewportPixels(viewportInfo)) {
            return true;
        }
        if (this._getReusableScrollCacheState(mainCtx, viewportInfo)) {
            return false;
        }
        const transform = mainCtx.getTransform();
        // Rounded scroll bounds can still disagree with a fractional canvas origin at pixel boundaries.
        return viewportInfo.diffX !== 0 && (!Number.isInteger(viewportInfo.diffX * transform.a)
            || !Number.isInteger(viewportInfo.diffY * transform.d)
            || !Number.isInteger(transform.e) || !Number.isInteger(transform.f));
    }

    private _hasFractionalViewportPixels(viewportInfo: IViewportInfo): boolean {
        const pixelRatio = viewportInfo.cacheCanvas!.getPixelRatio();
        return Object.values(viewportInfo.viewPortPosition)
            .some((value) => Math.abs(value * pixelRatio - Math.round(value * pixelRatio)) > 1e-6);
    }

    private _getScrollCacheState(mainCtx: UniverRenderingContext2D, viewportInfo: IViewportInfo): IScrollCacheState {
        const { a, b, c, d, e, f } = mainCtx.getTransform();
        const canvas = viewportInfo.cacheCanvas!;
        return {
            canvas,
            width: canvas.getWidth(),
            height: canvas.getHeight(),
            pixelRatio: canvas.getPixelRatio(),
            scaleX: a,
            scaleY: d,
            left: Math.round((e / a - viewportInfo.leftOrigin + viewportInfo.bufferEdgeX) * a),
            top: Math.round((f / d - viewportInfo.topOrigin + viewportInfo.bufferEdgeY) * d),
            axisAligned: a > 0 && d > 0 && b === 0 && c === 0,
        };
    }

    private _getReusableScrollCacheState(mainCtx: UniverRenderingContext2D, viewportInfo: IViewportInfo): IScrollCacheState | undefined {
        const previous = this._scrollCacheStates.get(viewportInfo.viewportKey);
        const canvas = viewportInfo.cacheCanvas;
        const { a, b, c, d } = mainCtx.getTransform();
        if (!(previous?.axisAligned && canvas === previous.canvas && a > 0 && d > 0 && b === 0 && c === 0
            && a === previous.scaleX && d === previous.scaleY && canvas.getWidth() === previous.width
            && canvas.getHeight() === previous.height && canvas.getPixelRatio() === previous.pixelRatio)) {
            return undefined;
        }
        const current = this._getScrollCacheState(mainCtx, viewportInfo);
        // The repair strips cover one rounding pixel, not precision loss at very large coordinates.
        return Math.abs(current.left - previous.left - viewportInfo.diffX * a) <= 1 + 1e-6
            && Math.abs(current.top - previous.top - viewportInfo.diffY * d) <= 1 + 1e-6
            ? previous
            : undefined;
    }

    private _canPaintHorizontalScrollIncrementally(mainCtx: UniverRenderingContext2D, viewportInfo: IViewportInfo): boolean {
        const cacheCanvas = viewportInfo.cacheCanvas;
        const viewport = this.getScene().getViewport(viewportInfo.viewportKey);
        const transform = mainCtx.getTransform();
        // Keep the full refresh for in-place caches, missing damage, and resampling of fractional pixels.
        return !!cacheCanvas && this._getAncestorParent()?.classType === RENDER_CLASS_TYPE.ENGINE
            && viewport?.canvas === cacheCanvas && viewportInfo.diffBounds.length > 0 && viewportInfo.diffCacheBounds.length > 0
            && transform.b === 0 && transform.c === 0
            && !this._requiresHorizontalResampling(mainCtx, viewportInfo);
    }

    paintNewAreaForScrolling(viewportInfo: IViewportInfo, param: IPaintForScrolling, mergeRepairBounds: IBoundRectNoAngle[] = []) {
        const { cacheCanvas, cacheCtx, mainCtx, topOrigin, leftOrigin, bufferEdgeX, bufferEdgeY, scaleX, scaleY, columnHeaderHeightAndMarginTop, rowHeaderWidthAndMarginLeft } = param;
        const { diffX, diffY } = viewportInfo;
        let renderCacheCanvas = cacheCanvas;
        let renderCacheCtx = cacheCtx;
        const viewport = this.getScene().getViewport(viewportInfo.viewportKey);
        const canSwapCache = this._getAncestorParent()?.classType === RENDER_CLASS_TYPE.ENGINE && viewport?.canvas === cacheCanvas;

        const previousState = this._getReusableScrollCacheState(mainCtx, viewportInfo);
        const cacheState = this._getScrollCacheState(mainCtx, viewportInfo);
        const offsetX = previousState ? cacheState.left - previousState.left : diffX * scaleX;
        const offsetY = previousState ? cacheState.top - previousState.top : diffY * scaleY;
        if (canSwapCache) {
            renderCacheCanvas = this._getScrollBufferCanvas(viewportInfo.viewportKey, cacheCanvas);
            renderCacheCtx = renderCacheCanvas.getContext();
            this._copyCacheForScrolling(renderCacheCtx, cacheCanvas, offsetX, offsetY);

            const previousBufferCanvas = viewport.swapCacheCanvas(renderCacheCanvas);
            if (previousBufferCanvas) {
                this._scrollBufferCanvases.set(viewportInfo.viewportKey, previousBufferCanvas);
            }
        } else {
            this._copyCacheForScrolling(cacheCtx, cacheCanvas, offsetX, offsetY);
        }

        this._refreshIncrementalState = true;
        // Reset the ctx position to the spreadsheet content origin before drawing.
        // trasnlation should be (rowHeaderWidth, colHeaderHeight) at start.
        const m = mainCtx.getTransform();

        // leftOrigin is the offset of viewport relative to sheetcorner (without considering zoom)
        // - (leftOrigin - bufferEdgeX)  ----> simplified to - leftOrigin + bufferEdgeX
        if (cacheState.axisAligned) {
            renderCacheCtx.setTransform(m.a, 0, 0, m.d, cacheState.left, cacheState.top);
        } else {
            renderCacheCtx.setTransform(m.a, m.b, m.c, m.d, 0, 0);
            renderCacheCtx.translateWithPrecision(m.e / m.a - leftOrigin + bufferEdgeX, m.f / m.d - topOrigin + bufferEdgeY);
        }

        const repaintBounds = this._getRepaintBounds(viewportInfo, mergeRepairBounds, mainCtx);
        if (repaintBounds.length) {
            for (const { bound: diffBound, repairsMerge } of repaintBounds) {
                const { left: diffLeft, right: diffRight, bottom: diffBottom, top: diffTop } = diffBound;

                // When this.draw, ctx.translate cell offset is relative to spreadsheet content
                // But diffBounds includes rowHeader columnWidth, so the offset of row header and column header needs to be subtracted before drawing
                const x = diffLeft - rowHeaderWidthAndMarginLeft;
                const y = diffTop - columnHeaderHeightAndMarginTop;
                const w = diffRight - diffLeft;
                const h = diffBottom - diffTop; // w and h must exactly match the diffarea size, otherwise when scrolling back, the clear area will be too large, causing valid content from the previous frame to be erased
                let renderBound = diffBound;
                let textClipBound: IBoundRectNoAngle | undefined;

                renderCacheCtx.save();
                if (cacheState.axisAligned) {
                    // Avoid fractional clear/clip edges from transform round trips at non-binary zooms.
                    const left = Math.round(x * m.a) + cacheState.left;
                    const top = Math.round(y * m.d) + cacheState.top;
                    const width = Math.round((x + w) * m.a) + cacheState.left - left;
                    const height = Math.round((y + h) * m.d) + cacheState.top - top;
                    textClipBound = { left, top, right: left + width, bottom: top + height };
                    renderCacheCtx.setTransform(1, 0, 0, 1, 0, 0);
                    renderCacheCtx.clearRect(left, top, width, height);
                    renderCacheCtx.beginPath();
                    renderCacheCtx.rect(left, top, width, height);
                    renderCacheCtx.clip();
                    renderCacheCtx.setTransform(m.a, 0, 0, m.d, cacheState.left, cacheState.top);
                    // Adjacent three-pixel borders can cross the clip even when their cell does not.
                    renderBound = {
                        left: (left - cacheState.left - SCROLL_REPAIR_INK_HALO) / m.a + rowHeaderWidthAndMarginLeft,
                        right: (left + width - cacheState.left + SCROLL_REPAIR_INK_HALO) / m.a + rowHeaderWidthAndMarginLeft,
                        top: (top - cacheState.top - SCROLL_REPAIR_INK_HALO) / m.d + columnHeaderHeightAndMarginTop,
                        bottom: (top + height - cacheState.top + SCROLL_REPAIR_INK_HALO) / m.d + columnHeaderHeightAndMarginTop,
                    };
                } else {
                    renderCacheCtx.clearRectByPrecision(x, y, w, h);
                    renderCacheCtx.beginPath();
                    renderCacheCtx.rectByPrecision(x, y, w, h);
                    renderCacheCtx.clip();
                }
                this.draw(renderCacheCtx, {
                    ...viewportInfo,
                    diffBounds: [renderBound],
                }, repairsMerge, textClipBound);
                renderCacheCtx.restore();
            }
        }

        // this.testShowRuler(cacheCtx, viewportInfo);
        this._refreshIncrementalState = false;
        return renderCacheCanvas;
    }

    private _copyCacheForScrolling(
        targetCtx: UniverRenderingContext2D,
        sourceCanvas: Canvas,
        offsetX: number,
        offsetY: number
    ) {
        targetCtx.save();
        targetCtx.setTransform(1, 0, 0, 1, 0, 0);
        targetCtx.globalCompositeOperation = 'copy';
        targetCtx.drawImage(sourceCanvas.getCanvasEle(), offsetX, offsetY);
        targetCtx.restore();
    }

    private _getScrollBufferCanvas(viewportKey: string, sourceCanvas: Canvas) {
        let scrollBufferCanvas = this._scrollBufferCanvases.get(viewportKey);
        if (!scrollBufferCanvas) {
            scrollBufferCanvas = new Canvas({ colorService: this.getScene()?.getEngine()?.canvasColorService });
            this._scrollBufferCanvases.set(viewportKey, scrollBufferCanvas);
        }
        if (scrollBufferCanvas.getWidth() !== sourceCanvas.getWidth() ||
            scrollBufferCanvas.getHeight() !== sourceCanvas.getHeight() ||
            scrollBufferCanvas.getPixelRatio() !== sourceCanvas.getPixelRatio()) {
            scrollBufferCanvas.setSize(sourceCanvas.getWidth(), sourceCanvas.getHeight(), sourceCanvas.getPixelRatio());
        }
        return scrollBufferCanvas;
    }

    /**
     * Redraw the entire viewport.
     */
    refreshCacheCanvas(viewportInfo: IViewportInfo, param: IPaintForRefresh) {
        const { cacheCanvas, cacheCtx, mainCtx, topOrigin, leftOrigin, bufferEdgeX, bufferEdgeY } = param;
        cacheCtx.save();
        cacheCtx.setTransform(1, 0, 0, 1, 0, 0);
        cacheCanvas.clear();
        cacheCtx.restore();

        cacheCtx.save();
        // cacheCtx.setTransform is rowHeaderWidth + viewport + scroll
        const m = mainCtx.getTransform();
        // cacheCtx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);

        // The 'leftOrigin' is the offset of the viewport relative to the sheet corner, which is the position of cell(0, 0), and it does not consider scaling.
        // - (leftOrigin - bufferEdgeX)  ----> - leftOrigin + bufferEdgeX
        const cacheState = this._getScrollCacheState(mainCtx, viewportInfo);
        if (cacheState.axisAligned) {
            cacheCtx.setTransform(m.a, 0, 0, m.d, cacheState.left, cacheState.top);
        } else {
            cacheCtx.setTransform(m.a, m.b, m.c, m.d, 0, 0);
            cacheCtx.translateWithPrecision(m.e / m.a - leftOrigin + bufferEdgeX, m.f / m.d - topOrigin + bufferEdgeY);
        }
        // when extension drawing, sheet content coordinate was used by sheet extension, not viewport coordinate, that means ext does not take rowheader into consideration
        this.draw(cacheCtx, viewportInfo);
        cacheCtx.restore();
    }

    override render(mainCtx: UniverRenderingContext2D, viewportInfo: IViewportInfo) {
        this._viewportCacheFontRevision = FontCache.metricsRevision;
        if (!this.visible) {
            this.makeDirty(false);
            return this;
        }

        const spreadsheetSkeleton = this.getSkeleton();

        if (!spreadsheetSkeleton) {
            return;
        }

        const { viewportKey } = viewportInfo;
        if (sheetHeaderViewportKeys.includes(viewportKey as SHEET_VIEWPORT_KEY)) {
            // Header viewports are rendered by row/column header components, not Spreadsheet.
            return this;
        }

        if (this._canReuseStyleCache(viewportInfo)) {
            spreadsheetSkeleton.updateVisibleRange(viewportInfo);
        } else {
            // Preserve the conservative border preparation for fractionally clipped viewports.
            const stylesViewportInfo = viewportInfo.cacheCanvas && viewportInfo.diffX && this._hasFractionalViewportPixels(viewportInfo)
                ? { ...viewportInfo, isForceDirty: true }
                : viewportInfo;
            spreadsheetSkeleton.setStylesCache(stylesViewportInfo, {
                scaleY: this.getParentScale().scaleY,
            });
        }

        const segment = spreadsheetSkeleton.rowColumnSegment;

        if (!segment) {
            return;
        }

        if (
            (segment.startRow === -1 && segment.endRow === -1) ||
            (segment.startColumn === -1 && segment.endColumn === -1)
        ) {
            return;
        }

        mainCtx.save();

        const { rowHeaderWidthAndMarginLeft, columnHeaderHeightAndMarginTop } = spreadsheetSkeleton;
        mainCtx.translateWithPrecision(rowHeaderWidthAndMarginLeft, columnHeaderHeightAndMarginTop);

        this.getScene()?.updateTransformerZero(rowHeaderWidthAndMarginLeft, columnHeaderHeightAndMarginTop);

        // scene --> layer, getObjects --> viewport.render(object) --> spreadsheet
        // SHEET_COMPONENT_MAIN_LAYER_INDEX = 0;
        // SHEET_COMPONENT_SELECTION_LAYER_INDEX = 1;
        // SHEET_COMPONENT_HEADER_LAYER_INDEX = 10;
        // SHEET_COMPONENT_HEADER_SELECTION_LAYER_INDEX = 11;
        // ......
        // SHEET_COMPONENT_MAIN_LAYER_INDEX spreadsheet  this.getObjectsByOrder() ---> [spreadsheet]
        // SHEET_COMPONENT_HEADER_LAYER_INDEX rowHeader & colHeader & freezeBorder this.getObjectsByOrder() ---> [SpreadsheetRowHeader, SpreadsheetColumnHeader, _Rect..., HeaderMenuResizeShape]
        // SHEET_COMPONENT_HEADER_SELECTION_LAYER_INDEX selection  this.getObjectsByOrder() ---> [_Rect, Group]

        // SpreadsheetRowHeader SpreadsheetColumnHeader is not render by spreadsheet
        if (sheetContentViewportKeys.includes(viewportKey as SHEET_VIEWPORT_KEY)) {
            if (viewportInfo && viewportInfo.cacheCanvas) {
                this.renderByViewports(mainCtx, viewportInfo, spreadsheetSkeleton);
            } else {
                this._draw(mainCtx, viewportInfo);
            }
        } else {
            // embed in doc & slide
            // now there are bugs in embed mode with cache on, 3f12ad80188a83283bcd95c65e6c5dcc2d23ad72
            if (viewportInfo && viewportInfo.cacheCanvas) {
                this.renderByViewports(mainCtx, viewportInfo, spreadsheetSkeleton);
            } else {
                this._draw(mainCtx, viewportInfo);
            }
        }
        mainCtx.restore();
        return this;
    }

    private _canReuseStyleCache(viewportInfo: IViewportInfo): boolean {
        return !!viewportInfo.cacheCanvas && !this.isDirty() && !this.isForceDirty()
            && !viewportInfo.isDirty && !viewportInfo.isForceDirty && !viewportInfo.shouldCacheUpdate
            && !viewportInfo.diffX && !viewportInfo.diffY
            && !viewportInfo.diffBounds?.length && !viewportInfo.diffCacheBounds?.length;
    }

    /**
     * applyCache from cache canvas
     * @param cacheCanvas Source Image
     * @param ctx MainCtx
     * @param sx
     * @param sy
     * @param sw
     * @param sh
     * @param dx
     * @param dy
     * @param dw
     * @param dh
     */
    protected _applyCache(
        cacheCanvas: Canvas,
        ctx: UniverRenderingContext2D,
        sx: number = 0,
        sy: number = 0,
        sw: number = 0,
        sh: number = 0,
        dx: number = 0,
        dy: number = 0,
        dw: number = 0,
        dh: number = 0
    ) {
        if (!ctx) {
            return;
        }

        let blitRect: IBlitRect = { sx, sy, sw, sh, dx, dy, dw, dh };
        if (sw > 0 && sh > 0 && dw > 0 && dh > 0) {
            // The blit may request a source rect larger than the cache canvas (see
            // clipBlitRectToBounds). Clip it to the canvas bounds so the drawImage
            // call below behaves the same on every browser, including Safari < 18.
            const clipped = clipBlitRectToBounds(blitRect, cacheCanvas.getWidth(), cacheCanvas.getHeight());
            if (!clipped) {
                return;
            }
            blitRect = clipped;
        }

        const pixelRatio = cacheCanvas.getPixelRatio();
        const cacheCtx = cacheCanvas.getContext();
        cacheCtx.save();
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        cacheCtx.setTransform(1, 0, 0, 1, 0, 0);

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            cacheCanvas.getCanvasEle(),
            blitRect.sx * pixelRatio,
            blitRect.sy * pixelRatio,
            blitRect.sw * pixelRatio,
            blitRect.sh * pixelRatio,
            blitRect.dx * pixelRatio,
            blitRect.dy * pixelRatio,
            blitRect.dw * pixelRatio,
            blitRect.dh * pixelRatio
        );
        ctx.restore();
        cacheCtx.restore();
    }

    protected override _draw(ctx: UniverRenderingContext2D, bounds?: IViewportInfo) {
        this.draw(ctx, bounds!);
    }

    private _getAncestorSize() {
        const parent = this._getAncestorParent();
        if (!parent) {
            return;
        }

        if (parent.classType === RENDER_CLASS_TYPE.ENGINE) {
            const mainCanvas = (parent as Engine).getCanvas();
            return {
                width: mainCanvas.getWidth(),
                height: mainCanvas.getHeight(),
            };
        }
        if (parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            return {
                width: parent.width,
                height: parent.height,
            };
        }
    }

    private _getAncestorParent(): Nullable<Engine | SceneViewer> {
        let parent: any = this.parent;
        while (parent) {
            if (parent.classType === RENDER_CLASS_TYPE.ENGINE || parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
                return parent as Nullable<Engine | SceneViewer>;
            }
            parent = parent?.getParent && parent?.getParent();
        }
    }

    private _initialDefaultExtension() {
        SpreadsheetExtensionRegistry.getData()
            .sort(sortRules)
            .forEach((Extension) => {
                this.register(new Extension());
            });
        this._backgroundExtension = this.getExtensionByKey('DefaultBackgroundExtension') as Background;
        this._borderExtension = this.getExtensionByKey('DefaultBorderExtension') as Border;
        this._fontExtension = this.getExtensionByKey('DefaultFontExtension') as Font;
    }

    /**
     * draw gridlines
     * @param ctx
     */
    // eslint-disable-next-line max-lines-per-function, complexity
    private _drawAuxiliary(
        ctx: UniverRenderingContext2D,
        hasMergeData = true,
        redrawBackgrounds?: (ranges: IRange[]) => void,
        repairNativeGridlines = false
    ) {
        const spreadsheetSkeleton = this.getSkeleton();
        if (spreadsheetSkeleton == null) {
            return;
        }

        const { rowColumnSegment, overflowCache, showGridlines, gridlinesColor, worksheet } = spreadsheetSkeleton;
        const { startRow, endRow, startColumn, endColumn } = rowColumnSegment;
        if (!spreadsheetSkeleton || showGridlines === BooleanNumber.FALSE || this._forceDisableGridlines) {
            return;
        }

        const { rowHeightAccumulation, columnTotalWidth, columnWidthAccumulation, rowTotalHeight } =
            spreadsheetSkeleton;
        if (
            !rowHeightAccumulation ||
            !columnWidthAccumulation ||
            columnTotalWidth === undefined ||
            rowTotalHeight === undefined
        ) {
            return;
        }
        ctx.save();

        ctx.setLineWidthByPrecision(1);

        const defaultGridlinesColor = ctx.__mode === 'printing'
            ? PRINTING_GRIDLINES_COLOR
            : spreadsheetSkeleton.defaultGridlinesColor;
        ctx.strokeStyle = gridlinesColor ?? ctx.renderConfig.gridlinesColor ?? defaultGridlinesColor;

        const columnWidthAccumulationLength = columnWidthAccumulation.length;
        const rowHeightAccumulationLength = rowHeightAccumulation.length;
        const EXTRA_BOUND = 0.4;
        const rowCount = endRow - startRow + 1;
        const columnCount = endColumn - startColumn + 1;
        const extraRowCount = Math.ceil(rowCount * EXTRA_BOUND);
        const extraColumnCount = Math.ceil(columnCount * EXTRA_BOUND);

        const rowStart = Math.max(Math.floor(startRow - extraRowCount), 0);
        const rowEnd = Math.min(Math.ceil(endRow + extraRowCount), rowHeightAccumulationLength - 1);
        const columnEnd = Math.min(Math.ceil(endColumn + (extraColumnCount)), columnWidthAccumulationLength - 1);
        const columnStart = Math.max(Math.floor(startColumn - (extraColumnCount)), 0);

        const startX = columnWidthAccumulation[columnStart - 1] || 0;
        const startY = rowHeightAccumulation[rowStart - 1] || 0;
        const endX = columnWidthAccumulation[columnEnd];
        const endY = rowHeightAccumulation[rowEnd];
        ctx.translateWithPrecisionRatio(FIX_ONE_PIXEL_BLUR_OFFSET, FIX_ONE_PIXEL_BLUR_OFFSET);

        ctx.beginPath();
        ctx.moveToByPrecision(startX, startY);
        ctx.lineToByPrecision(endX, startY);

        ctx.moveToByPrecision(startX, startY);
        ctx.lineToByPrecision(startX, endY);

        ctx.closePathByEnv();
        ctx.stroke();
        if (repairNativeGridlines) {
            this._repairGridlineStroke(ctx, startX, startY, endX, endY);
        }

        const mergeVisibleRanges: IRange[] = [];
        let mergeVisibleRangeStartRow = startRow;

        //#region draw horizontal lines
        for (let r = rowStart; r <= rowEnd; r++) {
            if (hasMergeData) {
                if (worksheet.getRowVisible(r) === false) {
                    if (mergeVisibleRangeStartRow < r) {
                        mergeVisibleRanges.push({
                            startRow: mergeVisibleRangeStartRow,
                            endRow: r - 1,
                            startColumn,
                            endColumn,
                        });
                        mergeVisibleRangeStartRow = r + 1;
                    } else if (mergeVisibleRangeStartRow === r) {
                        mergeVisibleRangeStartRow = r + 1;
                    }
                } else if (r === endRow && mergeVisibleRangeStartRow <= r) {
                    mergeVisibleRanges.push({
                        startRow: mergeVisibleRangeStartRow,
                        endRow: r,
                        startColumn,
                        endColumn,
                    });
                }
            }

            if (r < 0 || r > rowHeightAccumulationLength - 1) {
                continue;
            }
            const rowEndPosition = rowHeightAccumulation[r];
            ctx.beginPath();
            ctx.moveToByPrecision(startX, rowEndPosition);
            ctx.lineToByPrecision(endX, rowEndPosition);
            ctx.closePathByEnv();
            ctx.stroke();
        }
        //#endregion

        for (let c = columnStart; c <= columnEnd; c++) {
            if (c < 0 || c > columnWidthAccumulationLength - 1) {
                continue;
            }
            const columnEndPosition = columnWidthAccumulation[c];
            ctx.beginPath();
            ctx.moveToByPrecision(columnEndPosition, startY);
            ctx.lineToByPrecision(columnEndPosition, endY);
            ctx.closePathByEnv();
            ctx.stroke();
        }
        //#endregion

        // clear line of merge cell
        const mergeCellRanges: IRange[] = [];
        if (hasMergeData) {
            for (const mergeVisibleRange of mergeVisibleRanges) {
                const mergeRangeInVisible = spreadsheetSkeleton.getCurrentRowColumnSegmentMergeData(mergeVisibleRange);
                mergeCellRanges.push(...mergeRangeInVisible);
            }
        }
        this._clearRectangle(ctx, rowHeightAccumulation, columnWidthAccumulation, mergeCellRanges, redrawBackgrounds, repairNativeGridlines);

        // clear line of overflow cell
        this._clearRectangle(
            ctx,
            rowHeightAccumulation,
            columnWidthAccumulation,
            overflowCache.toNativeArray(),
            redrawBackgrounds,
            repairNativeGridlines
        );

        // Draw gap areas AFTER merge/overflow clearing so gap visuals are always on top
        this._drawGapAreas(ctx, spreadsheetSkeleton, rowStart, rowEnd, columnStart, columnEnd, startX, endX, startY, endY);

        ctx.restore();
    }

    /**
     * Clear the guide lines within a range in the table, to make room for merged cells and overflow.
     */
    private _clearRectangle(
        ctx: UniverRenderingContext2D,
        rowHeightAccumulation: number[],
        columnWidthAccumulation: number[],
        cellRanges?: IRange[],
        redrawBackgrounds?: (ranges: IRange[]) => void,
        repairNativeGridlines = false
    ) {
        if (!cellRanges?.length) {
            return;
        }
        const bounds: IBoundRectNoAngle[] = [];
        for (const range of cellRanges) {
            const { startRow, endRow, startColumn, endColumn } = range;

            const startY = rowHeightAccumulation[startRow - 1] ?? 0;
            const endY = rowHeightAccumulation[endRow] ?? rowHeightAccumulation[rowHeightAccumulation.length - 1];

            const startX = columnWidthAccumulation[startColumn - 1] ?? 0;
            const endX =
                columnWidthAccumulation[endColumn] ?? columnWidthAccumulation[columnWidthAccumulation.length - 1];

            const m = ctx.getTransform();
            if (ctx.__mode !== 'printing' && m.a > 0 && m.d > 0 && !m.b && !m.c) {
                // A fractional clear repeatedly attenuates grid intersections as cached pixels are repaired.
                const left = Math.round(Math.round(startX * m.a) + m.e);
                const top = Math.round(Math.round(startY * m.d) + m.f);
                const right = Math.round(Math.round(endX * m.a) + m.e);
                const bottom = Math.round(Math.round(endY * m.d) + m.f);
                ctx.save();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.clearRect(left, top, right - left, bottom - top);
                ctx.restore();
            } else {
                ctx.clearRectByPrecision(startX, startY, endX - startX, endY - startY);
            }
            bounds.push({ left: startX, top: startY, right: endX, bottom: endY });
        }

        redrawBackgrounds?.(cellRanges);

        for (const { left, top, right, bottom } of bounds) {
            // After ClearRect, the lines will become thinner, and the lines will be repaired below.
            ctx.beginPath();
            ctx.moveToByPrecision(left, top);
            ctx.lineToByPrecision(right, top);
            ctx.lineToByPrecision(right, bottom);
            ctx.lineToByPrecision(left, bottom);
            ctx.lineToByPrecision(left, top);
            ctx.stroke();
            if (repairNativeGridlines) {
                this._repairGridlineStroke(ctx, left, top, right, bottom, true);
            }
            ctx.closePath();
        }
    }

    private _repairGridlineStroke(ctx: UniverRenderingContext2D, left: number, top: number, right: number, bottom: number, rectangle = false) {
        const native = ctx._context;
        const m = native.getTransform();
        const colorSpace = native.getContextAttributes?.()?.colorSpace;
        if (m.a !== m.d || m.a <= 0 || m.b || m.c || (colorSpace && colorSpace !== 'srgb')
            || native.globalAlpha !== 1 || native.globalCompositeOperation !== 'source-over'
            || typeof native.strokeStyle !== 'string' || !/^#[\da-f]{6}$/i.test(native.strokeStyle)
            || native.getLineDash().length || native.lineCap !== 'butt' || native.lineJoin !== 'miter'
            || native.shadowBlur || native.shadowOffsetX || native.shadowOffsetY
            || !['rgba(0, 0, 0, 0)', 'transparent', '#00000000'].includes(native.shadowColor)
            || (native.filter && native.filter !== 'none')) {
            return;
        }
        const width = native.lineWidth * m.a;
        const padding = Math.round(width) * 2 + 2;
        const segments: Array<[number, number, number, number]> = [[left, top, right, top], [left, top, left, bottom]];
        if (rectangle) {
            segments.push([left, bottom, right, bottom], [right, top, right, bottom]);
        }
        native.save();
        try {
            native.setTransform(1, 0, 0, 1, 0, 0);
            native.fillStyle = native.strokeStyle;
            for (const [x0, y0, x1, y1] of segments) {
                const horizontal = y0 === y1;
                const start = Math.round((horizontal ? x0 : y0) * m.a) + (horizontal ? m.e : m.f);
                const end = Math.round((horizontal ? x1 : y1) * m.a) + (horizontal ? m.e : m.f);
                const center = Math.round((horizontal ? y0 : x0) * m.a) + (horizontal ? m.f : m.e);
                const low = center - width / 2;
                const high = center + width / 2;
                const lowPixel = Math.round(low);
                const highPixel = Math.round(high);
                const from = Math.ceil(Math.min(start, end) + padding);
                const to = Math.floor(Math.max(start, end) - padding);
                if (Math.abs(low - lowPixel) > 1e-6 || Math.abs(high - highPixel) > 1e-6 || highPixel <= lowPixel || to <= from) {
                    continue;
                }
                // Linux software strokes can leave interior holes; preserve native corners and their coverage.
                native.fillRect(horizontal ? from : lowPixel, horizontal ? lowPixel : from, horizontal ? to - from : highPixel - lowPixel, horizontal ? highPixel - lowPixel : to - from);
            }
        } finally {
            native.restore();
        }
    }

    /**
     * Draw gap areas for row and column gaps.
     * Clears gridlines in gap regions and fills with gap style.
     */
    private _drawGapAreas(
        ctx: UniverRenderingContext2D,
        spreadsheetSkeleton: SpreadsheetSkeleton,
        rowStart: number,
        rowEnd: number,
        columnStart: number,
        columnEnd: number,
        viewStartX: number,
        viewEndX: number,
        viewStartY: number,
        viewEndY: number
    ): void {
        const { gapConfig, rowHeightAccumulation, columnWidthAccumulation } = spreadsheetSkeleton;
        const rowGaps = gapConfig?.rowGaps;
        const colGaps = gapConfig?.colGaps;
        // defaultBackgroundColor and defaultStripeColor are guaranteed to be filled by _fillDefaultGapThemeColors in SheetSkeleton
        const { defaultBackgroundColor = '', defaultStripeColor = '' } = gapConfig || {};
        const defaultBg = defaultBackgroundColor;
        const defaultStripe = defaultStripeColor;

        if (rowGaps) {
            for (let r = rowStart; r <= rowEnd; r++) {
                const gapSize = rowGaps[r]?.size ?? 0;
                if (gapSize <= 0) continue;
                const gapTop = rowHeightAccumulation[r - 1] ?? 0;
                this._drawSingleGapRect(ctx, rowGaps[r], viewStartX, gapTop, viewEndX - viewStartX, gapSize, defaultBg, defaultStripe);
            }
        }

        if (colGaps) {
            for (let c = columnStart; c <= columnEnd; c++) {
                const gapSize = colGaps[c]?.size ?? 0;
                if (gapSize <= 0) continue;
                const gapLeft = columnWidthAccumulation[c - 1] ?? 0;
                this._drawSingleGapRect(ctx, colGaps[c], gapLeft, viewStartY, gapSize, viewEndY - viewStartY, defaultBg, defaultStripe);
            }
        }
    }

    /**
     * Render a single gap rectangle: clear gridlines, fill background, draw diagonal stripes.
     */
    private _drawSingleGapRect(
        ctx: UniverRenderingContext2D,
        gapItem: { size: number; color?: string; stripeColor?: string },
        x: number,
        y: number,
        w: number,
        h: number,
        defaultBg: string,
        defaultStripe: string
    ): void {
        ctx.clearRectByPrecision(x, y, w, h);

        // Fill background
        ctx.save();
        ctx.fillStyle = gapItem.color ?? defaultBg;
        ctx.fillRectByPrecision(x, y, w, h);
        ctx.restore();

        // Draw diagonal stripes
        const stripeColor = gapItem.stripeColor ?? defaultStripe;
        ctx.save();
        ctx.beginPath();
        ctx.rectByPrecision(x, y, w, h);
        ctx.clip();

        ctx.strokeStyle = stripeColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const spacing = 6;
        for (let d = -h; d < w; d += spacing) {
            ctx.moveTo(x + d, y + h);
            ctx.lineTo(x + d + h, y);
        }
        ctx.stroke();
        ctx.restore();
    }

    testShowRuler(cacheCtx: UniverRenderingContext2D, viewportInfo: IViewportInfo): void {
        const { cacheBound } = viewportInfo;
        const spreadsheetSkeleton = this.getSkeleton()!;
        const { rowHeaderWidth, columnHeaderHeight } = spreadsheetSkeleton;
        const { left, top, right, bottom } = cacheBound;
        const findClosestHundred = (number: number) => {
            const remainder = number % 100;
            return number + (100 - remainder);
        };
        const startX = findClosestHundred(left);
        const endX = findClosestHundred(right);
        const startY = findClosestHundred(top);
        const endY = findClosestHundred(bottom);
        cacheCtx.save();
        cacheCtx.beginPath();
        cacheCtx.strokeStyle = '#000000';
        cacheCtx.fillStyle = '#000000';
        cacheCtx.font = '16px Arial';
        cacheCtx.lineWidth = 1;
        cacheCtx.textAlign = 'center';
        cacheCtx.textBaseline = 'middle';

        for (let i = startX; i <= endX; i += 50) {
            cacheCtx.beginPath();
            cacheCtx.strokeStyle = (i % 100 === 0) ? 'red' : '#aaa';
            cacheCtx.moveTo(i - rowHeaderWidth, top - columnHeaderHeight);
            cacheCtx.lineTo(i - rowHeaderWidth, bottom - columnHeaderHeight);
            cacheCtx.stroke();
            cacheCtx.closePath();
        }
        for (let j = startY; j <= endY; j += 50) {
            cacheCtx.beginPath();
            cacheCtx.strokeStyle = (j % 100 === 0) ? 'red' : '#aaa';
            cacheCtx.moveTo(left - rowHeaderWidth, j - columnHeaderHeight);
            cacheCtx.lineTo(right - rowHeaderWidth, j - columnHeaderHeight);
            cacheCtx.stroke();
            cacheCtx.closePath();
        }
        cacheCtx.fillStyle = '#666';
        for (let i = startX; i <= endX; i += 100) {
            for (let j = startY; j <= endY; j += 100) {
                cacheCtx.fillText(`${i},${j}`, i - rowHeaderWidth, j - columnHeaderHeight);
            }
        }
        // start
        // cacheCtx.textAlign = 'left';
        // for (let j = startY; j <= endY; j += 100) {
        //     cacheCtx.clearRect(left - rowHeaderWidth, j - columnHeaderHeight - 15, 30, 30);
        //     cacheCtx.fillText(`${left}`, left - rowHeaderWidth, j - columnHeaderHeight);
        // }
        cacheCtx.closePath();
        cacheCtx.restore();
    }

    testGetRandomLightColor(): string {
        const letters = 'ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 6)];
        }

        const r = Number.parseInt(color.substring(1, 3), 16);
        const g = Number.parseInt(color.substring(3, 5), 16);
        const b = Number.parseInt(color.substring(5, 7), 16);
        if (r + g + b < 610) {
            return this.testGetRandomLightColor();
        }

        return color;
    }
}
