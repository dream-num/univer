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

import type { DocumentDataModel, IPosition, Nullable } from '@univerjs/core';
import type { DocumentSkeleton, IDocumentLayoutObject, Scene } from '@univerjs/engine-render';
import { Disposable, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, HorizontalAlign, IConfigService, IUniverInstanceService, TextDirection, UniverInstanceType, VerticalAlign, WrapStrategy } from '@univerjs/core';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { DOCS_COMPONENT_MAIN_LAYER_INDEX, VIEWPORT_KEY } from '@univerjs/docs-ui';
import { convertTextRotation, fixLineWidthByScale, getCurrentTypeOfRenderer, IRenderManagerService, Rect, ScrollBar } from '@univerjs/engine-render';
import { ILayoutService } from '@univerjs/ui';
import { getEditorObject } from '../../basics/editor/get-editor-object';
import { IEditorBridgeService } from '../editor-bridge.service';
import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';
import { ICellEditorManagerService } from './cell-editor-manager.service';

const EDITOR_INPUT_SELF_EXTEND_GAP = 5;

const EDITOR_BORDER_SIZE = 2;

interface ICanvasOffset {
    left: number;
    top: number;
}

export class SheetCellEditorResizeService extends Disposable {
    constructor(
        @ILayoutService private readonly _layoutService: ILayoutService,
        @ICellEditorManagerService private readonly _cellEditorManagerService: ICellEditorManagerService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();
    }

    private get _currentRenderer() {
        return getCurrentTypeOfRenderer(UniverInstanceType.UNIVER_SHEET, this._univerInstanceService, this._renderManagerService);
    }

    private get _editingUnitId() {
        return this._editorBridgeService.getEditCellState()?.unitId ?? '';
    }

    private get _editingRenderer() {
        return this._renderManagerService.getRenderById(this._editingUnitId);
    }

    private get _renderer() {
        const currentUnitId = this._univerInstanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET)?.getUnitId();
        return this._editingUnitId === currentUnitId ? this._editingRenderer : this._currentRenderer;
    }

    private get _sheetSkeletonManagerService() {
        return this._renderer?.with(SheetSkeletonManagerService);
    }

    private get engine() {
        return this._renderer?.engine;
    }

    private _getEffectiveHorizontalAlign(horizontalAlign: HorizontalAlign): HorizontalAlign {
        if (horizontalAlign === HorizontalAlign.UNSPECIFIED
            && this._editorBridgeService.getEffectiveTextDirection() === TextDirection.RIGHT_TO_LEFT) {
            return HorizontalAlign.RIGHT;
        }
        return horizontalAlign;
    }

    fitTextSize(callback?: () => void) {
        const param = this._editorBridgeService.getEditCellState();
        if (!param) return;
        const { position, documentLayoutObject, canvasOffset, scaleX, scaleY } = param;

        const { startX, startY, endX, endY } = position;
        const documentDataModel = this._univerInstanceService.getUnit<DocumentDataModel>(DOCS_NORMAL_EDITOR_UNIT_ID_KEY, UniverInstanceType.UNIVER_DOC);

        if (documentDataModel == null) {
            return;
        }

        const documentSkeleton = this._getEditorSkeleton();
        if (!documentSkeleton) return;

        const info = this._predictingSize(
            position,
            canvasOffset,
            documentSkeleton,
            documentLayoutObject,
            scaleX,
            scaleY
        );
        if (!info || info.actualWidth <= 0) return;
        let { actualWidth, actualHeight } = info;
        const { verticalAlign, horizontalAlign, paddingData, fill } = documentLayoutObject;
        // For RTL cells whose horizontal alignment isn't explicitly set we
        // mirror the LTR default: behave as if the cell were RIGHT-aligned so
        // overflow (when content is wider than the cell) extends towards the
        // left. We consult the **live** effective direction (re-emitted by
        // the editor bridge on every keystroke) so the editor flips its
        // overflow side mid-edit when the user types Arabic into a previously
        // empty/LTR cell.
        const effectiveHorizontalAlign = this._getEffectiveHorizontalAlign(horizontalAlign);
        actualWidth = actualWidth + (paddingData.l ?? 0) * scaleX + (paddingData.r ?? 0) * scaleX;
        actualHeight = actualHeight + (paddingData.t ?? 0) * scaleY + (paddingData.b ?? 0) * scaleY;
        let editorWidth = endX - startX;
        let editorHeight = endY - startY;
        if (editorWidth < actualWidth) {
            editorWidth = Math.ceil(actualWidth);
        }

        if (editorHeight < actualHeight) {
            editorHeight = Math.ceil(actualHeight);
        }

        // Set the top margin under vertical alignment.
        let offsetTop = 0;

        if (verticalAlign === VerticalAlign.MIDDLE) {
            offsetTop = (editorHeight - actualHeight) / 2 / scaleY;
        } else if (verticalAlign === VerticalAlign.TOP) {
            offsetTop = paddingData.t || 0;
        } else {
            // VerticalAlign.UNSPECIFIED follow the same rule as HorizontalAlign.BOTTOM.
            offsetTop = (editorHeight - actualHeight) / scaleY;
        }

        let offsetLeft = 0;
        if (effectiveHorizontalAlign === HorizontalAlign.CENTER
            || effectiveHorizontalAlign === HorizontalAlign.RIGHT) {
            // Match static cell render: page-level align via `_horizontalHandler`
            // (+ selection `computeDocumentPageAlignOffset`). Margin-based
            // center/right offsets stack and break LTR center / RTL / right (#6039).
            offsetLeft = paddingData.l || 0;
        } else {
            offsetLeft = paddingData.l || 0;
        }
        offsetTop = Math.max(offsetTop, paddingData.t || 0);
        offsetLeft = Math.max(offsetLeft, paddingData.l || 0);
        documentDataModel.updateDocumentDataMargin({
            t: offsetTop,
            l: offsetLeft,
        });

        documentSkeleton.calculate();
        this._editAreaProcessing(
            editorWidth,
            editorHeight,
            position,
            canvasOffset,
            fill,
            scaleX,
            scaleY,
            effectiveHorizontalAlign,
            callback
        );
    }

    /**
     * Mainly used to pre-calculate the width of the editor,
     * to determine whether it needs to be automatically widened.
     */
    private _predictingSize(
        actualRangeWithCoord: IPosition,
        canvasOffset: ICanvasOffset,
        documentSkeleton: DocumentSkeleton,
        documentLayoutObject: IDocumentLayoutObject,
        scaleX: number = 1,
        scaleY: number = 1
    ) {
        // startX and startY are the width and height after scaling.
        const { startX, endX } = actualRangeWithCoord;

        const { textRotation, wrapStrategy, paddingData } = documentLayoutObject;

        const documentDataModel = this._univerInstanceService.getUnit<DocumentDataModel>(DOCS_NORMAL_EDITOR_UNIT_ID_KEY, UniverInstanceType.UNIVER_DOC);

        const { vertexAngle: angle } = convertTextRotation(textRotation);

        if (wrapStrategy === WrapStrategy.WRAP && angle === 0) {
            documentDataModel?.updateDocumentDataPageSize((endX - startX) / scaleX);
            documentDataModel?.updateDocumentDataMargin({ l: paddingData.l, t: paddingData.t });
            documentSkeleton.calculate();
            const { actualWidth, actualHeight } = documentSkeleton.getActualSize();
            // The skeleton obtains the original volume, which needs to be multiplied by the magnification factor.
            return {
                actualWidth: actualWidth * scaleX,
                actualHeight: actualHeight * scaleY,
            };
        }

        const effectiveHorizontalAlign = this._getEffectiveHorizontalAlign(documentLayoutObject.horizontalAlign);
        if ((effectiveHorizontalAlign === HorizontalAlign.CENTER
            || effectiveHorizontalAlign === HorizontalAlign.RIGHT) && angle === 0) {
            return this._predictingSizeForSheetCellAlign(
                actualRangeWithCoord,
                documentSkeleton,
                documentDataModel,
                scaleX,
                scaleY,
                paddingData,
                effectiveHorizontalAlign
            );
        }

        const cellHorizontalAlign = documentLayoutObject.horizontalAlign;

        const maxSize = this._getEditorMaxSize(actualRangeWithCoord, canvasOffset, documentLayoutObject.horizontalAlign);
        if (!maxSize) return;
        documentDataModel?.updateDocumentDataPageSize(maxSize.width / scaleX);
        documentSkeleton.calculate();

        const size = documentSkeleton.getActualSize();
        let editorWidth = endX - startX;

        if (editorWidth < size.actualWidth * scaleX + EDITOR_INPUT_SELF_EXTEND_GAP * scaleX) {
            editorWidth = size.actualWidth * scaleX + EDITOR_INPUT_SELF_EXTEND_GAP * scaleX;
        }

        // Scaling is handled by the renderer, so the skeleton only accepts the original width and height, which need to be divided by the magnification factor.
        documentDataModel?.updateDocumentDataPageSize(editorWidth / scaleX);
        documentSkeleton.calculate();
        const finalSize = documentSkeleton.getActualSize();

        documentDataModel?.updateDocumentRenderConfig({
            horizontalAlign: cellHorizontalAlign !== HorizontalAlign.UNSPECIFIED
                ? cellHorizontalAlign
                : HorizontalAlign.UNSPECIFIED,
            cellValueType: undefined,
        });

        return {
            actualWidth: finalSize.actualWidth * scaleX,
            actualHeight: finalSize.actualHeight * scaleY,
        };
    }

    /**
     * Center / right + overflow (default): mirror static sheet cells —
     * pageSize stays infinite so line-level align uses `_horizontalHandler`
     * (and RTL per-line flush). Never use `cellWidth + 2*min(gaps)` as pageSize.
     */
    private _predictingSizeForSheetCellAlign(
        actualRangeWithCoord: IPosition,
        documentSkeleton: DocumentSkeleton,
        documentDataModel: Nullable<DocumentDataModel>,
        scaleX: number,
        scaleY: number,
        paddingData: IDocumentLayoutObject['paddingData'],
        horizontalAlign: HorizontalAlign.CENTER | HorizontalAlign.RIGHT
    ) {
        const { startX, endX } = actualRangeWithCoord;
        const cellWidthCanvas = endX - startX;

        documentDataModel?.updateDocumentDataPageSize(Number.POSITIVE_INFINITY);
        documentDataModel?.updateDocumentDataMargin({
            l: paddingData.l,
            r: paddingData.r,
            t: paddingData.t,
            b: paddingData.b,
        });
        const renderConfig = documentDataModel?.getSnapshot().documentStyle?.renderConfig ?? {};
        documentDataModel?.updateDocumentRenderConfig({
            ...renderConfig,
            horizontalAlign,
            cellValueType: undefined,
        });
        documentSkeleton.calculate();

        const { actualWidth, actualHeight } = documentSkeleton.getActualSize();
        let editorWidthCanvas = cellWidthCanvas;

        if (editorWidthCanvas < actualWidth * scaleX + EDITOR_INPUT_SELF_EXTEND_GAP * scaleX) {
            editorWidthCanvas = actualWidth * scaleX + EDITOR_INPUT_SELF_EXTEND_GAP * scaleX;
        }

        return {
            actualWidth: actualWidth * scaleX,
            actualHeight: actualHeight * scaleY,
        };
    }

    private _getEditorMaxSize(position: IPosition, canvasOffset: ICanvasOffset, horizontalAlign: HorizontalAlign) {
        const editorObject = this._getEditorObject();
        if (editorObject == null) {
            return;
        }
        function pxToNum(width: string): number {
            return Number.parseInt(width.replace('px', ''));
        }

        const engine = this.engine;
        if (!engine) return;
        const canvasElement = engine.getCanvasElement();
        const canvasClientRect = canvasElement.getBoundingClientRect();

        // We should take the scale into account when canvas is scaled by CSS.
        const widthOfCanvas = pxToNum(canvasElement.style.width); // declared width
        const { width, height } = canvasClientRect; // real width affected by scale
        const scaleAdjust = width / widthOfCanvas;
        const { startX, startY, endX } = position;
        const enginWidth = engine.width;

        const maxHeight = height - startY - EDITOR_BORDER_SIZE * 2;

        let maxWidth = width - startX;
        if (horizontalAlign === HorizontalAlign.CENTER) {
            const rightGap = enginWidth - endX;
            const leftGap = startX;
            maxWidth = (endX - startX) + Math.min(leftGap, rightGap) * 2;
        } else if (horizontalAlign === HorizontalAlign.RIGHT) {
            maxWidth = endX;
        }
        maxWidth = maxWidth - EDITOR_BORDER_SIZE * 2;

        return {
            height: maxHeight,
            width: maxWidth,
            scaleAdjust,
        };
    }

    /**
     * Mainly used to calculate the volume of scenes and objects,
     * determine whether a scrollbar appears,
     * and calculate the editor's boundaries relative to the browser.
     */
    // eslint-disable-next-line max-lines-per-function
    private _editAreaProcessing(
        editorWidth: number,
        editorHeight: number,
        actualRangeWithCoord: IPosition,
        canvasOffset: ICanvasOffset,
        fill: Nullable<string>,
        scaleX: number = 1,
        scaleY: number = 1,
        horizontalAlign: HorizontalAlign,
        callback?: () => void
    ) {
        const editorObject = this._getEditorObject();
        if (editorObject == null) {
            return;
        }

        const engine = this.engine;
        if (!engine) return;
        const canvasElement = engine.getCanvasElement();

        // We should take the scale into account when canvas is scaled by CSS.
        let { startX, startY } = actualRangeWithCoord;

        const { document: documentComponent, scene: editorScene, engine: docEngine } = editorObject;
        const viewportMain = editorScene.getViewport(VIEWPORT_KEY.VIEW_MAIN);

        const info = this._getEditorMaxSize(actualRangeWithCoord, canvasOffset, horizontalAlign)!;

        const { height: clientHeight, width: clientWidth, scaleAdjust } = info;

        let physicHeight = editorHeight;

        let scrollBar = viewportMain?.getScrollBar() as Nullable<ScrollBar>;

        if (physicHeight > clientHeight) {
            if (scrollBar == null) {
                viewportMain && new ScrollBar(viewportMain, { enableHorizontal: false, barSize: 8 });
            } else {
                viewportMain?.resetCanvasSizeAndUpdateScroll();
            }
            viewportMain?.scrollToViewportPos({
                viewportScrollY: physicHeight - clientHeight,
            });

            physicHeight = clientHeight;
        } else {
            scrollBar = null;
            viewportMain?.getScrollBar()?.dispose();
        }

        if ((horizontalAlign === HorizontalAlign.CENTER || horizontalAlign === HorizontalAlign.RIGHT) && viewportMain) {
            viewportMain.scrollToViewportPos({
                viewportScrollX: 0,
                viewportScrollY: viewportMain.viewportScrollY ?? 0,
            });
        }

        editorWidth += scrollBar?.barSize || 0;

        if (editorWidth > clientWidth) {
            editorWidth = clientWidth;
        }

        this._addBackground(editorScene, editorWidth / scaleX, editorHeight / scaleY, fill);

        const { scaleX: precisionScaleX, scaleY: precisionScaleY } = editorScene.getPrecisionScale();

        editorScene.transformByState({
            width: editorWidth * scaleAdjust / scaleX,
            height: editorHeight * scaleAdjust / scaleY,
            scaleX: scaleX * scaleAdjust,
            scaleY: scaleY * scaleAdjust,
        });

        documentComponent.resize(editorWidth * scaleAdjust / scaleX, editorHeight * scaleAdjust / scaleY);

        /**
         * sometimes requestIdleCallback is invalid, so use setTimeout to ensure the successful execution of the resizeBySize method.
         * resize canvas
         * When modifying the selection area for a formula, it is necessary to add a setTimeout to ensure successful updating.
         */
        setTimeout(() => {
            docEngine.resizeBySize(
                fixLineWidthByScale(editorWidth, precisionScaleX),
                fixLineWidthByScale(physicHeight, precisionScaleY)
            );

            callback?.();
        }, 0);

        const contentBoundingRect = this._layoutService.getContentElement().getBoundingClientRect();
        const canvasBoundingRect = canvasElement.getBoundingClientRect();
        startX = startX * scaleAdjust + (canvasBoundingRect.left - contentBoundingRect.left);
        startY = startY * scaleAdjust + (canvasBoundingRect.top - contentBoundingRect.top);

        const cellWidth = actualRangeWithCoord.endX - actualRangeWithCoord.startX;
        if (horizontalAlign === HorizontalAlign.RIGHT && editorWidth > cellWidth) {
            startX += (cellWidth - editorWidth) * scaleAdjust;
        } else if (horizontalAlign === HorizontalAlign.CENTER && editorWidth > cellWidth) {
            startX += ((cellWidth - editorWidth) * scaleAdjust) / 2;
        }

        // Update cell editor container position and size.
        this._cellEditorManagerService.setState({
            startX,
            startY,
            endX: editorWidth * scaleAdjust + startX,
            endY: physicHeight * scaleAdjust + startY,
            show: true,
        });
    }

    /**
     * Since the document does not support cell background color, an additional rect needs to be added.
     */
    private _addBackground(scene: Scene, editorWidth: number, editorHeight: number, fill?: Nullable<string>) {
        const fillRectKey = '_backgroundRectHelperColor_';
        const rect = scene.getObject(fillRectKey) as Rect;

        if (rect == null && fill == null) {
            return;
        }

        if (rect == null) {
            scene.addObjects(
                [
                    new Rect(fillRectKey, {
                        width: editorWidth,
                        height: editorHeight,
                        fill,
                        evented: false,
                    }),
                ],
                DOCS_COMPONENT_MAIN_LAYER_INDEX
            );
        } else if (fill == null) {
            rect.dispose();
        } else {
            rect.setProps({
                fill,
            });

            rect.transformByState({
                width: editorWidth,
                height: editorHeight,
            });
        }
    }

    resizeCellEditor(callback?: () => void) {
        const state = this._cellEditorManagerService.getState();

        if (!state) return;
        if (!this._editorBridgeService.isVisible().visible) return;
        this._editorBridgeService.refreshEditCellPosition(true);
        const editCellState = this._editorBridgeService.getEditCellState();
        if (!editCellState) return;

        const skeleton = this._sheetSkeletonManagerService?.getSkeletonParam(editCellState.sheetId)?.skeleton;
        if (!skeleton) return;
        const { row, column, scaleX, scaleY, position, canvasOffset, documentLayoutObject } = editCellState;
        const { horizontalAlign } = documentLayoutObject;
        const effectiveHorizontalAlign = this._getEffectiveHorizontalAlign(horizontalAlign);
        const maxSize = this._getEditorMaxSize(position, canvasOffset, effectiveHorizontalAlign);
        if (!maxSize) return;
        const { height: clientHeight, width: clientWidth, scaleAdjust } = maxSize;

        const cell = skeleton.getCellWithCoordByIndex(row, column);
        const height = Math.min((cell.mergeInfo.endY - cell.mergeInfo.startY) * scaleY, clientHeight) * scaleAdjust;
        const width = Math.min((cell.mergeInfo.endX - cell.mergeInfo.startX) * scaleX, clientWidth) * scaleAdjust;
        const currentHeight = state.endY! - state.startY!;
        const currentWidth = state.endX! - state.startX!;

        if (currentHeight !== height || currentWidth !== width) {
            this._editorBridgeService.refreshEditCellPosition(true);

            const docSkeleton = this._getEditorSkeleton();
            if (!docSkeleton) {
                return;
            }
            this.fitTextSize(callback);
        }
    }

    private _getEditorObject() {
        return getEditorObject(this._editorBridgeService.getCurrentEditorId(), this._renderManagerService);
    }

    private _getEditorSkeleton() {
        return this._renderManagerService.getRenderById(DOCS_NORMAL_EDITOR_UNIT_ID_KEY)?.with(DocSkeletonManagerService).getSkeleton();
    }
}
