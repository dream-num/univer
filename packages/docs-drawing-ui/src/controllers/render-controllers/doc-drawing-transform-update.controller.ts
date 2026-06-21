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

import type { DocumentDataModel, ICommandInfo, IDrawingParam, ITransformState } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { Documents, DocumentSkeleton, IDocsCustomBlockRenderViewport, IDocsTableRenderViewport, IDocumentSkeletonHeaderFooter, IDocumentSkeletonPage, IDocumentSkeletonRow, IDocumentSkeletonTable, Image, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import {
    AlignTypeH,
    AlignTypeV,
    BooleanNumber,
    Disposable,
    fromEventSubject,
    ICommandService,
    Inject,
    IUniverInstanceService,
    LifecycleService,
    LifecycleStages,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
} from '@univerjs/core';
import { DocSkeletonManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { IEditorService, SetDocZoomRatioOperation } from '@univerjs/docs-ui';
import { IDrawingManagerService } from '@univerjs/drawing';
import { getDocsTableRenderViewport, getTableIdAndSliceIndex, Liquid, TRANSFORM_CHANGE_OBSERVABLE_TYPE } from '@univerjs/engine-render';
import { debounceTime, filter } from 'rxjs';
import { DocRefreshDrawingsService } from '../../services/doc-refresh-drawings.service';

interface IDrawingParamsWithBehindText {
    unitId: string;
    subUnitId: string;
    drawingId: string;
    behindText: boolean;
    hidden?: boolean;
    transform: ITransformState;
    transforms: ITransformState[];
    customBlockRenderViewport?: Partial<Pick<IDocsCustomBlockRenderViewport, 'bleedLeft' | 'bleedWidth' | 'contentHeight' | 'contentWidth' | 'height' | 'viewportHeight'>>;
    // The same drawing render in different place, like image in header and footer.
    // The default value is BooleanNumber.FALSE. if it's true, Please use transforms.
    isMultiTransform: BooleanNumber;
}

interface IDrawingClipBounds {
    left: number;
    top: number;
    width: number;
    height: number;
}

interface IDrawingTransformStateWithClipBounds extends ITransformState {
    clipBounds?: IDrawingClipBounds;
}

export function getDocsDrawingPageClipBounds(config: {
    docsLeft: number;
    docsTop: number;
    pageOffsetLeft: number;
    pageOffsetTop: number;
    clipOffsetLeft?: number;
    clipOffsetTop?: number;
    page: Pick<IDocumentSkeletonPage | IDocumentSkeletonHeaderFooter, 'pageWidth' | 'pageHeight'>;
}): IDrawingClipBounds | undefined {
    const { docsLeft, docsTop, pageOffsetLeft, pageOffsetTop, clipOffsetLeft = 0, clipOffsetTop = 0, page } = config;
    const { pageWidth, pageHeight } = page;
    if (!Number.isFinite(pageWidth) || !Number.isFinite(pageHeight) || pageWidth <= 0 || pageHeight <= 0) {
        return;
    }

    return {
        left: docsLeft + pageOffsetLeft + clipOffsetLeft,
        top: docsTop + pageOffsetTop + clipOffsetTop,
        width: pageWidth,
        height: pageHeight,
    };
}

export function getDocsDrawingClipPage(config: {
    drawing: Pick<IDrawingParamsWithBehindText, 'behindText'> & {
        transform?: Pick<ITransformState, 'width' | 'height'>;
    };
    hostPage?: Pick<IDocumentSkeletonPage, 'pageWidth' | 'pageHeight'>;
    page: Pick<IDocumentSkeletonPage | IDocumentSkeletonHeaderFooter, 'pageWidth' | 'pageHeight'>;
}): Pick<IDocumentSkeletonPage | IDocumentSkeletonHeaderFooter, 'pageWidth' | 'pageHeight'> {
    const { drawing, hostPage, page } = config;
    if (hostPage == null || drawing.behindText !== true || drawing.transform == null) {
        return page;
    }

    const { width, height } = drawing.transform;
    if (width == null || height == null) {
        return page;
    }

    if (width > page.pageWidth || height > page.pageHeight) {
        return hostPage;
    }

    const widthRatio = width / hostPage.pageWidth;
    const heightRatio = height / hostPage.pageHeight;
    if (widthRatio >= 0.8 && heightRatio >= 0.8) {
        return hostPage;
    }

    return page;
}

export function getDocsPageRelativeDrawingLeft(config: {
    hostPage: Pick<IDocumentSkeletonPage, 'pageWidth'>;
    positionH: {
        align?: AlignTypeH;
        posOffset?: number;
        relativeFrom?: ObjectRelativeFromH;
    };
    width: number;
}): number | undefined {
    const { hostPage, positionH, width } = config;
    if (positionH.relativeFrom !== ObjectRelativeFromH.PAGE) {
        return;
    }

    if (positionH.align === AlignTypeH.RIGHT) {
        return hostPage.pageWidth - width;
    }
    if (positionH.align === AlignTypeH.CENTER) {
        return hostPage.pageWidth / 2 - width / 2;
    }
    if (positionH.posOffset != null) {
        return positionH.posOffset;
    }

    return 0;
}

export function getDocsPageRelativeDrawingTop(config: {
    hostPage: Pick<IDocumentSkeletonPage, 'pageHeight'>;
    positionV: {
        align?: AlignTypeV;
        posOffset?: number;
        relativeFrom?: ObjectRelativeFromV;
    };
    height: number;
}): number | undefined {
    const { hostPage, positionV, height } = config;
    if (positionV.relativeFrom !== ObjectRelativeFromV.PAGE) {
        return;
    }

    if (positionV.align === AlignTypeV.BOTTOM) {
        return hostPage.pageHeight - height;
    }
    if (positionV.align === AlignTypeV.CENTER) {
        return hostPage.pageHeight / 2 - height / 2;
    }
    if (positionV.posOffset != null) {
        return positionV.posOffset;
    }

    return 0;
}

export function getDocsPageRelativeDrawingAnchorPage(config: {
    page: Pick<IDocumentSkeletonPage | IDocumentSkeletonHeaderFooter, 'pageWidth' | 'pageHeight'>;
    clipPage: Pick<IDocumentSkeletonPage | IDocumentSkeletonHeaderFooter, 'pageWidth' | 'pageHeight'>;
    hostPage?: Pick<IDocumentSkeletonPage, 'pageWidth' | 'pageHeight'>;
}): Pick<IDocumentSkeletonPage | IDocumentSkeletonHeaderFooter, 'pageWidth' | 'pageHeight'> | undefined {
    const { page, clipPage, hostPage } = config;
    if (hostPage != null && hostPage === clipPage) {
        return hostPage;
    }
    if (hostPage == null && page === clipPage) {
        return page;
    }
}

export function getDocsDrawingBehindText(config: {
    drawingOrigin: {
        layoutType?: PositionedObjectLayoutType;
        behindDoc?: BooleanNumber;
    };
    hostPage?: Pick<IDocumentSkeletonPage, 'pageWidth' | 'pageHeight'>;
}): boolean {
    const { drawingOrigin, hostPage } = config;
    if (hostPage != null) {
        return true;
    }

    return drawingOrigin.layoutType === PositionedObjectLayoutType.WRAP_NONE && drawingOrigin.behindDoc === BooleanNumber.TRUE;
}

export function getDocsTableCellDrawingOffset(
    unitId: string,
    table: IDocumentSkeletonTable,
    row: IDocumentSkeletonRow,
    cell: IDocumentSkeletonPage
) {
    const sourceTableId = getTableIdAndSliceIndex(table.tableId).tableId;
    const viewport = getDocsTableRenderViewport(unitId, sourceTableId);
    const hasHorizontalViewport = hasHorizontalTableViewport(viewport);
    const scrollLeft = hasHorizontalViewport ? viewport.scrollLeft : 0;

    return {
        left: table.left + cell.left - scrollLeft + cell.marginLeft,
        top: table.top + row.top + cell.marginTop,
    };
}

function hasHorizontalTableViewport(viewport: IDocsTableRenderViewport | null | undefined): viewport is IDocsTableRenderViewport {
    return viewport != null &&
        (viewport.leadingInsetLeft ?? 0) + viewport.contentWidth + (viewport.trailingInsetRight ?? 0) > viewport.viewportWidth;
}

export class DocDrawingTransformUpdateController extends Disposable implements IRenderModule {
    private _liquid = new Liquid();

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @IEditorService private readonly _editorService: IEditorService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @Inject(DocRefreshDrawingsService) private readonly _docRefreshDrawingsService: DocRefreshDrawingsService,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService,
        @Inject(LifecycleService) private _lifecycleService: LifecycleService
    ) {
        super();

        this._initialize();

        this._commandExecutedListener();
    }

    private _initialize() {
        this._initialRenderRefresh();
        this._drawingInitializeListener();
        this._initResize();
    }

    private _initialRenderRefresh() {
        this.disposeWithMe(
            this._docSkeletonManagerService.currentSkeleton$.subscribe((documentSkeleton) => {
                if (documentSkeleton == null) {
                    return;
                }

                this._refreshDrawing(documentSkeleton);
            })
        );

        this.disposeWithMe(
            this._docRefreshDrawingsService.refreshDrawings$.subscribe((skeleton) => {
                if (skeleton == null) {
                    return;
                }

                this._refreshDrawing(skeleton);
            })
        );
    }

    private _commandExecutedListener() {
        const updateCommandList = [RichTextEditingMutation.id, SetDocZoomRatioOperation.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const params = command.params as IRichTextEditingMutationParams;
                    const { unitId: commandUnitId } = params;

                    const { unitId, mainComponent } = this._context;

                    if (commandUnitId !== unitId) {
                        return;
                    }

                    const skeleton = this._docSkeletonManagerService.getSkeleton();

                    if (skeleton == null) {
                        return;
                    }

                    // TODO: @JOCS, Do not use unitId to check if it's need to render images or isEditor. maybe need a config?
                    if (this._editorService.isEditor(unitId)) {
                        mainComponent?.makeDirty();
                        return;
                    }

                    this._refreshDrawing(skeleton);
                }
            })
        );
    }

    private _initResize() {
        this.disposeWithMe(
            fromEventSubject(this._context.engine.onTransformChange$).pipe(
                filter((evt) => evt.type === TRANSFORM_CHANGE_OBSERVABLE_TYPE.resize),
                debounceTime(16)
            ).subscribe(() => {
                const skeleton = this._docSkeletonManagerService.getSkeleton();
                const { scene } = this._context;

                scene.getTransformer()?.refreshControls();
                this._refreshDrawing(skeleton);
            })
        );
    }

    private _refreshDrawing(skeleton: DocumentSkeleton) {
        const skeletonData = skeleton?.getSkeletonData();
        const { mainComponent, unitId } = this._context;
        const documentComponent = mainComponent as Documents;

        if (!skeletonData) {
            return;
        }

        const { left: docsLeft, top: docsTop, pageLayoutType, pageMarginLeft, pageMarginTop } = documentComponent;
        if (docsLeft <= -10000 || docsTop <= -10000) {
            return;
        }

        const { pages, skeHeaders, skeFooters } = skeletonData;
        const updateDrawingMap: Record<string, IDrawingParamsWithBehindText> = {}; // IFloatingObjectManagerParam

        this._liquid.reset();
        /**
         * TODO: @DR-Univer We should not refresh all floating elements, but instead make a diff.
         */
        for (let i = 0, len = pages.length; i < len; i++) {
            const page = pages[i];
            const { headerId, footerId, pageWidth } = page;

            if (headerId) {
                const headerPage = skeHeaders.get(headerId)?.get(pageWidth);

                if (headerPage) {
                    this._calculateDrawingPosition(
                        unitId,
                        headerPage,
                        docsLeft,
                        docsTop,
                        updateDrawingMap,
                        headerPage.marginTop,
                        page.marginLeft,
                        page
                    );
                    this._calculateTableCellDrawingPositions(
                        unitId,
                        headerPage,
                        docsLeft,
                        docsTop,
                        updateDrawingMap,
                        headerPage.marginTop,
                        page.marginLeft
                    );
                }
            }

            if (footerId) {
                const footerPage = skeFooters.get(footerId)?.get(pageWidth);

                if (footerPage) {
                    const footerTop = page.pageHeight - page.marginBottom + footerPage.marginTop;
                    this._calculateDrawingPosition(
                        unitId,
                        footerPage,
                        docsLeft,
                        docsTop,
                        updateDrawingMap,
                        footerTop,
                        page.marginLeft,
                        page
                    );
                    this._calculateTableCellDrawingPositions(
                        unitId,
                        footerPage,
                        docsLeft,
                        docsTop,
                        updateDrawingMap,
                        footerTop,
                        page.marginLeft
                    );
                }
            }

            this._calculateDrawingPosition(unitId, page, docsLeft, docsTop, updateDrawingMap, page.marginTop, page.marginLeft);
            this._calculateTableCellDrawingPositions(unitId, page, docsLeft, docsTop, updateDrawingMap, page.marginTop, page.marginLeft);
            this._liquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
        }

        const updateDrawings = Object.values(updateDrawingMap);

        for (const drawing of updateDrawings) {
            drawing.hidden = false;
        }

        const staleNonMultiDrawings = this._getStaleNonMultiDrawings(unitId, updateDrawingMap);
        const nonMultiDrawings = updateDrawings
            .filter((drawing) => !drawing.isMultiTransform)
            .concat(staleNonMultiDrawings);
        const multiDrawings = updateDrawings.filter((drawing) => drawing.isMultiTransform);
        if (nonMultiDrawings.length > 0) {
            this._drawingManagerService.refreshTransform(nonMultiDrawings as unknown as IDrawingParam[]);
        }

        // if multiDrawings length is 0, also need to remove current multi drawings.
        this._handleMultiDrawingsTransform(multiDrawings as unknown as IDrawingParam[]);
    }

    private _getStaleNonMultiDrawings(
        unitId: string,
        updateDrawingMap: Record<string, IDrawingParamsWithBehindText>
    ): IDrawingParamsWithBehindText[] {
        const drawingData = this._drawingManagerService.getDrawingData(unitId, unitId) ?? {};

        return Object.values(drawingData)
            .filter((drawing) => drawing.isMultiTransform !== BooleanNumber.TRUE)
            .filter((drawing) => updateDrawingMap[drawing.drawingId] == null)
            .map((drawing) => ({
                unitId,
                subUnitId: unitId,
                drawingId: drawing.drawingId,
                behindText: false,
                hidden: true,
                transform: drawing.transform,
                transforms: drawing.transforms ?? [],
                isMultiTransform: drawing.isMultiTransform ?? BooleanNumber.FALSE,
            } as IDrawingParamsWithBehindText));
    }

    private _handleMultiDrawingsTransform(multiDrawings: IDrawingParam[]) {
        const { scene, unitId } = this._context;
        const transformer = scene.getTransformerByCreate();

        // Step 1: Update data in drawingManagerService.
        multiDrawings.forEach((updateParam) => {
            const param = this._drawingManagerService.getDrawingByParam(updateParam);
            if (param == null) {
                return;
            }

            param.transform = updateParam.transform;
            param.transforms = updateParam.transforms;
            param.isMultiTransform = updateParam.isMultiTransform;
        });

        // Step 2: remove all drawing shapes.
        const selectedObjectMap = transformer.getSelectedObjectMap();
        const selectedObjectKeys = [...selectedObjectMap.keys()];

        const allMultiDrawings = Object.values(this._drawingManagerService.getDrawingData(unitId, unitId)).filter((drawing) => drawing.isMultiTransform === BooleanNumber.TRUE);

        this._drawingManagerService.removeNotification(allMultiDrawings);
        // Step 3: create new drawing shapes.
        if (multiDrawings.length > 0) {
            this._drawingManagerService.addNotification(multiDrawings);
        }

        // Step 4: reSelect previous shapes and focus previous drawings.
        for (const key of selectedObjectKeys) {
            const drawingShape = scene.getObject(key) as Image;

            if (drawingShape) {
                transformer.setSelectedControl(drawingShape);
            }
        }
    }

    private _calculateDrawingPosition(
        unitId: string,
        page: IDocumentSkeletonPage | IDocumentSkeletonHeaderFooter,
        docsLeft: number,
        docsTop: number,
        updateDrawingMap: Record<string, IDrawingParamsWithBehindText>,
        marginTop: number,
        marginLeft: number,
        hostPage?: IDocumentSkeletonPage,
        clipOffset?: { left: number; top: number }
    ) {
        const { skeDrawings } = page;
        const pageOffsetLeft = this._liquid.x;
        const pageOffsetTop = this._liquid.y;
        this._liquid.translatePagePadding({
            marginTop,
            marginLeft,
        } as IDocumentSkeletonPage);

        skeDrawings.forEach((drawing) => {
            const { aLeft, aTop, height, width, angle, drawingId, drawingOrigin } = drawing;
            const behindText = getDocsDrawingBehindText({ drawingOrigin, hostPage });
            const { isMultiTransform = BooleanNumber.FALSE } = drawingOrigin;
            const clipDrawing = {
                behindText,
                transform: {
                    width,
                    height,
                },
            };
            const clipPage = getDocsDrawingClipPage({
                drawing: clipDrawing,
                hostPage,
                page,
            });
            const pageClipBounds = getDocsDrawingPageClipBounds({
                docsLeft,
                docsTop,
                pageOffsetLeft,
                pageOffsetTop,
                clipOffsetLeft: clipOffset?.left,
                clipOffsetTop: clipOffset?.top,
                page: clipPage,
            });
            const pageRelativeAnchorPage = drawingOrigin.layoutType === PositionedObjectLayoutType.INLINE
                ? undefined
                : getDocsPageRelativeDrawingAnchorPage({
                    page,
                    clipPage,
                    hostPage,
                });
            const pageRelativeLeft = pageRelativeAnchorPage != null
                ? getDocsPageRelativeDrawingLeft({
                    hostPage: pageRelativeAnchorPage,
                    positionH: drawingOrigin.docTransform.positionH,
                    width,
                })
                : undefined;
            const pageRelativeTop = pageRelativeAnchorPage != null
                ? getDocsPageRelativeDrawingTop({
                    hostPage: pageRelativeAnchorPage,
                    positionV: drawingOrigin.docTransform.positionV,
                    height,
                })
                : undefined;
            const transform = {
                left: (pageRelativeLeft ?? aLeft) + docsLeft + (pageRelativeLeft == null ? this._liquid.x : pageOffsetLeft),
                top: (pageRelativeTop ?? aTop) + docsTop + (pageRelativeTop == null ? this._liquid.y : pageOffsetTop),
                width,
                height,
                angle,
                clipBounds: pageClipBounds,
            } as IDrawingTransformStateWithClipBounds;
            if (updateDrawingMap[drawingId] == null) {
                updateDrawingMap[drawingId] = {
                    unitId,
                    subUnitId: unitId,
                    drawingId,
                    behindText,
                    transform,
                    transforms: [transform],
                    customBlockRenderViewport: drawing.customBlockRenderViewport,
                    isMultiTransform,
                };
            } else if (isMultiTransform === BooleanNumber.TRUE) {
                updateDrawingMap[drawingId].transforms.push(transform);
            }
        });

        this._liquid.restorePagePadding({
            marginTop,
            marginLeft,
        } as IDocumentSkeletonPage);
    }

    private _calculateTableCellDrawingPositions(
        unitId: string,
        page: IDocumentSkeletonPage | IDocumentSkeletonHeaderFooter,
        docsLeft: number,
        docsTop: number,
        updateDrawingMap: Record<string, IDrawingParamsWithBehindText>,
        baseMarginTop: number,
        baseMarginLeft: number
    ) {
        page.skeTables?.forEach((table) => {
            table.rows.forEach((row) => {
                row.cells.forEach((cell) => {
                    const cellOffset = getDocsTableCellDrawingOffset(unitId, table, row, cell);
                    const marginTop = baseMarginTop + cellOffset.top;
                    const marginLeft = baseMarginLeft + cellOffset.left;

                    this._calculateDrawingPosition(
                        unitId,
                        cell,
                        docsLeft,
                        docsTop,
                        updateDrawingMap,
                        marginTop,
                        marginLeft,
                        undefined,
                        { left: marginLeft, top: marginTop }
                    );
                    this._calculateTableCellDrawingPositions(
                        unitId,
                        cell,
                        docsLeft,
                        docsTop,
                        updateDrawingMap,
                        marginTop,
                        marginLeft
                    );
                });
            });
        });
    }

    private _drawingInitializeListener() {
        const init = () => {
            const skeleton = this._docSkeletonManagerService.getSkeleton();
            if (skeleton == null) {
                return;
            }

            this._drawingManagerService.initializeNotification(this._context.unitId);
            this._refreshDrawing(skeleton);
        };

        if (this._lifecycleService.stage >= LifecycleStages.Rendered) {
            if (this._docSkeletonManagerService.getSkeleton()) {
                init();
            } else {
                // wait render-unit ready
                setTimeout(init, 500);
            }
        } else {
            this.disposeWithMe(this._lifecycleService.lifecycle$.pipe(filter((stage) => stage === LifecycleStages.Rendered)).subscribe(init));
        }
    }
}
