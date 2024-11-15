/**
 * Copyright 2023-present DreamNum Inc.
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

import type { IPosition, Nullable, Workbook } from '@univerjs/core';
import type { DocumentSkeleton, IDocumentLayoutObject, IRenderContext, IRenderModule, Scene } from '@univerjs/engine-render';
import { Disposable, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, HorizontalAlign, Inject, VerticalAlign, WrapStrategy } from '@univerjs/core';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { VIEWPORT_KEY as DOC_VIEWPORT_KEY, DOCS_COMPONENT_MAIN_LAYER_INDEX } from '@univerjs/docs-ui';
import { convertTextRotation, FIX_ONE_PIXEL_BLUR_OFFSET, fixLineWidthByScale, IRenderManagerService, Rect, ScrollBar } from '@univerjs/engine-render';
import { ILayoutService } from '@univerjs/ui';
import { getEditorObject } from '../../basics/editor/get-editor-object';
import styles from '../../views/sheet-container/index.module.less';
import { IEditorBridgeService } from '../editor-bridge.service';
import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';
import { ICellEditorManagerService } from './cell-editor-manager.service';

const EDITOR_INPUT_SELF_EXTEND_GAP = 5;

const EDITOR_BORDER_SIZE = 2;

interface ICanvasOffset {
    left: number;
    top: number;
}

export class SheetCellEditorResizeService extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @ILayoutService private readonly _layoutService: ILayoutService,
        @ICellEditorManagerService private readonly _cellEditorManagerService: ICellEditorManagerService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService
    ) {
        super();
    }

    fitTextSize(callback?: () => void) {
        const param = this._editorBridgeService.getEditCellState();
        if (!param) return;
        const { position, documentLayoutObject, canvasOffset, scaleX, scaleY } = param;

        const { startX, startY, endX, endY } = position;
        const documentDataModel = documentLayoutObject.documentModel;

        if (documentDataModel == null) {
            return;
        }

        const documentSkeleton = this._getEditorSkeleton();
        if (!documentSkeleton) return;

        const { actualWidth, actualHeight } = this._predictingSize(
            position,
            canvasOffset,
            documentSkeleton,
            documentLayoutObject,
            scaleX,
            scaleY
        );
        const { verticalAlign, paddingData, fill } = documentLayoutObject;

        let editorWidth = endX - startX;
        let editorHeight = endY - startY;

        if (editorWidth < actualWidth) {
            editorWidth = actualWidth;
        }

        if (editorHeight < actualHeight) {
            editorHeight = actualHeight;
            // To restore the page margins for the skeleton.
            documentDataModel.updateDocumentDataMargin(paddingData);
        } else {
            // Set the top margin under vertical alignment.
            let offsetTop = 0;

            if (verticalAlign === VerticalAlign.MIDDLE) {
                offsetTop = (editorHeight - actualHeight) / 2 / scaleY;
            } else if (verticalAlign === VerticalAlign.TOP) {
                offsetTop = paddingData.t || 0;
            } else { // VerticalAlign.UNSPECIFIED follow the same rule as HorizontalAlign.BOTTOM.
                offsetTop = (editorHeight - actualHeight) / scaleY - (paddingData.b || 0);
            }

            // offsetTop /= scaleY;
            offsetTop = offsetTop < (paddingData.t || 0) ? paddingData.t || 0 : offsetTop;

            documentDataModel.updateDocumentDataMargin({
                t: offsetTop,
            });
        }

        // re-calculate skeleton(viewModel for component)
        documentSkeleton.calculate();

        this._editAreaProcessing(editorWidth, editorHeight, position, canvasOffset, fill, scaleX, scaleY, callback);
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

        const { textRotation, wrapStrategy } = documentLayoutObject;

        const documentDataModel = documentLayoutObject.documentModel;

        const { vertexAngle: angle } = convertTextRotation(textRotation);

        const clientWidth = document.body.clientWidth;

        if (wrapStrategy === WrapStrategy.WRAP && angle === 0) {
            const { actualWidth, actualHeight } = documentSkeleton.getActualSize();
            // The skeleton obtains the original volume, which needs to be multiplied by the magnification factor.
            return {
                actualWidth: actualWidth * scaleX,
                actualHeight: actualHeight * scaleY,
            };
        }

        documentDataModel?.updateDocumentDataPageSize((clientWidth - startX - canvasOffset.left) / scaleX);
        documentSkeleton.calculate();

        const size = documentSkeleton.getActualSize();

        let editorWidth = endX - startX;

        if (editorWidth < size.actualWidth * scaleX + EDITOR_INPUT_SELF_EXTEND_GAP * scaleX) {
            editorWidth = size.actualWidth * scaleX + EDITOR_INPUT_SELF_EXTEND_GAP * scaleX;
        }

        // Scaling is handled by the renderer, so the skeleton only accepts the original width and height, which need to be divided by the magnification factor.
        documentDataModel?.updateDocumentDataPageSize(editorWidth / scaleX);

        /**
         * Do not rely on cell layout logic, depend on the document's internal alignment logic.
         */
        documentDataModel?.updateDocumentRenderConfig({
            horizontalAlign: HorizontalAlign.UNSPECIFIED,
            cellValueType: undefined,
        });

        return {
            actualWidth: editorWidth,
            actualHeight: size.actualHeight * scaleY,
        };
    }

    private _getEditorMaxSize(position: IPosition, canvasOffset: ICanvasOffset) {
        const editorObject = this._getEditorObject();
        if (editorObject == null) {
            return;
        }
        function pxToNum(width: string): number {
            return Number.parseInt(width.replace('px', ''));
        }

        const engine = this._context.engine;
        const canvasElement = engine.getCanvasElement();
        const canvasClientRect = canvasElement.getBoundingClientRect();

        // We should take the scale into account when canvas is scaled by CSS.
        const widthOfCanvas = pxToNum(canvasElement.style.width); // declared width
        const { width } = canvasClientRect; // real width affected by scale
        const scaleAdjust = width / widthOfCanvas;

        const { startX, startY } = position;

        const clientHeight =
            document.body.clientHeight -
            startY -
            Number.parseFloat(styles.sheetFooterBarHeight) -
            canvasOffset.top -
            EDITOR_BORDER_SIZE * 2;

        const clientWidth = document.body.clientWidth - startX - canvasOffset.left;

        return {
            height: clientHeight,
            width: clientWidth,
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
        callback?: () => void
    ) {
        const editorObject = this._getEditorObject();
        if (editorObject == null) {
            return;
        }

        const engine = this._context.engine;
        const canvasElement = engine.getCanvasElement();

        // We should take the scale into account when canvas is scaled by CSS.

        let { startX, startY } = actualRangeWithCoord;

        const { document: documentComponent, scene: editorScene, engine: docEngine } = editorObject;
        const viewportMain = editorScene.getViewport(DOC_VIEWPORT_KEY.VIEW_MAIN);

        const info = this._getEditorMaxSize(actualRangeWithCoord, canvasOffset);
        if (!info) return;
        const { height: clientHeight, width: clientWidth, scaleAdjust } = info;

        let physicHeight = editorHeight;

        let scrollBar = viewportMain?.getScrollBar() as Nullable<ScrollBar>;

        if (physicHeight > clientHeight) {
            physicHeight = clientHeight;

            if (scrollBar == null) {
                viewportMain && new ScrollBar(viewportMain, { enableHorizontal: false, barSize: 8 });
            } else {
                viewportMain?.resetCanvasSizeAndUpdateScroll();
            }
        } else {
            scrollBar = null;
            viewportMain?.getScrollBar()?.dispose();
        }

        editorWidth += scrollBar?.barSize || 0;

        if (editorWidth > clientWidth) {
            editorWidth = clientWidth;
        }

        startX -= FIX_ONE_PIXEL_BLUR_OFFSET;
        startY -= FIX_ONE_PIXEL_BLUR_OFFSET;

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

        const skeleton = this._sheetSkeletonManagerService.getWorksheetSkeleton(editCellState.sheetId)?.skeleton;
        if (!skeleton) return;
        const { row, column, scaleX, scaleY, position, canvasOffset } = editCellState;
        const maxSize = this._getEditorMaxSize(position, canvasOffset);
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
