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

import type {
    IDisposable,
    IDrawingSearch,
    IPosition,
    IRange,
    ITransformState,
    Nullable,
    Serializable,
    Workbook,
    Worksheet,
} from '@univerjs/core';
import type { IDrawingJsonUndo1 } from '@univerjs/drawing';
import type {
    BaseObject,
    IBoundRectNoAngle,
    IRectProps,
    IRender,
    ITransformerConfig,
    Scene,
    SpreadsheetSkeleton,
} from '@univerjs/engine-render';
import type {
    ISetFrozenMutationParams,
    ISetSelectionsOperationParams,
    ISetWorksheetRowAutoHeightMutationParams,
} from '@univerjs/sheets';
import type {
    IFloatDomData,
    IInsertSheetDrawingCommandParams,
    ISetDrawingCommandParams,
    ISheetDrawing,
    ISheetDrawingPosition,
    ISheetFloatDom,
} from '@univerjs/sheets-drawing';
import type { IFloatDom, IFloatDomLayout } from '@univerjs/ui';
import {
    Disposable,
    DisposableCollection,
    DrawingTypeEnum,
    fromEventSubject,
    generateRandomId,
    ICommandService,
    Inject,
    IUniverInstanceService,
    LifecycleService,
    LifecycleStages,
    Optional,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import { getDrawingShapeKeyByDrawingSearch, IDrawingManagerService } from '@univerjs/drawing';
import { disposeDrawingRenderObject, insertGroupObject } from '@univerjs/drawing-ui';
import {
    DRAWING_OBJECT_LAYER_INDEX,
    IRenderManagerService,
    ObjectType,
    Rect,
    Image as RenderImage,
    SHEET_VIEWPORT_KEY,
} from '@univerjs/engine-render';
import {
    COMMAND_LISTENER_SKELETON_CHANGE,
    getSheetCommandTarget,
    SetFrozenMutation,
    SetSelectionsOperation,
    SetWorksheetRowAutoHeightMutation,
} from '@univerjs/sheets';
import {
    DrawingApplyType,
    InsertSheetDrawingCommand,
    ISheetDrawingService,
    SetDrawingApplyMutation,
    SetSheetDrawingCommand,
    transformToAxisAlignPosition,
    transformToDrawingPosition,
} from '@univerjs/sheets-drawing';
import {
    ISheetSelectionRenderService,
    SetScrollOperation,
    SetZoomRatioOperation,
    SheetSkeletonManagerService,
} from '@univerjs/sheets-ui';
import { CanvasFloatDomPreviewService, CanvasFloatDomService } from '@univerjs/ui';
import { BehaviorSubject, filter, map, of, Subject, switchMap, take } from 'rxjs';
import { SHEET_CHART_RENDER_OBJECT_CONFIG } from './sheet-chart-render-object.config';

export interface ICanvasFloatDom {
    /**
     * whether allow transform float-dom
     */
    allowTransform?: boolean;
    /**
     * initial position of float-dom
     */
    initPosition: IPosition;
    componentKey: string;
    /**
     * unitId of workbook, if not set, will use current workbook
     */
    unitId?: string;
    /**
     * subUnitId of worksheet, if not set, will use current worksheet
     */
    subUnitId?: string;
    /**
     * data of component, will save to snapshot, json-like data
     */
    data?: Serializable;
    /**
     * the float-dom type
     */
    type?: DrawingTypeEnum;

    /**
     * whether allow event pass through float dom to canvas.
     */
    eventPassThrough?: boolean;
}

enum ScrollDirectionResponse {
    ALL = 'ALL',
    HORIZONTAL = 'HORIZONTAL',
    VERTICAL = 'VERTICAL',
}

export const SHEET_FLOAT_DOM_PREFIX = 'univer-sheet-float-dom-';

export interface ICanvasFloatDomInfo {
    position$: BehaviorSubject<IFloatDomLayout>;
    dispose: IDisposable;
    rect: BaseObject;
    unitId: string;
    subUnitId: string;
    boundsOfViewArea?: IBoundRectNoAngle;
    scrollDirectionResponse?: ScrollDirectionResponse; // update float dom pos by scrolling
    domAnchor?: IDOMAnchor;
    id: string;
    domId?: string; // Ensure unique id for dom element at runtime
    floatDomConfig?: IFloatDom;
    runtimeMounted?: boolean;
    runtimeStage?: 'inactive' | 'stage1' | 'stage2';
    previewObjectKey?: string;
}

/**
 * Context passed to a sheet float-dom render object factory.
 *
 * This shape is consumed by the sheet drawing render pipeline when it creates
 * canvas-side render objects. Plugins normally use it through the callback
 * passed to {@link SheetCanvasFloatDomManagerService.registerRenderObjectFactory}.
 */
export interface ISheetFloatDomRenderObjectFactoryContext {
    key: string;
    config: IRectProps;
    unitId: string;
    subUnitId: string;
    drawingId: string;
    drawingType: DrawingTypeEnum;
    data?: Serializable;
}

/**
 * Creates the canvas-side render object for a sheet float-dom drawing.
 *
 * The returned object must be a {@link Rect} or a {@link Rect} subclass because
 * the sheet drawing manager owns transform, selection, order, and grouping
 * through that render object.
 *
 * Prefer registering factories through
 * {@link SheetCanvasFloatDomManagerService.registerRenderObjectFactory} instead
 * of constructing render objects inside sheet drawing code.
 */
export type SheetFloatDomRenderObjectFactory = (context: ISheetFloatDomRenderObjectFactoryContext) => Rect;

function createExternalRuntimeDisposable<TOwner extends object>(
    owner: TOwner,
    id: string,
    disposeById: (owner: TOwner, id: string) => void
): IDisposable & { id: string } {
    const ownerRef = new WeakRef(owner);
    let disposed = false;

    return {
        id,
        dispose() {
            if (disposed) {
                return;
            }

            disposed = true;
            const currentOwner = ownerRef.deref();
            if (currentOwner) {
                disposeById(currentOwner, id);
            }
        },
    };
}

export interface IDOMAnchor {
    width: number;
    height: number;
    horizonOffsetAlign?: 'left' | 'right';
    verticalOffsetAlign?: 'top' | 'bottom';
    marginX?: number | string;
    marginY?: number | string;
}

const SHEET_EMBED_FLOAT_DOM_TRANSFORMER_CONFIG = {
    borderEnabled: true,
    borderStroke: '#4086f4',
    borderStrokeWidth: 1,
    borderSpacing: 2,
    anchorFill: '#ffffff',
    anchorStroke: '#4086f4',
    anchorStrokeWidth: 1.5,
    anchorSize: 8,
    anchorCornerRadius: 2,
    anchorStyle: 'canva',
    rotateEnabled: false,
    resizeEnabled: true,
    moveBoundaryEnabled: false,
} as const;

/**
 * Keep a chart selection outline outside the chart's own rounded frame.
 * Charts retain resize handles but do not expose a rotation control.
 */
export const SHEET_CHART_TRANSFORMER_CONFIG = {
    borderEnabled: true,
    borderStroke: '#4086f4',
    borderStrokeWidth: 1,
    borderSpacing: 2,
    anchorFill: '#ffffff',
    anchorStroke: '#4086f4',
    anchorStrokeWidth: 1.5,
    anchorSize: 8,
    anchorCornerRadius: 2,
    anchorStyle: 'canva',
    rotateEnabled: false,
    resizeEnabled: true,
    keepRatio: false,
    moveBoundaryEnabled: false,
} as const satisfies ITransformerConfig;

const FLOAT_DOM_RUNTIME_ACTIVATION_EVENT_PRIORITY = -100;
const FLOAT_DOM_STAGE2_CLICK_DISTANCE_THRESHOLD = 4;
const FLOAT_DOM_PREVIEW_OBJECT_SUFFIX = '__preview';
export const EMBED_FLOAT_DRAG_HANDLE_POINTER_DOWN_EVENT = 'univer:embed-float-drag-handle:pointerdown';

export interface IFloatDomHostClickIntent {
    pointerId?: number;
    startOffsetX: number;
    startOffsetY: number;
    startedAt: number;
}

export interface IEmbedFloatDragHandlePointerDownDetail {
    embedId?: string;
    hostUnitId?: string;
    hostAnchorId?: string;
    pointerId?: number;
    clientX?: number;
    clientY?: number;
    button?: number;
}

export interface IFloatDomMoveDragState {
    pointerId?: number;
    startClientX: number;
    startClientY: number;
    startLeft: number;
    startTop: number;
}

export function shouldStartFloatDomMoveFromHandle(
    info: Pick<ICanvasFloatDomInfo, 'id' | 'unitId'>,
    detail: IEmbedFloatDragHandlePointerDownDetail
): boolean {
    return detail.hostAnchorId === info.id &&
        (detail.hostUnitId == null || detail.hostUnitId === info.unitId) &&
        (detail.button == null || detail.button === 0) &&
        typeof detail.clientX === 'number' &&
        typeof detail.clientY === 'number';
}

export function createFloatDomMoveDragState(
    info: Pick<ICanvasFloatDomInfo, 'rect'>,
    detail: IEmbedFloatDragHandlePointerDownDetail
): IFloatDomMoveDragState | undefined {
    if (typeof detail.clientX !== 'number' || typeof detail.clientY !== 'number') {
        return undefined;
    }

    return {
        pointerId: detail.pointerId,
        startClientX: detail.clientX,
        startClientY: detail.clientY,
        startLeft: Number(info.rect.left ?? 0),
        startTop: Number(info.rect.top ?? 0),
    };
}

export function resolveFloatDomMoveDragTransform(
    state: IFloatDomMoveDragState,
    event: Pick<PointerEvent, 'clientX' | 'clientY'>,
    scene: Pick<Scene, 'getAncestorScale'>
): Pick<ITransformState, 'left' | 'top'> {
    const { scaleX, scaleY } = scene.getAncestorScale();
    return {
        left: state.startLeft + (event.clientX - state.startClientX) / (scaleX || 1),
        top: state.startTop + (event.clientY - state.startClientY) / (scaleY || 1),
    };
}

export function applyFloatDomTransformerConfig(rect: BaseObject, floatDomParam: IFloatDomData): void {
    const data = floatDomParam.data;
    if (!data || typeof data !== 'object') {
        return;
    }

    const embedData = data as {
        version?: number;
        embedId?: string;
        resizeBehavior?: string;
    };
    if (embedData.version !== 1 || typeof embedData.embedId !== 'string') {
        return;
    }

    rect.transformerConfig = {
        ...SHEET_EMBED_FLOAT_DOM_TRANSFORMER_CONFIG,
        keepRatio: embedData.resizeBehavior === 'aspect-ratio',
    };
}

export function applySheetChartTransformerConfig(rect: BaseObject): void {
    rect.transformerConfig = {
        ...rect.transformerConfig,
        ...SHEET_CHART_TRANSFORMER_CONFIG,
    };
}

function isStage2RuntimeEmbedFloatDom(floatDomParam: Pick<IFloatDomData, 'data'>): boolean {
    if (!isEmbedFloatDomData(floatDomParam)) {
        return false;
    }

    const embedData = floatDomParam.data as {
        hostType?: UniverInstanceType;
        childType?: UniverInstanceType;
        runtimeMountMode?: string;
    };

    return embedData.hostType === UniverInstanceType.UNIVER_SHEET &&
        embedData.childType === UniverInstanceType.UNIVER_SHEET &&
        embedData.runtimeMountMode === 'stage2';
}

export function isEmbedFloatDomData(floatDomParam: Pick<IFloatDomData, 'data'>): boolean {
    const data = floatDomParam.data;
    if (!data || typeof data !== 'object') {
        return false;
    }

    const embedData = data as {
        version?: number;
        embedId?: string;
    };

    return embedData.version === 1 &&
        typeof embedData.embedId === 'string';
}

export function isSheetHostedEmbedFloatDom(floatDomParam: Pick<IFloatDomData, 'data'>): boolean {
    if (!isEmbedFloatDomData(floatDomParam)) {
        return false;
    }

    const embedData = floatDomParam.data as {
        hostType?: UniverInstanceType;
        childType?: UniverInstanceType;
    };

    return embedData.hostType === UniverInstanceType.UNIVER_SHEET &&
        embedData.childType != null;
}

export function resolveSheetFloatDomRuntimePolicy(
    floatDomParam: Pick<IFloatDomData, 'data'>,
    stage: ICanvasFloatDomInfo['runtimeStage'] = 'inactive'
): {
    autoMountRuntime: boolean;
    passThroughRuntimeEvents: boolean;
    preserveOnFocusChange: boolean;
    usePreviewObject: boolean;
} {
    const autoMountRuntime = !isStage2RuntimeEmbedFloatDom(floatDomParam);
    const sheetHostedEmbed = isSheetHostedEmbedFloatDom(floatDomParam);

    return {
        autoMountRuntime,
        passThroughRuntimeEvents: !(sheetHostedEmbed && stage === 'stage2'),
        preserveOnFocusChange: isEmbedFloatDomData(floatDomParam),
        usePreviewObject: isStage2RuntimeEmbedFloatDom(floatDomParam),
    };
}

export function shouldAutoMountFloatDomRuntime(floatDomParam: Pick<IFloatDomData, 'data'>): boolean {
    return resolveSheetFloatDomRuntimePolicy(floatDomParam).autoMountRuntime;
}

export function shouldPreserveFloatDomOnFocusChange(floatDomParam: Pick<IFloatDomData, 'data'>): boolean {
    return resolveSheetFloatDomRuntimePolicy(floatDomParam).preserveOnFocusChange;
}

export function shouldUseFloatDomPreviewObject(floatDomParam: Pick<IFloatDomData, 'data'>): boolean {
    return resolveSheetFloatDomRuntimePolicy(floatDomParam).usePreviewObject;
}

export function shouldPassThroughFloatDomRuntimeEvents(
    floatDomParam: Pick<IFloatDomData, 'data'>,
    stage: ICanvasFloatDomInfo['runtimeStage'] = 'inactive'
): boolean {
    return resolveSheetFloatDomRuntimePolicy(floatDomParam, stage).passThroughRuntimeEvents;
}

export function shouldUpdateFloatDomLayerOnRuntimeStageChange(floatDomParam: Pick<IFloatDomData, 'data'>): boolean {
    return isEmbedFloatDomData(floatDomParam) && !shouldAutoMountFloatDomRuntime(floatDomParam);
}

export function shouldForwardSheetHostedEmbedFloatDomEvent(
    floatDomParam: Pick<IFloatDomData, 'data'>,
    event: Pick<Event, 'target'>
): boolean {
    if (!isSheetHostedEmbedFloatDom(floatDomParam)) {
        return true;
    }

    const target = event.target as { closest?: (selector: string) => HTMLElement | null } | null;
    const runtime = target?.closest?.('[data-embed-float-dom="true"]');
    return runtime?.dataset?.embedFloatStage !== 'stage2';
}

export function shouldPassThroughFloatDomActivationEvent(nextStage: ICanvasFloatDomInfo['runtimeStage'] | undefined): boolean {
    return nextStage !== 'stage2';
}

export function syncFloatDomHostSelectionOnStageEnter(
    stage: ICanvasFloatDomInfo['runtimeStage'] | undefined,
    renderObject: {
        transformer: { clearControlByIds: (ids: string[]) => void };
        scene: {
            attachTransformerTo?: (object: BaseObject) => void;
            getTransformer?: () => Nullable<{ clearSelectedObjects?: () => void }>;
        };
    } | null | undefined,
    rect: BaseObject & { oKey?: string }
): void {
    if (!renderObject) {
        return;
    }

    if (stage === 'stage1') {
        renderObject.scene.attachTransformerTo?.(rect);
        return;
    }

    if (stage === 'stage2' && rect.oKey) {
        renderObject.transformer.clearControlByIds([rect.oKey]);
        renderObject.scene.getTransformer?.()?.clearSelectedObjects?.();
    }
}

function isFloatDomInDomLayer(
    canvasFloatDomService: Pick<CanvasFloatDomService, 'domLayers'>,
    id: string
): boolean {
    return canvasFloatDomService.domLayers.some(([layerId]) => layerId === id);
}

export function isCanvasFloatDomDrawingType(drawingType: DrawingTypeEnum): boolean {
    return drawingType === DrawingTypeEnum.DRAWING_DOM ||
        drawingType === DrawingTypeEnum.DRAWING_BLOCK ||
        drawingType === DrawingTypeEnum.DRAWING_CHART;
}

export function shouldActivateStage2FromHostPointer(
    info: Pick<ICanvasFloatDomInfo, 'position$' | 'rect' | 'runtimeMounted' | 'runtimeStage'>,
    event: { offsetX?: number; offsetY?: number }
): boolean {
    if (info.runtimeMounted || info.runtimeStage !== 'stage1') {
        return false;
    }

    const { offsetX, offsetY } = event;
    if (typeof offsetX !== 'number' || typeof offsetY !== 'number') {
        return false;
    }

    const position = info.position$.getValue();
    if (
        offsetX >= Math.min(position.startX, position.endX) &&
        offsetX <= Math.max(position.startX, position.endX) &&
        offsetY >= Math.min(position.startY, position.endY) &&
        offsetY <= Math.max(position.startY, position.endY)
    ) {
        return true;
    }

    const rect = info.rect;
    if (typeof rect.isHit === 'function') {
        try {
            return rect.isHit({ x: offsetX, y: offsetY } as any);
        } catch {
            // Fall back to the axis-aligned bounds when the render object expects
            // richer vector instances than a host-level event can provide.
        }
    }

    return offsetX >= rect.left &&
        offsetX <= rect.left + rect.width &&
        offsetY >= rect.top &&
        offsetY <= rect.top + rect.height;
}

export function createFloatDomHostClickIntent(
    info: Pick<ICanvasFloatDomInfo, 'position$' | 'rect' | 'runtimeMounted' | 'runtimeStage'>,
    event: { type?: string; pointerId?: number; offsetX?: number; offsetY?: number }
): IFloatDomHostClickIntent | undefined {
    if (event.type !== 'pointerdown' || !shouldActivateStage2FromHostPointer(info, event)) {
        return undefined;
    }

    return {
        pointerId: event.pointerId,
        startOffsetX: event.offsetX!,
        startOffsetY: event.offsetY!,
        startedAt: Date.now(),
    };
}

export function shouldActivateStage2FromHostClickIntent(
    info: Pick<ICanvasFloatDomInfo, 'position$' | 'rect' | 'runtimeMounted' | 'runtimeStage'>,
    intent: IFloatDomHostClickIntent | undefined,
    event: { type?: string; pointerId?: number; offsetX?: number; offsetY?: number }
): boolean {
    if (!intent || event.type !== 'pointerup') {
        return false;
    }
    if (intent.pointerId != null && event.pointerId != null && intent.pointerId !== event.pointerId) {
        return false;
    }
    if (!shouldActivateStage2FromHostPointer(info, event)) {
        return false;
    }

    const distance = Math.hypot(event.offsetX! - intent.startOffsetX, event.offsetY! - intent.startOffsetY);
    return distance <= FLOAT_DOM_STAGE2_CLICK_DISTANCE_THRESHOLD;
}

export interface ILimitBound extends IBoundRectNoAngle {
    /**
     * Actually, it means fixed.
     * When left is true, dom is fixed to left of dom pos when dom width is shrinking. or dom is fixed to right of dom pos when dom width is shrinking.
     * When top is true, dom is fixed to top of dom pos when dom height is shrinking. or dom is fixed to bottom of dom pos when dom height is shrinking.
     */
    absolute: {
        left: boolean;
        top: boolean;
    };
}

/**
 * Adjust dom bound size when scrolling (dom bound would shrink when scrolling if over the edge of viewMain)
 * @param posOfFloatObject  The position of float object, relative to sheet content, scale & scrolling does not affect it.
 * @param scene
 * @param skeleton
 * @param worksheet
 * @returns ILimitBound
 */
// eslint-disable-next-line max-lines-per-function
export function transformBound2DOMBound(posOfFloatObject: IBoundRectNoAngle, scene: Scene, skeleton: SpreadsheetSkeleton, worksheet: Worksheet, floatDomInfo?: ICanvasFloatDomInfo, skipBoundsOfViewArea = false): ILimitBound {
    const { scaleX, scaleY } = scene.getAncestorScale();
    const viewMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);

    const freeze = worksheet.getFreeze();
    const { startColumn: viewMainStartColumn, startRow: viewMainStartRow, xSplit: freezedCol, ySplit: freezedRow } = freeze;
    /**
     * Actually, it means fixed.
     */
    const absolute = {
        left: true, // left means the left of pic is in a viewMainLeft
        top: true,
    };

    if (!viewMain) {
        return {
            ...posOfFloatObject,
            absolute,
        };
    }
    const { left, right, top, bottom } = posOfFloatObject;
    let { top: viewBoundsTop, left: viewBoundsLeft, viewportScrollX, viewportScrollY } = viewMain;
    // specify edge of viewbound. if not specify, use viewMain.
    const { boundsOfViewArea: specBoundsOfViewArea, scrollDirectionResponse } = floatDomInfo || {};
    const { rowHeaderWidth, columnHeaderHeight } = skeleton;
    const boundsOfViewArea = {
        top: skipBoundsOfViewArea ? 0 : columnHeaderHeight,
        left: skipBoundsOfViewArea ? 0 : rowHeaderWidth,
    };
    if (specBoundsOfViewArea) {
        if (Tools.isDefine(boundsOfViewArea.top)) {
            boundsOfViewArea.top = specBoundsOfViewArea.top;
        }
        if (Tools.isDefine(boundsOfViewArea.left)) {
            boundsOfViewArea.left = specBoundsOfViewArea.left;
        }
    }
    if (scrollDirectionResponse === ScrollDirectionResponse.HORIZONTAL) {
        viewportScrollY = 0;
    }
    if (scrollDirectionResponse === ScrollDirectionResponse.VERTICAL) {
        viewportScrollX = 0;
    }

    let offsetLeft: number = 0;
    let offsetRight: number = 0;

    /**
     * freezed viewport start & end position
     */
    const freezeStartY = skeleton.rowStartY(viewMainStartRow - freezedRow) + columnHeaderHeight;
    const freezeStartX = skeleton.colStartX(viewMainStartColumn - freezedCol) + rowHeaderWidth;
    const freezeEndY = skeleton.rowStartY(viewMainStartRow) + columnHeaderHeight;
    const freezeEndX = skeleton.colStartX(viewMainStartColumn) + rowHeaderWidth;

    if (freezedCol === 0) {
        absolute.left = false;
        offsetLeft = (left - viewportScrollX) * scaleX;
        offsetRight = (right - viewportScrollX) * scaleX;
    } else {
        // freeze
        // viewMainLeft may not start at col = 0
        // DO NOT use viewMainLeft?.viewBound.right. It's not accurate. there is a delay to set viewBound!
        const leftToCanvas = left - (freezeStartX - rowHeaderWidth);
        const rightToCanvas = right - (freezeStartX - rowHeaderWidth);
        if (right < freezeEndX) {
            offsetLeft = leftToCanvas * scaleX;
            offsetRight = rightToCanvas * scaleX;
        } else if (left <= freezeEndX && right >= freezeEndX) {
            offsetLeft = leftToCanvas * scaleX;
            offsetRight = Math.max(viewBoundsLeft, (right - viewportScrollX) * scaleX);
        } else if (left > freezeEndX) {
            absolute.left = false;
            offsetLeft = Math.max((left - viewportScrollX) * scaleX, viewBoundsLeft);
            offsetRight = Math.max((right - viewportScrollX) * scaleX, viewBoundsLeft);
        }
    }

    let offsetTop: number = 0;
    let offsetBottom: number = 0;
    if (freezedRow === 0) {
        absolute.top = false;
        offsetTop = (top - viewportScrollY) * scaleY;
        offsetBottom = (bottom - viewportScrollY) * scaleY;
    } else {
        const topToCanvas = top - (freezeStartY - columnHeaderHeight);
        const bottomToCanvas = bottom - (freezeStartY - columnHeaderHeight);
        if (bottom < freezeEndY) {
            offsetTop = topToCanvas * scaleY;
            offsetBottom = bottomToCanvas * scaleY;
        } else if (top <= freezeEndY && bottom >= freezeEndY) {
            offsetTop = topToCanvas * scaleY;
            offsetBottom = Math.max(viewBoundsTop, (bottom - viewportScrollY) * scaleY);
        } else if (top > freezeEndY) {
            absolute.top = false;
            offsetTop = Math.max((top - viewportScrollY) * scaleY, viewBoundsTop);
            offsetBottom = Math.max((bottom - viewportScrollY) * scaleY, viewBoundsTop);
        }
    }

    offsetLeft = Math.max(offsetLeft, boundsOfViewArea.left);
    offsetTop = Math.max(offsetTop, boundsOfViewArea.top);
    offsetRight = Math.max(offsetRight, boundsOfViewArea.left);
    offsetBottom = Math.max(offsetBottom, boundsOfViewArea.top);

    const rs = {
        left: offsetLeft,
        right: offsetRight,
        top: offsetTop,
        bottom: offsetBottom,
        absolute,
    };
    return rs;
}

/**
 * Calculate the position of the floating dom, limited by bounds of viewMain in transformBound2DOMBound
 * @param floatObject
 * @param renderUnit
 * @param skeleton
 * @param worksheet
 * @returns {IFloatDomLayout} position
 */
export const calcSheetFloatDomPosition = (
    floatObject: BaseObject,
    scene: Scene,
    skeleton: SpreadsheetSkeleton,
    worksheet: Worksheet,
    floatDomInfo?: ICanvasFloatDomInfo
): IFloatDomLayout => {
    const { left, top, width, height, angle } = floatObject;
    const boundOfFloatObject: IBoundRectNoAngle = {
        left,
        right: left + width,
        top,
        bottom: top + height,
    };

    const offsetBound = transformBound2DOMBound(boundOfFloatObject, scene, skeleton, worksheet, floatDomInfo);
    const { scaleX, scaleY } = scene.getAncestorScale();

    const domPos: IFloatDomLayout = {
        startX: offsetBound.left,
        endX: offsetBound.right,
        startY: offsetBound.top,
        endY: offsetBound.bottom,
        rotate: angle,
        width: width * scaleX,
        height: height * scaleY,
        absolute: offsetBound.absolute,
    };

    return domPos;
};

export class SheetCanvasFloatDomManagerService extends Disposable {
    /**
     * for update dom container position when scrolling and zoom
     */
    private _domLayerInfoMap: Map<string, ICanvasFloatDomInfo> = new Map();

    private _transformChange$ = new Subject<{ id: string; value: ITransformState }>();
    transformChange$ = this._transformChange$.asObservable();

    private _add$ = new Subject<{ unitId: string; subUnitId: string; id: string; data?: Record<string, any> }>();
    public add$ = this._add$.asObservable();

    private _remove$ = new Subject<{ unitId: string; subUnitId: string; id: string }>();
    remove$ = this._remove$.asObservable();
    private readonly _renderObjectFactories = new Map<DrawingTypeEnum, SheetFloatDomRenderObjectFactory[]>();

    constructor(
        @Inject(IRenderManagerService) private _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService,
        @Inject(ICommandService) private _commandService: ICommandService,
        @IDrawingManagerService private _drawingManagerService: IDrawingManagerService,
        @Inject(CanvasFloatDomService) private readonly _canvasFloatDomService: CanvasFloatDomService,
        @ISheetDrawingService private readonly _sheetDrawingService: ISheetDrawingService,
        @Inject(LifecycleService) protected readonly _lifecycleService: LifecycleService,
        @Optional(CanvasFloatDomPreviewService) private readonly _canvasFloatDomPreviewService?: CanvasFloatDomPreviewService
    ) {
        super();
        this._drawingAddListener();
        this._featureUpdateListener();
        this._deleteListener();
        this._bindScrollEvent();
        this._bindEmbedFloatDragHandleEvent();
    }

    /**
     * Register a factory that creates the canvas-side render object for a sheet
     * float-dom drawing type. The latest registered factory wins; disposing the
     * returned handle unregisters it and restores the previous factory or the
     * default {@link Rect} fallback.
     */
    registerRenderObjectFactory(drawingType: DrawingTypeEnum, factory: SheetFloatDomRenderObjectFactory): IDisposable {
        const factories = this._renderObjectFactories.get(drawingType) ?? [];
        factories.push(factory);
        this._renderObjectFactories.set(drawingType, factories);

        return {
            dispose: () => {
                const currentFactories = this._renderObjectFactories.get(drawingType);
                if (!currentFactories) {
                    return;
                }

                const index = currentFactories.indexOf(factory);
                if (index >= 0) {
                    currentFactories.splice(index, 1);
                }

                if (currentFactories.length === 0) {
                    this._renderObjectFactories.delete(drawingType);
                }
            },
        };
    }

    private _createRenderObject(context: ISheetFloatDomRenderObjectFactoryContext): Rect {
        const factories = this._renderObjectFactories.get(context.drawingType);
        const factory = factories?.[factories.length - 1];
        return factory?.(context) ?? new Rect(context.key, context.config);
    }

    private _bindScrollEvent() {
        this._lifecycleService.lifecycle$.pipe(filter((s) => s === LifecycleStages.Rendered), take(1)).subscribe(() => {
            this._scrollUpdateListener();
        });
    }

    getFloatDomInfo(id: string) {
        return this._domLayerInfoMap.get(id);
    }

    getFloatDomsBySubUnitId(unitId: string, subUnitId: string) {
        return Array.from(this._domLayerInfoMap.values()).filter((info) => info.subUnitId === subUnitId && info.unitId === unitId);
    }

    private static _disposeExternalFloatDom(manager: SheetCanvasFloatDomManagerService, id: string): void {
        manager._removeDom(id, true);
    }

    private _createFloatDomDisposable(id: string): IDisposable & { id: string } {
        return createExternalRuntimeDisposable(this, id, SheetCanvasFloatDomManagerService._disposeExternalFloatDom);
    }

    private _bindEmbedFloatDragHandleEvent(): void {
        if (typeof document === 'undefined') {
            return;
        }

        const listener = (event: Event) => this._handleEmbedFloatDragHandlePointerDown(event as CustomEvent<IEmbedFloatDragHandlePointerDownDetail>);
        document.addEventListener(EMBED_FLOAT_DRAG_HANDLE_POINTER_DOWN_EVENT, listener);
        this.disposeWithMe(() => document.removeEventListener(EMBED_FLOAT_DRAG_HANDLE_POINTER_DOWN_EVENT, listener));
    }

    private _handleEmbedFloatDragHandlePointerDown(event: CustomEvent<IEmbedFloatDragHandlePointerDownDetail>): void {
        const detail = event.detail;
        if (!detail?.hostAnchorId) {
            return;
        }

        const info = this._domLayerInfoMap.get(detail.hostAnchorId);
        if (!info || !shouldStartFloatDomMoveFromHandle(info, detail)) {
            return;
        }

        const dragState = createFloatDomMoveDragState(info, detail);
        const renderObject = this._getSceneAndTransformerByDrawingSearch(info.unitId);
        if (!dragState || !renderObject) {
            return;
        }

        const { scene, transformer } = renderObject;
        if (info.rect.oKey) {
            transformer.clearControlByIds([info.rect.oKey]);
            scene.getTransformer()?.clearSelectedObjects();
        }

        const handlePointerMove = (pointerEvent: PointerEvent) => {
            if (dragState.pointerId != null && pointerEvent.pointerId !== dragState.pointerId) {
                return;
            }

            pointerEvent.preventDefault();
            const nextTransform = resolveFloatDomMoveDragTransform(dragState, pointerEvent, scene);
            info.rect.transformByState(nextTransform as ITransformState);
        };
        const handlePointerUp = (pointerEvent: PointerEvent) => {
            if (dragState.pointerId != null && pointerEvent.pointerId !== dragState.pointerId) {
                return;
            }

            window.removeEventListener('pointermove', handlePointerMove, true);
            window.removeEventListener('pointerup', handlePointerUp, true);
            window.removeEventListener('pointercancel', handlePointerCancel, true);

            pointerEvent.preventDefault();
            if (info.rect.left !== dragState.startLeft || info.rect.top !== dragState.startTop) {
                this._commitFloatDomMove(info);
            }
            if (info.runtimeStage === 'stage1') {
                scene.attachTransformerTo?.(info.rect);
            }
        };
        const handlePointerCancel = (pointerEvent: PointerEvent) => {
            if (dragState.pointerId != null && pointerEvent.pointerId !== dragState.pointerId) {
                return;
            }

            window.removeEventListener('pointermove', handlePointerMove, true);
            window.removeEventListener('pointerup', handlePointerUp, true);
            window.removeEventListener('pointercancel', handlePointerCancel, true);
            info.rect.transformByState({
                left: dragState.startLeft,
                top: dragState.startTop,
            } as ITransformState);
            if (info.runtimeStage === 'stage1') {
                scene.attachTransformerTo?.(info.rect);
            }
        };

        window.addEventListener('pointermove', handlePointerMove, true);
        window.addEventListener('pointerup', handlePointerUp, true);
        window.addEventListener('pointercancel', handlePointerCancel, true);
    }

    private _commitFloatDomMove(info: ICanvasFloatDomInfo): void {
        const skeletonParam = this._renderManagerService.getRenderById(info.unitId)?.with(SheetSkeletonManagerService).getSkeletonParam(info.subUnitId);
        const drawing = this._sheetDrawingService.getDrawingByParam({
            unitId: info.unitId,
            subUnitId: info.subUnitId,
            drawingId: info.id,
        }) as ISheetDrawing | undefined;
        if (!skeletonParam || !drawing?.transform) {
            return;
        }

        const transform = {
            ...drawing.transform,
            left: info.rect.left,
            top: info.rect.top,
            width: info.rect.width,
            height: info.rect.height,
            angle: info.rect.angle,
            flipX: info.rect.flipX,
            flipY: info.rect.flipY,
            skewX: info.rect.skewX,
            skewY: info.rect.skewY,
        } as ITransformState;
        const sheetTransform = transformToDrawingPosition(transform, skeletonParam.skeleton);
        const axisAlignSheetTransform = transformToAxisAlignPosition(transform, skeletonParam.skeleton);
        if (!sheetTransform || !axisAlignSheetTransform) {
            return;
        }

        this._commandService.syncExecuteCommand<ISetDrawingCommandParams>(SetSheetDrawingCommand.id, {
            unitId: info.unitId,
            drawings: [{
                ...drawing,
                transform,
                sheetTransform,
                axisAlignSheetTransform,
            }],
        });
    }

    isFloatDomRuntimeMounted(id: string): boolean {
        return this._domLayerInfoMap.get(id)?.runtimeMounted === true;
    }

    private _getFloatDomPreviewObjectKey(rectShapeKey: string): string {
        return `${rectShapeKey}${FLOAT_DOM_PREVIEW_OBJECT_SUFFIX}`;
    }

    private _syncPreviewObjectTransform(previewObject: Nullable<BaseObject>, rect: BaseObject): void {
        previewObject?.transformByState({
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            angle: rect.angle,
            flipX: rect.flipX,
            flipY: rect.flipY,
            skewX: rect.skewX,
            skewY: rect.skewY,
        } as ITransformState);
    }

    private _requestFloatDomPreview(drawingId: string, rect: BaseObject, data: Serializable | undefined): void {
        if (!this._canvasFloatDomPreviewService) {
            return;
        }

        this._canvasFloatDomPreviewService.requestPreview({
            id: drawingId,
            width: rect.width,
            height: rect.height,
            data,
        });
    }

    private _upsertFloatDomPreviewObject(
        scene: Scene,
        rect: BaseObject,
        rectShapeKey: string,
        drawingId: string,
        data: Serializable | undefined
    ): BaseObject | undefined {
        const preview = this._canvasFloatDomPreviewService?.getPreview(drawingId);
        if (!preview?.image) {
            this._requestFloatDomPreview(drawingId, rect, data);
            return undefined;
        }

        const previewObjectKey = this._getFloatDomPreviewObjectKey(rectShapeKey);
        const existingPreviewObject = scene.getObject(previewObjectKey);
        if (existingPreviewObject instanceof RenderImage) {
            existingPreviewObject.changeSource(preview.image);
            this._syncPreviewObjectTransform(existingPreviewObject, rect);
            return existingPreviewObject;
        }

        const previewObject = new RenderImage(previewObjectKey, {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            angle: rect.angle,
            flipX: rect.flipX,
            flipY: rect.flipY,
            skewX: rect.skewX,
            skewY: rect.skewY,
            url: preview.image,
            evented: false,
            rotateEnabled: false,
            resizeEnabled: false,
        });
        scene.addObject(previewObject, DRAWING_OBJECT_LAYER_INDEX);
        return previewObject;
    }

    mountFloatDomRuntime(id: string): boolean {
        const info = this._domLayerInfoMap.get(id);
        if (!info?.floatDomConfig) {
            return false;
        }

        if (info.runtimeMounted) {
            return true;
        }

        if (isFloatDomInDomLayer(this._canvasFloatDomService, id)) {
            this._canvasFloatDomService.updateFloatDom(id, {
                eventPassThrough: false,
                props: {
                    ...info.floatDomConfig.props,
                    initialStage: 'stage2',
                    onRuntimeStageExit: () => this.unmountFloatDomRuntime(id),
                },
            });
        } else {
            this._canvasFloatDomService.addFloatDom({
                ...info.floatDomConfig,
                eventPassThrough: false,
                props: {
                    ...info.floatDomConfig.props,
                    initialStage: 'stage2',
                    onRuntimeStageExit: () => this.unmountFloatDomRuntime(id),
                },
            });
        }
        info.runtimeMounted = true;
        info.runtimeStage = 'stage2';
        return true;
    }

    unmountFloatDomRuntime(id: string): void {
        const info = this._domLayerInfoMap.get(id);
        if (!info?.runtimeMounted) {
            return;
        }

        if (info.floatDomConfig && !shouldAutoMountFloatDomRuntime(info.floatDomConfig)) {
            this._canvasFloatDomService.updateFloatDom(id, {
                eventPassThrough: shouldPassThroughFloatDomRuntimeEvents(info.floatDomConfig, 'inactive'),
                props: info.floatDomConfig.props,
            });
        } else {
            this._canvasFloatDomService.removeFloatDom(id);
        }
        info.runtimeMounted = false;
        info.runtimeStage = 'inactive';
    }

    private _syncFloatDomVisibilityForActiveSheet(unitId: string, activeSubUnitId: string): void {
        Array.from(this._domLayerInfoMap.values())
            .filter((info) => info.unitId === unitId && info.floatDomConfig)
            .forEach((info) => {
                const isActiveSheet = info.subUnitId === activeSubUnitId;
                const isInDomLayer = isFloatDomInDomLayer(this._canvasFloatDomService, info.id);

                if (!isActiveSheet) {
                    if (isInDomLayer) {
                        this._canvasFloatDomService.removeFloatDom(info.id);
                    }
                    info.runtimeMounted = false;
                    info.runtimeStage = 'inactive';
                    return;
                }

                if (isInDomLayer || !info.floatDomConfig) {
                    return;
                }

                this._canvasFloatDomService.addFloatDom(info.floatDomConfig);
                const shouldAutoMountRuntime = shouldAutoMountFloatDomRuntime(info.floatDomConfig);
                info.runtimeMounted = shouldAutoMountRuntime;
                info.runtimeStage = isEmbedFloatDomData(info.floatDomConfig)
                    ? 'inactive'
                    : shouldAutoMountRuntime ? 'stage2' : 'inactive';
            });
    }

    promoteFloatDomRuntimeStage(id: string): ICanvasFloatDomInfo['runtimeStage'] | undefined {
        const info = this._domLayerInfoMap.get(id);
        if (!info?.floatDomConfig) {
            return undefined;
        }

        const sheetHostedEmbed = isSheetHostedEmbedFloatDom(info.floatDomConfig);
        if (info.runtimeMounted && !sheetHostedEmbed) {
            info.runtimeStage = 'stage2';
            return 'stage2';
        }

        if (info.runtimeStage !== 'stage1') {
            info.runtimeStage = 'stage1';
            if (shouldUpdateFloatDomLayerOnRuntimeStageChange(info.floatDomConfig)) {
                this._canvasFloatDomService.updateFloatDom(id, {
                    eventPassThrough: shouldPassThroughFloatDomRuntimeEvents(info.floatDomConfig, 'stage1'),
                });
            }
            return 'stage1';
        }

        if (info.runtimeMounted) {
            info.runtimeStage = 'stage2';
            if (shouldUpdateFloatDomLayerOnRuntimeStageChange(info.floatDomConfig)) {
                this._canvasFloatDomService.updateFloatDom(id, {
                    eventPassThrough: shouldPassThroughFloatDomRuntimeEvents(info.floatDomConfig, 'stage2'),
                });
            }
            return 'stage2';
        }

        this.mountFloatDomRuntime(id);
        return 'stage2';
    }

    private _getSceneAndTransformerByDrawingSearch(unitId: Nullable<string>) {
        if (unitId == null) {
            return;
        }

        const renderUnit = this._renderManagerService.getRenderById(unitId);

        const scene = renderUnit?.scene;

        if (renderUnit == null || scene == null) {
            return null;
        }

        const transformer = scene.getTransformerByCreate();
        const canvas = renderUnit.engine.getCanvasElement();
        return { scene, transformer, renderUnit, canvas };
    }

    // eslint-disable-next-line max-lines-per-function
    private _drawingAddListener() {
        this.disposeWithMe(

            // eslint-disable-next-line max-lines-per-function
            this._drawingManagerService.add$.subscribe((params: IDrawingSearch[]) => {
                // eslint-disable-next-line max-lines-per-function
                (params).forEach((param) => {
                    const { unitId, subUnitId, drawingId } = param;
                    const target = getSheetCommandTarget(this._univerInstanceService, { unitId, subUnitId });
                    const floatDomParam = this._drawingManagerService.getDrawingByParam(param) as IFloatDomData;

                    const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
                    if (!workbook) {
                        return;
                    }

                    const activeSheetId = workbook.getActiveSheet().getSheetId();

                    if (!floatDomParam || !target) {
                        return;
                    }

                    const skeleton = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService).getSkeletonParam(subUnitId);
                    if (!skeleton) {
                        return;
                    }

                    const { transform, drawingType, data, hidden, groupId } = floatDomParam;

                    if (!isCanvasFloatDomDrawingType(drawingType)) {
                        return;
                    }

                    const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);

                    if (renderObject == null) {
                        return;
                    }

                    if (hidden) {
                        return;
                    }
                    const { scene, canvas } = renderObject;

                    if (transform == null) {
                        return true;
                    }

                    if (activeSheetId !== subUnitId) {
                        return;
                    }

                    const { left, top, width, height, angle, flipX, flipY, skewX, skewY } = transform;

                    const rectShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
                    const groupShapeKey = groupId ? getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId: groupId }) : undefined;

                    const rectShape = this._getObjectIncludingGroup(scene, rectShapeKey, groupShapeKey);

                    if (rectShape != null) {
                        this._removeTopLevelDuplicateIfGrouped(scene, rectShapeKey, rectShape);
                        applyFloatDomTransformerConfig(rectShape, floatDomParam);
                        if (drawingType === DrawingTypeEnum.DRAWING_CHART) {
                            applySheetChartTransformerConfig(rectShape);
                        }
                        rectShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
                        this._syncFloatDomRect(drawingId, rectShape);
                        if (shouldUseFloatDomPreviewObject(floatDomParam)) {
                            this._syncPreviewObjectTransform(scene.getObject(this._getFloatDomPreviewObjectKey(rectShapeKey)), rectShape);
                            this._requestFloatDomPreview(drawingId, rectShape, data);
                        }
                        if (this._domLayerInfoMap.has(drawingId)) {
                            return;
                        }
                    }

                    const imageConfig: IRectProps = {
                        left,
                        top,
                        width,
                        height,
                        zIndex: this._drawingManagerService.getDrawingOrder(unitId, subUnitId).length - 1,
                    };

                    const isChart = drawingType === DrawingTypeEnum.DRAWING_CHART;

                    if (isChart) {
                        const backgroundColor = this._getChartDataBackground(data);
                        if (backgroundColor !== undefined) {
                            imageConfig.fill = backgroundColor;
                        }

                        if (data && (data as Record<string, string>).border) {
                            imageConfig.stroke = (data as Record<string, string>).border;
                        }
                        Object.assign(imageConfig, SHEET_CHART_RENDER_OBJECT_CONFIG);
                    } else {
                        imageConfig.rotateEnabled = false;
                    }

                    const rect = rectShape ?? this._createRenderObject({
                        key: rectShapeKey,
                        config: imageConfig,
                        unitId,
                        subUnitId,
                        drawingId,
                        drawingType,
                        data,
                    });
                    applyFloatDomTransformerConfig(rect, floatDomParam);
                    if (isChart) {
                        applySheetChartTransformerConfig(rect);
                    }

                    if (isChart) {
                        rect.objectType = ObjectType.CHART;
                    } else if (drawingType === DrawingTypeEnum.DRAWING_DOM || drawingType === DrawingTypeEnum.DRAWING_BLOCK) {
                        rect.objectType = ObjectType.DRAWING_DOM;
                    }

                    if (!rectShape) {
                        scene.addObject(rect, DRAWING_OBJECT_LAYER_INDEX);
                    }
                    if (!rectShape && floatDomParam.allowTransform !== false) {
                        scene.attachTransformerTo(rect);
                    }
                    if (!rectShape && isChart && groupId) {
                        insertGroupObject({ drawingId: groupId, unitId, subUnitId }, rect, scene, this._drawingManagerService);
                    }
                    const disposableCollection = new DisposableCollection();
                    const shouldUsePreviewObject = shouldUseFloatDomPreviewObject(floatDomParam);
                    const previewObjectKey = shouldUsePreviewObject ? this._getFloatDomPreviewObjectKey(rectShapeKey) : undefined;
                    if (shouldUsePreviewObject) {
                        this._upsertFloatDomPreviewObject(scene, rect, rectShapeKey, drawingId, data);
                        const previewSubscription = this._canvasFloatDomPreviewService?.previewUpdated$.subscribe((preview) => {
                            if (preview.id !== drawingId) {
                                return;
                            }

                            this._upsertFloatDomPreviewObject(scene, rect, rectShapeKey, drawingId, data);
                        });
                        previewSubscription && disposableCollection.add(previewSubscription);
                    }
                    const initPosition = calcSheetFloatDomPosition(rect, renderObject.renderUnit.scene, skeleton.skeleton, target.worksheet);
                    const position$ = new BehaviorSubject<IFloatDomLayout>(initPosition);

                    const domId = `${SHEET_FLOAT_DOM_PREFIX}${generateRandomId(6)}`;
                    const shouldAutoMountRuntime = shouldAutoMountFloatDomRuntime(floatDomParam);
                    const shouldSyncEmbedRuntimeStage = isEmbedFloatDomData(floatDomParam);
                    let info: ICanvasFloatDomInfo | undefined;
                    const handleRuntimeStageEnter = (stage: ICanvasFloatDomInfo['runtimeStage']) => {
                        if (info) {
                            info.runtimeStage = stage;
                            info.runtimeMounted = shouldAutoMountRuntime || stage === 'stage2';
                            if (shouldUpdateFloatDomLayerOnRuntimeStageChange(floatDomParam)) {
                                this._canvasFloatDomService.updateFloatDom(drawingId, {
                                    eventPassThrough: shouldPassThroughFloatDomRuntimeEvents(floatDomParam, stage),
                                });
                            }
                        }
                        const currentRenderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
                        syncFloatDomHostSelectionOnStageEnter(stage, currentRenderObject, rect);
                    };
                    const floatDomConfig: IFloatDom = {
                        position$,
                        id: drawingId,
                        domId,
                        componentKey: floatDomParam.componentKey,
                        eventPassThrough: shouldPassThroughFloatDomRuntimeEvents(floatDomParam, 'inactive'),
                        preserveOnFocusChange: shouldPreserveFloatDomOnFocusChange(floatDomParam),
                        onPointerDown: (evt) => {
                            if (shouldForwardSheetHostedEmbedFloatDomEvent(floatDomParam, evt)) {
                                canvas.dispatchEvent(new PointerEvent(evt.type, evt));
                            }
                        },
                        onPointerMove: (evt: PointerEvent | MouseEvent) => {
                            if (shouldForwardSheetHostedEmbedFloatDomEvent(floatDomParam, evt)) {
                                canvas.dispatchEvent(new PointerEvent(evt.type, evt));
                            }
                        },
                        onPointerUp: (evt: PointerEvent | MouseEvent) => {
                            if (shouldForwardSheetHostedEmbedFloatDomEvent(floatDomParam, evt)) {
                                canvas.dispatchEvent(new PointerEvent(evt.type, evt));
                            }
                        },
                        onWheel: (evt: WheelEvent) => {
                            if (shouldForwardSheetHostedEmbedFloatDomEvent(floatDomParam, evt)) {
                                canvas.dispatchEvent(new WheelEvent(evt.type, evt));
                            }
                        },
                        data,
                        props: shouldSyncEmbedRuntimeStage
                            ? {
                                onRuntimeStageEnter: handleRuntimeStageEnter,
                            }
                            : undefined,
                        unitId,
                    };
                    info = {
                        dispose: disposableCollection,
                        rect,
                        position$,
                        unitId,
                        subUnitId,
                        id: drawingId,
                        domId,
                        floatDomConfig,
                        runtimeMounted: shouldAutoMountRuntime,
                        runtimeStage: shouldSyncEmbedRuntimeStage
                            ? 'inactive'
                            : shouldAutoMountRuntime ? 'stage2' : 'inactive',
                        previewObjectKey,
                    };

                    this._canvasFloatDomService.addFloatDom(floatDomConfig);
                    if (!shouldAutoMountRuntime) {
                        let hostStage2ClickIntent: IFloatDomHostClickIntent | undefined;
                        const cancelStage2ClickIntentOnMove = (evt: { pointerId?: number; offsetX?: number; offsetY?: number }) => {
                            if (!hostStage2ClickIntent) {
                                return;
                            }
                            if (hostStage2ClickIntent.pointerId != null && evt.pointerId != null && hostStage2ClickIntent.pointerId !== evt.pointerId) {
                                return;
                            }
                            if (typeof evt.offsetX !== 'number' || typeof evt.offsetY !== 'number') {
                                hostStage2ClickIntent = undefined;
                                return;
                            }

                            const distance = Math.hypot(evt.offsetX - hostStage2ClickIntent.startOffsetX, evt.offsetY - hostStage2ClickIntent.startOffsetY);
                            if (distance > FLOAT_DOM_STAGE2_CLICK_DISTANCE_THRESHOLD) {
                                hostStage2ClickIntent = undefined;
                            }
                        };
                        const runtimeActivationListener = rect.onPointerDown$.subscribeEvent({
                            priority: FLOAT_DOM_RUNTIME_ACTIVATION_EVENT_PRIORITY,
                            next: ([evt, state]) => {
                                if (info?.runtimeStage === 'stage1') {
                                    hostStage2ClickIntent = createFloatDomHostClickIntent(info, evt);
                                    return;
                                }

                                const nextStage = this.promoteFloatDomRuntimeStage(drawingId);
                                if (nextStage === 'stage2') {
                                    syncFloatDomHostSelectionOnStageEnter(nextStage, renderObject, rect);
                                    state.skipNextObservers = true;
                                }
                                if (!shouldPassThroughFloatDomActivationEvent(nextStage)) {
                                    state.stopPropagation();
                                }
                            },
                        });
                        const sceneActivationListener = scene.onPointerDown$.subscribeEvent({
                            priority: FLOAT_DOM_RUNTIME_ACTIVATION_EVENT_PRIORITY,
                            next: ([evt]) => {
                                if (!info) {
                                    return;
                                }

                                hostStage2ClickIntent = createFloatDomHostClickIntent(info, evt);
                            },
                        });
                        const sceneMoveListener = scene.onPointerMove$.subscribeEvent({
                            priority: FLOAT_DOM_RUNTIME_ACTIVATION_EVENT_PRIORITY,
                            next: ([evt]) => {
                                cancelStage2ClickIntentOnMove(evt);
                            },
                        });
                        const sceneUpListener = scene.onPointerUp$.subscribeEvent({
                            priority: FLOAT_DOM_RUNTIME_ACTIVATION_EVENT_PRIORITY,
                            next: ([evt, state]) => {
                                const shouldActivate = info && shouldActivateStage2FromHostClickIntent(info, hostStage2ClickIntent, evt);
                                hostStage2ClickIntent = undefined;
                                if (!shouldActivate) {
                                    return;
                                }

                                const nextStage = this.promoteFloatDomRuntimeStage(drawingId);
                                if (nextStage === 'stage2') {
                                    syncFloatDomHostSelectionOnStageEnter(nextStage, renderObject, rect);
                                    state.stopPropagation();
                                    state.skipNextObservers = true;
                                }
                            },
                        });
                        disposableCollection.add(runtimeActivationListener);
                        disposableCollection.add(sceneActivationListener);
                        disposableCollection.add(sceneMoveListener);
                        disposableCollection.add(sceneUpListener);
                    }

                    const listener = rect.onTransformChange$.subscribeEvent(() => {
                        const newPosition = calcSheetFloatDomPosition(rect, renderObject.renderUnit.scene, skeleton.skeleton, target.worksheet);
                        position$.next(
                            newPosition
                        );
                        if (previewObjectKey) {
                            this._syncPreviewObjectTransform(scene.getObject(previewObjectKey), rect);
                        }
                    });

                    disposableCollection.add(() => {
                        this._canvasFloatDomService.removeFloatDom(drawingId);
                        if (previewObjectKey) {
                            scene.removeObject(previewObjectKey);
                        }
                    });
                    listener && disposableCollection.add(listener);
                    this._domLayerInfoMap.set(drawingId, info);
                });
            })
        );

        // remove float-dom control when drawing removed
        this.disposeWithMe(
            this._drawingManagerService.remove$.subscribe((params) => {
                (params).forEach((param) => {
                    const { unitId, subUnitId, drawingId } = param;
                    const rectShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });

                    const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
                    if (renderObject == null) {
                        return;
                    }
                    const { transformer, scene } = renderObject;
                    const rectShape = this._getObjectIncludingGroup(scene, rectShapeKey);
                    if (rectShape?.oKey) {
                        transformer.clearControlByIds([rectShape?.oKey]);
                        scene.getTransformer()?.clearSelectedObjects();
                    }
                });
            })
        );
    }

    private _scrollUpdateListener() {
        const updateSheet = (unitId: string, subUnitId: string) => {
            const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
            const ids = Array.from(this._domLayerInfoMap.keys())
                .map((id) => ({ id, ...this._domLayerInfoMap.get(id) }))
                .filter((info) => info.subUnitId === subUnitId && info.unitId === unitId)
                .map((info) => info.id);
            const target = getSheetCommandTarget(this._univerInstanceService, { unitId, subUnitId });
            const skeleton = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService).getSkeletonParam(subUnitId);
            if (!renderObject || !target || !skeleton) {
                return;
            }
            ids.forEach((id) => {
                const floatDomInfo = this._domLayerInfoMap.get(id);
                if (floatDomInfo) {
                    const position = calcSheetFloatDomPosition(floatDomInfo.rect, renderObject.renderUnit.scene, skeleton.skeleton, target.worksheet, floatDomInfo);
                    floatDomInfo.position$.next(position);
                }
            });
        };

        this.disposeWithMe(
            this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET).pipe(
                switchMap((workbook) => workbook ? workbook.activeSheet$ : of(null))
            ).subscribe((worksheet) => {
                if (!worksheet) {
                    return;
                }

                const unitId = worksheet.getUnitId();
                const subUnitId = worksheet.getSheetId();
                this._syncFloatDomVisibilityForActiveSheet(unitId, subUnitId);
                updateSheet(unitId, subUnitId);
            })
        );

        // #region scroll
        this.disposeWithMe(
            this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET).pipe(
                switchMap((workbook) => workbook ? workbook.activeSheet$ : of(null)),
                map((worksheet) => {
                    if (!worksheet) return null;
                    const unitId = worksheet.getUnitId();
                    const render = this._renderManagerService.getRenderById(unitId);
                    return render ? { render, unitId, subUnitId: worksheet.getSheetId() } : null;
                }),
                switchMap((render) =>
                    render
                        ? fromEventSubject(render.render.scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN)!.onScrollAfter$)
                            .pipe(map(() => ({ unitId: render.unitId, subUnitId: render.subUnitId })))
                        : of(null)
                )
            ).subscribe((value) => {
                if (!value) return; // TODO@weird94: maybe we should throw an error here and do some cleaning work?

                const { unitId, subUnitId } = value;
                updateSheet(unitId, subUnitId);
            })
        );

        //#endregion

        // #region zoom
        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetZoomRatioOperation.id) {
                const params = (commandInfo.params) as any;
                const { unitId } = params;
                const subUnitIds = Array.from(this._domLayerInfoMap.values()).filter((info) => info.unitId === unitId).map((info) => info.subUnitId);
                subUnitIds.forEach((subUnitId) => {
                    updateSheet(unitId, subUnitId);
                });
            } else if (commandInfo.id === SetFrozenMutation.id) {
                const { unitId, subUnitId } = commandInfo.params as ISetFrozenMutationParams;
                updateSheet(unitId, subUnitId);
            } else if (commandInfo.id === SetSelectionsOperation.id) {
                const { unitId, subUnitId } = commandInfo.params as ISetSelectionsOperationParams;
                updateSheet(unitId, subUnitId);
            }
        }));
        //# endregion
    }

    updateFloatDomProps(unitId: string, subUnitId: string, id: string, props: Record<string, any>) {
        const info = this._domLayerInfoMap.get(id);
        const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
        if (info && renderObject) {
            const { scene } = renderObject;
            const rectShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId: id });
            const drawing = this._drawingManagerService.getDrawingByParam({ unitId, subUnitId, drawingId: id });
            const groupShapeKey = drawing?.groupId ? getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId: drawing.groupId }) : undefined;
            const rectShape = this._getObjectIncludingGroup(scene, rectShapeKey, groupShapeKey);
            if (rectShape && rectShape instanceof Rect) {
                this._removeTopLevelDuplicateIfGrouped(scene, rectShapeKey, rectShape);
                rectShape.setProps(props);
                this._syncFloatDomRect(id, rectShape);
            }
        }
    }

    private _getObjectIncludingGroup(scene: Scene, key: string, groupKey?: string): Nullable<BaseObject> {
        return this._getChildObjectFromGroup(scene, key, groupKey) ?? scene.getObjectIncludeInGroup?.(key) ?? scene.getObject(key) ?? null;
    }

    private _getChildObjectFromGroup(scene: Scene, key: string, groupKey?: string): Nullable<BaseObject> {
        if (!groupKey) {
            return null;
        }

        const groupObject = scene.getObjectIncludeInGroup?.(groupKey) ?? scene.getObject(groupKey);
        return this._findChildObject(groupObject, key);
    }

    private _findChildObject(object: Nullable<BaseObject>, key: string): Nullable<BaseObject> {
        if (!object) {
            return null;
        }

        const children = object.getObjects();
        for (const child of children) {
            if (child.oKey === key) {
                return child;
            }

            const nested = this._findChildObject(child, key);
            if (nested) {
                return nested;
            }
        }

        return null;
    }

    private _removeTopLevelDuplicateIfGrouped(scene: Scene, key: string, object: BaseObject): void {
        if (!object.isInGroup) {
            return;
        }

        const topLevelObject = scene.getObject(key);
        if (topLevelObject && topLevelObject !== object) {
            scene.removeObject(topLevelObject);
        }
    }

    private _syncFloatDomRect(id: string, object: BaseObject): void {
        if (!(object instanceof Rect)) {
            return;
        }

        const info = this._domLayerInfoMap.get(id);
        if (info) {
            info.rect = object;
        }
    }

    private _getChartDataBackground(data?: Serializable): string | undefined {
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            return undefined;
        }

        const record = data as Record<string, unknown>;
        const background = record.backgroundColor ?? record.background;
        return typeof background === 'string' ? background : undefined;
    }

    private _getPosition(position: IPosition, unitId: string): Nullable<ISheetDrawingPosition> {
        const { startX, endX, startY, endY } = position;
        const selectionRenderService = this._renderManagerService.getRenderById(unitId)?.with(ISheetSelectionRenderService);
        if (selectionRenderService == null) {
            return;
        }
        const start = selectionRenderService.getCellWithCoordByOffset(startX, startY);
        if (start == null) {
            return;
        }

        const from = {
            column: start.actualColumn,
            columnOffset: startX - start.startX,
            row: start.actualRow,
            rowOffset: startY - start.startY,
        };

        const end = selectionRenderService.getCellWithCoordByOffset(endX, endY);

        if (end == null) {
            return;
        }

        const to = {
            column: end.actualColumn,
            columnOffset: endX - end.startX,
            row: end.actualRow,
            rowOffset: endY - end.startY,
        };

        return {
            from,
            to,
        };
    }

    private _featureUpdateListener() {
        this.disposeWithMe(
            this._drawingManagerService.update$.subscribe((params) => {
                (params).forEach((data) => {
                    const sheetDrawing = this._drawingManagerService.getDrawingByParam(data);

                    if (!sheetDrawing) {
                        return;
                    }

                    if (!isCanvasFloatDomDrawingType(sheetDrawing.drawingType)) {
                        return;
                    }

                    if (sheetDrawing.hidden) {
                        this._removeDom(data.drawingId);
                        return;
                    }

                    if (!this._domLayerInfoMap.has(data.drawingId)) {
                        this._drawingManagerService.addNotification([data]);
                        return;
                    }

                    const newValue = {
                        ...sheetDrawing.transform,
                    };
                    this._transformChange$.next({ id: data.drawingId, value: newValue });
                    this._canvasFloatDomService.updateFloatDom(data.drawingId, {
                        ...sheetDrawing,
                    });

                    const renderObject = this._getSceneAndTransformerByDrawingSearch(data.unitId);
                    if (renderObject && sheetDrawing.drawingType !== DrawingTypeEnum.DRAWING_CHART) {
                        const { scene } = renderObject;
                        const floatDomInfo = this._domLayerInfoMap.get(data.drawingId);
                        if (floatDomInfo?.rect) {
                            if (sheetDrawing.allowTransform === false) {
                                scene.detachTransformerFrom(floatDomInfo.rect);
                            } else {
                                scene.attachTransformerTo(floatDomInfo.rect);
                            }
                        }
                    }
                });
            })
        );
    }

    private _deleteListener() {
        this.disposeWithMe(
            this._drawingManagerService.remove$.subscribe((params) => {
                params.forEach((param) => {
                    this._removeDom(param.drawingId);
                });
            })
        );
    }

    // CreateFloatDomCommand --> floatDomService.addFloatDomToPosition
    addFloatDomToPosition(layer: ICanvasFloatDom, propId?: string) {
        const target = getSheetCommandTarget(this._univerInstanceService, {
            unitId: layer.unitId,
            subUnitId: layer.subUnitId,
        });
        if (!target) {
            throw new Error('cannot find current target!');
        }

        const { unitId, subUnitId } = target;
        const { initPosition, componentKey, data, allowTransform = true } = layer;
        const id = propId ?? generateRandomId();

        const sheetTransform = this._getPosition(initPosition, unitId);
        if (sheetTransform == null) {
            return;
        }

        const sheetDrawingParam: ISheetFloatDom = {
            unitId,
            subUnitId,
            drawingId: id,
            drawingType: layer.type || DrawingTypeEnum.DRAWING_DOM,
            componentKey,
            sheetTransform,
            transform: {
                left: initPosition.startX,
                top: initPosition.startY,
                width: initPosition.endX - initPosition.startX,
                height: initPosition.endY - initPosition.startY,
            },
            axisAlignSheetTransform: sheetTransform,
            data,
            allowTransform,
        };

        // mutation
        // ---> this._drawingManagerService.add$.subscribe
        this._commandService.executeCommand<IInsertSheetDrawingCommandParams>(InsertSheetDrawingCommand.id, {
            unitId,
            drawings: [sheetDrawingParam],
        });

        this._add$.next({ unitId, subUnitId, id });

        return this._createFloatDomDisposable(id);
    }

    private _removeDom(id: string, removeDrawing = false) {
        const info = this._domLayerInfoMap.get(id);
        if (!info) {
            return;
        }
        const { unitId, subUnitId } = info;
        this._domLayerInfoMap.delete(id);

        info.dispose.dispose();
        const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
        if (renderObject) {
            const { scene, transformer } = renderObject;
            if (disposeDrawingRenderObject(scene, { unitId, subUnitId, drawingId: id })) {
                transformer.clearControlByIds([info.rect.oKey]);
                scene.getTransformer()?.clearSelectedObjects();
            }
        }

        if (removeDrawing) {
            const param = this._drawingManagerService.getDrawingByParam({ unitId, subUnitId, drawingId: id });
            if (!param) {
                return;
            }
            const jsonOp = this._sheetDrawingService.getBatchRemoveOp([param]) as IDrawingJsonUndo1;

            const { redo, objects } = jsonOp;
            this._commandService.syncExecuteCommand(SetDrawingApplyMutation.id, { unitId, subUnitId, op: redo, objects, type: DrawingApplyType.REMOVE });
        }
    }

    removeFloatDom(id: string, removeDrawing = true) {
        this._removeDom(id, removeDrawing);
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    addFloatDomToRange(range: IRange, config: ICanvasFloatDom, domAnchor: Partial<IDOMAnchor>, propId?: string) {
        const target = getSheetCommandTarget(this._univerInstanceService, {
            unitId: config.unitId,
            subUnitId: config.subUnitId,
        });
        if (!target) {
            throw new Error('cannot find current target!');
        }
        const { unitId, subUnitId } = target;
        const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
        if (!renderObject) return;
        const currentRender = this._renderManagerService.getRenderById(unitId);
        if (!currentRender) return;
        const skeletonParam = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService).getSkeletonParam(subUnitId);
        if (!skeletonParam) return;

        const { componentKey, data, allowTransform = true } = config;
        const id = propId ?? generateRandomId();

        const { position: rangePosition, position$: rangePos$ } = this._createRangePositionObserver(range, currentRender, skeletonParam.skeleton);
        const sheetTransform = this._getPosition(rangePosition, unitId);
        if (sheetTransform == null) {
            return;
        }

        const scene = renderObject.scene;
        const { scaleX } = scene.getAncestorScale();
        const domPosFromRange = calcDomPositionByAnchor(rangePosition, domAnchor, scaleX);

        const sheetDrawingParam: ISheetFloatDom = {
            unitId,
            subUnitId,
            drawingId: id,
            drawingType: config.type || DrawingTypeEnum.DRAWING_DOM,
            componentKey,
            sheetTransform,
            axisAlignSheetTransform: sheetTransform,
            transform: {
                left: domPosFromRange.startX,
                top: domPosFromRange.startY,
                width: domPosFromRange.width,
                height: domPosFromRange.height,
            } as ITransformState,
            data,
            allowTransform,
        };

        {
            const { unitId, subUnitId, drawingId } = sheetDrawingParam;
            const target = getSheetCommandTarget(this._univerInstanceService, { unitId, subUnitId });
            const floatDomParam = sheetDrawingParam;

            const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
            if (!workbook) {
                return;
            }

            const activeSheetId = workbook.getActiveSheet().getSheetId();

            if (!floatDomParam || !target) {
                return;
            }

            const skMangerService = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService);
            if (!skMangerService) {
                return;
            }
            const skeletonParam = skMangerService.getSkeletonParam(subUnitId);
            if (!skeletonParam) {
                return;
            }

            const { transform, drawingType, data, groupId } = floatDomParam;

            if (!isCanvasFloatDomDrawingType(drawingType)) {
                return;
            }

            const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);

            if (renderObject == null) {
                return;
            }
            const { scene, canvas } = renderObject;

            if (transform == null) {
                return;
            }

            if (activeSheetId !== subUnitId) {
                return;
            }
            // from floatDomParam.transform
            const { left, top, width, height, angle, flipX, flipY, skewX, skewY } = transform;

            const rectShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
            const groupShapeKey = groupId ? getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId: groupId }) : undefined;

            const rectShape = this._getObjectIncludingGroup(scene, rectShapeKey, groupShapeKey);

            if (rectShape != null) {
                this._removeTopLevelDuplicateIfGrouped(scene, rectShapeKey, rectShape);
                if (drawingType === DrawingTypeEnum.DRAWING_CHART) {
                    applySheetChartTransformerConfig(rectShape);
                }
                rectShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
                this._syncFloatDomRect(drawingId, rectShape);
                return;
            }

            const domConfig: IRectProps = {
                left, // from floatDomParam.transform
                top,
                width,
                height,
                zIndex: this._drawingManagerService.getDrawingOrder(unitId, subUnitId).length - 1,
            };

            const isChart = drawingType === DrawingTypeEnum.DRAWING_CHART;

            if (isChart) {
                const backgroundColor = this._getChartDataBackground(data);
                if (backgroundColor !== undefined) {
                    domConfig.fill = backgroundColor;
                }
                domConfig.rotateEnabled = false;
                if (data && (data as Record<string, string>).border) {
                    domConfig.stroke = (data as Record<string, string>).border;
                }
                domConfig.paintFirst = 'stroke';
                domConfig.strokeWidth = 1;
                domConfig.radius = 8;
            }

            const domRect = this._createRenderObject({
                key: rectShapeKey,
                config: domConfig,
                unitId,
                subUnitId,
                drawingId,
                drawingType,
                data,
            });

            if (isChart) {
                domRect.setObjectType(ObjectType.CHART);
                applySheetChartTransformerConfig(domRect);
            }

            scene.addObject(domRect, DRAWING_OBJECT_LAYER_INDEX);
            if (floatDomParam.allowTransform !== false) {
                scene.attachTransformerTo(domRect);
            }
            if (isChart && groupId) {
                insertGroupObject({ drawingId: groupId, unitId, subUnitId }, domRect, scene, this._drawingManagerService);
            }
            const disposableCollection = new DisposableCollection();

            const viewMain = scene.getMainViewport();
            const { rowHeaderWidth, columnHeaderHeight } = skeletonParam.skeleton;

            const boundsOfViewArea: IBoundRectNoAngle = {
                top: columnHeaderHeight,
                left: rowHeaderWidth,
                bottom: viewMain.bottom,
                right: viewMain.right,
            };

            const floatDomInfo = {
                dispose: disposableCollection,
                rect: domRect,
                boundsOfViewArea,
                domAnchor,
                unitId,
                subUnitId,
                id: drawingId,
            } as unknown as ICanvasFloatDomInfo;

            const initedPosition = calcSheetFloatDomPosition(domRect, renderObject.renderUnit.scene, skeletonParam.skeleton, target.worksheet, floatDomInfo);
            const position$ = new BehaviorSubject<IFloatDomLayout>(initedPosition);
            floatDomInfo.position$ = position$;

            // used in FloatDom.tsx
            let floatDomCfg: IFloatDom = {
                position$,
                id: drawingId,
                componentKey: floatDomParam.componentKey,
                onPointerDown: () => { },
                onPointerMove: () => { },
                onPointerUp: () => { },
                onWheel: (evt: WheelEvent) => {
                    canvas.dispatchEvent(new WheelEvent(evt.type, evt));
                },
                data,
                unitId,
            };
            if (config.eventPassThrough) {
                floatDomCfg = {
                    ...floatDomCfg,
                    onPointerDown: (evt) => {
                        canvas.dispatchEvent(new PointerEvent(evt.type, evt));
                    },
                    onPointerMove: (evt: PointerEvent | MouseEvent) => {
                        canvas.dispatchEvent(new PointerEvent(evt.type, evt));
                    },
                    onPointerUp: (evt: PointerEvent | MouseEvent) => {
                        canvas.dispatchEvent(new PointerEvent(evt.type, evt));
                    },
                };
            }
            this._canvasFloatDomService.addFloatDom(floatDomCfg);

            this.disposeWithMe(rangePos$.subscribe((newRangePos) => {
                const calcOffsetPos = calcDomPositionByAnchor({
                    rotate: 0,
                    startX: newRangePos.startX,
                    startY: newRangePos.startY,
                    endX: newRangePos.endX,
                    endY: newRangePos.endY,
                    width: domAnchor.width ?? newRangePos.width,
                    height: domAnchor.height ?? newRangePos.height,
                    absolute: {
                        left: rangePosition.absolute.left,
                        top: rangePosition.absolute.top,
                    },
                }, domAnchor);
                const rectShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
                const newRect = new Rect(rectShapeKey, {
                    left: calcOffsetPos.startX,
                    top: calcOffsetPos.startY,
                    width: domAnchor.width ?? newRangePos.width,
                    height: domAnchor.height ?? newRangePos.height,
                    zIndex: this._drawingManagerService.getDrawingOrder(unitId, subUnitId).length - 1,
                });
                const newPos = calcSheetFloatDomPosition(newRect, renderObject.renderUnit.scene, skeletonParam.skeleton, target.worksheet, floatDomInfo);
                position$.next(newPos);
            }));
            const skm = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService);

            const skeletonSubscription = skm?.currentSkeleton$.subscribe((skeleton) => {
                if (!skeleton) return;
                if (skeletonParam.sheetId !== skeleton.sheetId) {
                    this._removeDom(id, true);
                }
            });
            skeletonSubscription && disposableCollection.add(skeletonSubscription);

            const listener = domRect.onTransformChange$.subscribeEvent(() => {
                const newPosition = calcSheetFloatDomPosition(domRect, renderObject.renderUnit.scene, skeletonParam.skeleton, target.worksheet, floatDomInfo);
                position$.next(
                    newPosition
                );
            });

            disposableCollection.add(() => {
                this._canvasFloatDomService.removeFloatDom(drawingId);
            });
            listener && disposableCollection.add(listener);
            this._domLayerInfoMap.set(drawingId, floatDomInfo);
        }

        return this._createFloatDomDisposable(id);
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    addFloatDomToColumnHeader(column: number, config: ICanvasFloatDom, domLayoutParam: IDOMAnchor, propId?: string) {
        const target = getSheetCommandTarget(this._univerInstanceService, {
            unitId: config.unitId,
            subUnitId: config.subUnitId,
        });
        if (!target) {
            throw new Error('cannot find current target!');
        }
        const { unitId, subUnitId } = target;
        const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
        if (!renderObject) return;
        const currentRender = this._renderManagerService.getRenderById(unitId);
        if (!currentRender) return;
        const skeletonParam = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService).getSkeletonParam(subUnitId);
        if (!skeletonParam) return;

        const { componentKey, data, allowTransform = true } = config;
        const id = propId ?? generateRandomId();

        // rangePostion relative to canvas.(if no scrolling)
        const { position: rangePosition, position$: rangePos$ } = this._createRangePositionObserver({
            startRow: 0,
            endRow: 0,
            startColumn: column,
            endColumn: column,
        }, currentRender, skeletonParam.skeleton);
        const headerCellPosition = rangePosition;
        headerCellPosition.startY = 0; // for column header

        const sheetTransform = this._getPosition(rangePosition, unitId);
        if (sheetTransform == null) {
            return;
        }

        const sheetDrawingParam: ISheetFloatDom = {
            unitId,
            subUnitId,
            drawingId: id,
            drawingType: config.type || DrawingTypeEnum.DRAWING_DOM,
            componentKey,
            sheetTransform,
            axisAlignSheetTransform: sheetTransform,
            transform: {
                left: headerCellPosition.startX,
                top: headerCellPosition.startY,
                width: headerCellPosition.width,
                height: headerCellPosition.height,
            } as ITransformState,
            data,
            allowTransform,
        };

        {
            const { unitId, subUnitId, drawingId } = sheetDrawingParam;
            const target = getSheetCommandTarget(this._univerInstanceService, { unitId, subUnitId });
            // const floatDomParam = this._drawingManagerService.getDrawingByParam(sheetDrawingParam) as IFloatDomData;
            const floatDomParam = sheetDrawingParam;

            const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
            if (!workbook) {
                return;
            }

            const activeSheetId = workbook.getActiveSheet().getSheetId();

            if (!floatDomParam || !target) {
                return;
            }

            const skMangerService = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService);
            if (!skMangerService) {
                return;
            }
            const skeleton = skMangerService.getSkeletonParam(subUnitId);
            if (!skeleton) {
                return;
            }

            const { transform, data } = floatDomParam;

            const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);

            if (renderObject == null) {
                return;
            }
            const { scene, canvas } = renderObject;

            if (transform == null) {
                return;
            }

            if (activeSheetId !== subUnitId) {
                return;
            }

            const { left, top, width, height, angle, flipX, flipY, skewX, skewY } = transform;

            const rectShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });

            const rectShape = this._getObjectIncludingGroup(scene, rectShapeKey);

            if (rectShape != null) {
                this._removeTopLevelDuplicateIfGrouped(scene, rectShapeKey, rectShape);
                rectShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
                this._syncFloatDomRect(drawingId, rectShape);
                return;
            }

            const calcOffsetPos = calcDomPositionByAnchor({
                rotate: 0,
                startX: headerCellPosition.startX,
                startY: 0,
                endX: rangePosition.endX,
                endY: rangePosition.endY,
                width: domLayoutParam.width,
                height: domLayoutParam.height,
                absolute: {
                    left: rangePosition.absolute.left,
                    top: rangePosition.absolute.top,
                },
            }, domLayoutParam);
            const headerRectConfig: IRectProps = {
                left: calcOffsetPos.startX,
                top: calcOffsetPos.startY,
                width: calcOffsetPos.width,
                height: calcOffsetPos.height,
                zIndex: this._drawingManagerService.getDrawingOrder(unitId, subUnitId).length - 1,
            };

            const domRect = new Rect(rectShapeKey, headerRectConfig);
            scene.addObject(domRect, DRAWING_OBJECT_LAYER_INDEX);
            if (floatDomParam.allowTransform !== false) {
                scene.attachTransformerTo(domRect);
            }
            const disposableCollection = new DisposableCollection();

            const viewMain = scene.getMainViewport();
            const boundsOfViewArea: IBoundRectNoAngle = {
                top: 0, //viewMain.top,
                left: viewMain.left,
                bottom: viewMain.bottom,
                right: viewMain.right,
            };
            const floatDomInfo = {
                dispose: disposableCollection,
                rect: domRect,
                // position$,
                unitId,
                subUnitId,
                id: drawingId,
                boundsOfViewArea,
                domAnchor: domLayoutParam,
                scrollDirectionResponse: ScrollDirectionResponse.HORIZONTAL,
            } as unknown as ICanvasFloatDomInfo;

            const initedPosition = calcSheetFloatDomPosition(domRect, renderObject.renderUnit.scene, skeleton.skeleton, target.worksheet, floatDomInfo);
            const position$ = new BehaviorSubject<IFloatDomLayout>(initedPosition);
            floatDomInfo.position$ = position$;

            let floatDomCfg: IFloatDom = {
                position$,
                id: drawingId,
                componentKey: floatDomParam.componentKey,
                onPointerDown: () => { },
                onPointerMove: () => { },
                onPointerUp: () => { },
                onWheel: (evt: WheelEvent) => {
                    canvas.dispatchEvent(new WheelEvent(evt.type, evt));
                },
                data,
                unitId,
            };
            if (config.eventPassThrough) {
                floatDomCfg = {
                    ...floatDomCfg,
                    onPointerDown: (evt) => {
                        canvas.dispatchEvent(new PointerEvent(evt.type, evt));
                    },
                    onPointerMove: (evt: PointerEvent | MouseEvent) => {
                        canvas.dispatchEvent(new PointerEvent(evt.type, evt));
                    },
                    onPointerUp: (evt: PointerEvent | MouseEvent) => {
                        canvas.dispatchEvent(new PointerEvent(evt.type, evt));
                    },
                };
            }
            this._canvasFloatDomService.addFloatDom(floatDomCfg);

            const listener = domRect.onTransformChange$.subscribeEvent(() => {
                const newPosition = calcSheetFloatDomPosition(domRect, renderObject.renderUnit.scene, skeleton.skeleton, target.worksheet, floatDomInfo);
                position$.next(
                    newPosition
                );
            });

            this.disposeWithMe(rangePos$.subscribe((newHeaderPos) => {
                const calcOffsetPos = calcDomPositionByAnchor({
                    rotate: 0,
                    startX: newHeaderPos.startX,
                    startY: 0,
                    endX: newHeaderPos.endX,
                    endY: newHeaderPos.endY,
                    width: domLayoutParam.width,
                    height: domLayoutParam.height,
                    absolute: {
                        left: rangePosition.absolute.left,
                        top: rangePosition.absolute.top,
                    },
                }, domLayoutParam);
                const rectShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
                const newRect = new Rect(rectShapeKey, {
                    left: calcOffsetPos.startX,
                    top: 0,
                    width: domLayoutParam.width,
                    height: domLayoutParam.height,
                    zIndex: this._drawingManagerService.getDrawingOrder(unitId, subUnitId).length - 1,
                });
                const newPos = calcSheetFloatDomPosition(newRect, renderObject.renderUnit.scene, skeleton.skeleton, target.worksheet, floatDomInfo);
                position$.next(newPos);
            }));

            const skm = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService);
            skm?.currentSkeleton$.subscribe((skeleton) => {
                if (!skeleton) return;
                if (skeletonParam.sheetId !== skeleton.sheetId) {
                    this._removeDom(id, true);
                }
            });

            disposableCollection.add(() => {
                this._canvasFloatDomService.removeFloatDom(drawingId);
            });
            listener && disposableCollection.add(listener);
            this._domLayerInfoMap.set(drawingId, floatDomInfo);
        }

        return this._createFloatDomDisposable(id);
    }

    /**
     * Unlike _createCellPositionObserver, this accept a range not a single cell.
     *
     * @param initialRow
     * @param initialCol
     * @param currentRender
     * @param skeleton
     * @param activeViewport
     * @returns position of cell to canvas.
     */
    // eslint-disable-next-line max-lines-per-function
    private _createRangePositionObserver(
        range: IRange,
        currentRender: IRender,
        skeleton: SpreadsheetSkeleton
    ) {
        let { startRow, startColumn } = range;
        const topLeftCoord = calcCellPositionByCell(startRow, startColumn, skeleton);
        const topLeftPos$ = new BehaviorSubject(topLeftCoord);

        const rightBottomCoord = calcCellPositionByCell(range.endRow, range.endColumn, skeleton);
        const rightBottomPos$ = new BehaviorSubject(rightBottomCoord);

        const updatePosition = () => {
            const topLeftCoord = calcCellPositionByCell(startRow, startColumn, skeleton);
            const rightBottomCoord = calcCellPositionByCell(range.endRow, range.endColumn, skeleton);

            topLeftPos$.next(topLeftCoord);
            rightBottomPos$.next(rightBottomCoord);
        };

        const disposable = new DisposableCollection();
        disposable.add(currentRender.engine.clientRect$.subscribe({
            next: () => updatePosition(),
            error: () => {},
        }));

        disposable.add(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetWorksheetRowAutoHeightMutation.id) {
                const params = commandInfo.params as ISetWorksheetRowAutoHeightMutationParams;
                if (params.rowsAutoHeightInfo.findIndex((item) => item.row === startRow) > -1) {
                    updatePosition();
                    return;
                }
            }

            if (
                COMMAND_LISTENER_SKELETON_CHANGE.indexOf(commandInfo.id) > -1 ||
                commandInfo.id === SetScrollOperation.id ||
                commandInfo.id === SetZoomRatioOperation.id
            ) {
                updatePosition();
            }
        }));

        const updateRowCol = (newRow: number, newCol: number) => {
            startRow = newRow;
            startColumn = newCol;

            updatePosition();
        };

        const genPosition = () => {
            return {
                rotate: 0,
                width: rightBottomCoord.right - topLeftCoord.left,
                height: rightBottomCoord.bottom - topLeftCoord.top,
                absolute: {
                    left: true,
                    top: true,
                },
                startX: topLeftCoord.left,
                startY: topLeftCoord.top,
                endX: rightBottomCoord.right,
                endY: rightBottomCoord.bottom,
            };
        };
        const position$ = topLeftPos$.pipe(
            map((topLeft) => {
                const rightBottomCoord = calcCellPositionByCell(range.endRow, range.endColumn, skeleton);
                return {
                    rotate: 0,
                    width: rightBottomCoord.right - topLeft.left,
                    height: rightBottomCoord.bottom - topLeft.top,
                    absolute: {
                        left: true,
                        top: true,
                    },
                    startX: topLeft.left,
                    startY: topLeft.top,
                    endX: rightBottomCoord.right,
                    endY: rightBottomCoord.bottom,
                } as IFloatDomLayout;
            })
        );
        const position: IFloatDomLayout = genPosition();

        return {
            position$,
            position,
            updateRowCol,
            topLeftPos$,
            rightBottomPos$,
            disposable,
        };
    }
}

/**
 * Unlike sheet popup, this Position only relative to sheet content, not window.
 * @param row
 * @param col
 * @param currentRender
 * @param skeleton
 * @param activeViewport
 * @returns
 */
function calcCellPositionByCell(
    row: number,
    col: number,
    skeleton: SpreadsheetSkeleton
): IBoundRectNoAngle {
    const primaryWithCoord = skeleton.getCellWithCoordByIndex(row, col);
    const cellInfo = primaryWithCoord.isMergedMainCell ? primaryWithCoord.mergeInfo : primaryWithCoord;

    return {
        left: cellInfo.startX,
        right: cellInfo.endX,
        top: cellInfo.startY,
        bottom: cellInfo.endY,
    };
}

function calcDomPositionByAnchor(rangePosition: IFloatDomLayout, domAnchor?: Partial<IDOMAnchor>, scale?: number): IFloatDomLayout {
    scale = scale ?? 1;

    const rangeWidth = rangePosition.endX - rangePosition.startX;
    const rangeHeight = rangePosition.endY - rangePosition.startY;
    const domWidth = domAnchor?.width ?? rangeWidth;
    const domHeight = domAnchor?.height ?? rangeHeight;

    let domLeft = 0;
    let domTop = 0;

    if (domAnchor) {
        if (domAnchor.horizonOffsetAlign === 'right') {
            const offsetX = calculateOffset(domAnchor.marginX, rangeWidth * scale);
            domLeft = rangePosition.endX - offsetX - domWidth;
        } else {
            // default align left
            domLeft = rangePosition.startX + calculateOffset(domAnchor.marginX, rangeWidth);
        }

        if (domAnchor.verticalOffsetAlign === 'bottom') {
            const offsetY = calculateOffset(domAnchor.marginY, rangeHeight * scale);
            domTop = rangePosition.endY - offsetY - domHeight;
        } else {
            domTop = rangePosition.startY + calculateOffset(domAnchor.marginY, rangeHeight);
        }
    }

    return {
        rotate: 0,
        startX: domLeft,
        startY: domTop,
        endX: rangePosition.endX,
        endY: rangePosition.endY,
        width: domWidth,
        height: domHeight,
        absolute: {
            left: rangePosition.absolute.left,
            top: rangePosition.absolute.top,
        },
    };
}

function calculateOffset(value: number | string | undefined, rangeWidth: number): number {
    if (value === undefined) return 0;

    // Return directly if it is a number
    if (typeof value === 'number') return value;

    // Handle percentage string
    const percentage = Number.parseFloat(value);
    return (rangeWidth * percentage) / 100;
}
