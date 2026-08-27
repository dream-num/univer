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

import type { DocumentDataModel, ICommandInfo, IDocDrawingBase, IDrawingParam, IExecutionOptions, ITransformState } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type {
    DocumentSkeleton,
    IDocsCustomBlockRenderViewport,
    IDocsTableRenderViewport,
    IDocumentLayoutProgress,
    IDocumentSkeletonCached,
    IDocumentSkeletonDrawing,
    IDocumentSkeletonHeaderFooter,
    IDocumentSkeletonPage,
    IDocumentSkeletonRow,
    IDocumentSkeletonTable,
    Image,
    IRenderContext,
    IRenderModule,
} from '@univerjs/engine-render';
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
import {
    Documents,
    getDocsTableRenderViewport,
    getTableIdAndSliceIndex,
    Liquid,
    TRANSFORM_CHANGE_OBSERVABLE_TYPE,
} from '@univerjs/engine-render';
import { animationFrames, debounceTime, EMPTY, filter, map, merge, startWith, switchMap, take } from 'rxjs';
import { DocRefreshDrawingsService } from '../../services/doc-refresh-drawings.service';

interface IDrawingParamsWithBehindText {
    unitId: string;
    subUnitId: string;
    drawingId: string;
    behindText: boolean;
    hidden?: boolean;
    transform: ITransformState;
    transforms: ITransformState[];
    customBlockRenderViewport?: Partial<Pick<IDocsCustomBlockRenderViewport, 'bleedLeft' | 'bleedWidth' | 'contentHeight' | 'contentWidth' | 'height' | 'pageContentWidth' | 'viewportHeight'>>;
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

interface IDrawingPositionContext {
    unitId: string;
    page: IDocumentSkeletonPage | IDocumentSkeletonHeaderFooter;
    docsLeft: number;
    docsTop: number;
    pageOffsetLeft: number;
    pageOffsetTop: number;
    updateDrawingMap: Record<string, IDrawingParamsWithBehindText>;
    hostPage?: IDocumentSkeletonPage;
    clipOffset?: { left: number; top: number };
}

/**
 * Overlay drawings do not participate in text layout. While their skeleton
 * anchor remains valid, use the latest model transform so drag/resize/front-
 * behind changes can paint immediately without rebuilding document pages.
 */
export function getDocsOverlayRuntimeDrawing(
    skeletonDrawing: Pick<IDocDrawingBase, 'docTransform' | 'layoutType'> & Partial<IDocDrawingBase>,
    currentDrawing: (Pick<IDocDrawingBase, 'docTransform' | 'layoutType'> & Partial<IDocDrawingBase>) | undefined
): Pick<IDocDrawingBase, 'docTransform' | 'layoutType'> & Partial<IDocDrawingBase> {
    return skeletonDrawing.layoutType === PositionedObjectLayoutType.WRAP_NONE &&
        currentDrawing?.layoutType === PositionedObjectLayoutType.WRAP_NONE
        ? currentDrawing
        : skeletonDrawing;
}

export type DocumentDrawingPublicationProgress = Pick<
    IDocumentLayoutProgress,
    'generation' | 'didPublish' | 'complete' | 'publishedPageCount' | 'reason' | 'didPublishAnchor'
>;

interface IDocumentDrawingPublicationNestedPage {
    skeDrawings: ReadonlyMap<string, unknown>;
    skeTables?: ReadonlyMap<string, {
        rows: Array<{ cells: IDocumentDrawingPublicationNestedPage[] }>;
    }>;
    skeColumnGroups?: ReadonlyMap<string, {
        columns: Array<{ page: IDocumentDrawingPublicationNestedPage }>;
    }>;
}

interface IDocumentDrawingPublicationPage extends IDocumentDrawingPublicationNestedPage {
    headerId: string;
    footerId: string;
    pageWidth: number;
}

type DocumentDrawingPublicationSkeletonData = Pick<
    IDocumentSkeletonCached,
    'skeHeaders' | 'skeFooters'
> & { pages: IDocumentDrawingPublicationPage[] };

export class DocDrawingPublicationTracker {
    private _generation = -1;
    private _publishedPageCount = 0;
    private _drawingOccurrenceCount = 0;

    reset(): void {
        this._generation = -1;
        this._publishedPageCount = 0;
        this._drawingOccurrenceCount = 0;
    }

    shouldRefresh(
        skeleton: {
            getSkeletonData: () => DocumentDrawingPublicationSkeletonData | null | undefined | void;
        },
        progress: DocumentDrawingPublicationProgress
    ): boolean {
        if (!progress.didPublish && !progress.complete) {
            return false;
        }

        const isNewGeneration = progress.generation !== this._generation;
        if (isNewGeneration) {
            this._generation = progress.generation;
            this._publishedPageCount = 0;
            this._drawingOccurrenceCount = 0;
        }

        const skeletonData = skeleton.getSkeletonData();
        if (skeletonData == null) {
            return false;
        }

        const previousPublishedPageCount = this._publishedPageCount;
        const publishedPageCount = Math.min(progress.publishedPageCount, skeletonData.pages.length);
        this._publishedPageCount = Math.max(previousPublishedPageCount, publishedPageCount);

        const drawingOccurrenceCount = countPublishedDrawingOccurrences(skeletonData, publishedPageCount);
        const didDrawingOccurrencesChange = !(isNewGeneration && progress.reason === 'edit') &&
            drawingOccurrenceCount !== this._drawingOccurrenceCount;
        this._drawingOccurrenceCount = drawingOccurrenceCount;

        if (progress.complete || progress.didPublishAnchor || didDrawingOccurrencesChange) {
            return true;
        }
        if (isNewGeneration && progress.reason === 'edit') {
            return false;
        }

        return hasNewPublishedPageDrawings(skeletonData, previousPublishedPageCount, publishedPageCount);
    }
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

function hasSkeletonPageDrawings(page: IDocumentDrawingPublicationNestedPage): boolean {
    if (page.skeDrawings.size > 0) {
        return true;
    }

    let hasDrawings = false;
    page.skeTables?.forEach((table) => {
        table.rows.forEach((row) => {
            row.cells.forEach((cell) => {
                if (hasSkeletonPageDrawings(cell)) {
                    hasDrawings = true;
                }
            });
        });
    });
    page.skeColumnGroups?.forEach((columnGroup) => {
        columnGroup.columns.forEach((column) => {
            if (hasSkeletonPageDrawings(column.page)) {
                hasDrawings = true;
            }
        });
    });

    return hasDrawings;
}

function countSkeletonPageDrawings(page: IDocumentDrawingPublicationNestedPage): number {
    let count = page.skeDrawings.size;
    page.skeTables?.forEach((table) => {
        table.rows.forEach((row) => {
            row.cells.forEach((cell) => {
                count += countSkeletonPageDrawings(cell);
            });
        });
    });
    page.skeColumnGroups?.forEach((columnGroup) => {
        columnGroup.columns.forEach((column) => {
            count += countSkeletonPageDrawings(column.page);
        });
    });
    return count;
}

function countPublishedDrawingOccurrences(
    skeletonData: DocumentDrawingPublicationSkeletonData,
    publishedPageCount: number
): number {
    let count = 0;
    for (let index = 0; index < publishedPageCount; index++) {
        const page = skeletonData.pages[index];
        count += countSkeletonPageDrawings(page);

        const header = page.headerId == null
            ? undefined
            : skeletonData.skeHeaders.get(page.headerId)?.get(page.pageWidth);
        if (header != null) {
            count += countSkeletonPageDrawings(header);
        }

        const footer = page.footerId == null
            ? undefined
            : skeletonData.skeFooters.get(page.footerId)?.get(page.pageWidth);
        if (footer != null) {
            count += countSkeletonPageDrawings(footer);
        }
    }
    return count;
}

function hasNewPublishedPageDrawings(
    skeletonData: DocumentDrawingPublicationSkeletonData,
    startPageIndex: number,
    publishedPageCount: number
): boolean {
    for (let index = startPageIndex; index < publishedPageCount; index++) {
        const page = skeletonData.pages[index];
        if (hasSkeletonPageDrawings(page)) {
            return true;
        }

        const header = page.headerId == null
            ? undefined
            : skeletonData.skeHeaders.get(page.headerId)?.get(page.pageWidth);
        if (header != null && hasSkeletonPageDrawings(header)) {
            return true;
        }

        const footer = page.footerId == null
            ? undefined
            : skeletonData.skeFooters.get(page.footerId)?.get(page.pageWidth);
        if (footer != null && hasSkeletonPageDrawings(footer)) {
            return true;
        }
    }
    return false;
}

export class DocDrawingTransformUpdateController extends Disposable implements IRenderModule {
    private _liquid = new Liquid();
    private _changesetDrawingRefreshScheduled = false;
    private readonly _publicationTracker = new DocDrawingPublicationTracker();

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
        this._initTransformRefresh();
    }

    private _initialRenderRefresh() {
        this.disposeWithMe(
            this._docSkeletonManagerService.currentSkeleton$.pipe(
                switchMap((documentSkeleton) => {
                    this._publicationTracker.reset();

                    if (documentSkeleton == null) {
                        return EMPTY;
                    }

                    this._refreshDrawing(documentSkeleton);
                    // The document component is attached offscreen before it is positioned. Bind once
                    // it becomes renderable so drawings never expose their temporary origin transform.
                    const positionRefresh$ = animationFrames().pipe(
                        startWith(null),
                        map(() => this._context.mainComponent),
                        filter((documentComponent): documentComponent is Documents => documentComponent instanceof Documents &&
                            documentComponent.left > -10000 &&
                            documentComponent.top > -10000),
                        take(1),
                        switchMap((documentComponent) => fromEventSubject(documentComponent.onTransformChange$).pipe(
                            filter((evt) => evt.type === TRANSFORM_CHANGE_OBSERVABLE_TYPE.translate &&
                                'left' in evt.value &&
                                'left' in evt.preValue &&
                                (evt.value.left !== evt.preValue.left || evt.value.top !== evt.preValue.top)),
                            map(() => ({ documentSkeleton, progress: null })),
                            startWith({ documentSkeleton, progress: null })
                        ))
                    );

                    return merge(
                        documentSkeleton.layoutProgress$.pipe(
                            map((progress) => ({ documentSkeleton, progress }))
                        ),
                        positionRefresh$
                    );
                })
            ).subscribe(({ documentSkeleton, progress }) => {
                if (progress == null || this._publicationTracker.shouldRefresh(documentSkeleton, progress)) {
                    this._refreshDrawing(documentSkeleton);
                }
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
            this._commandService.onCommandExecuted((command: ICommandInfo, options?: IExecutionOptions) => {
                if (updateCommandList.includes(command.id)) {
                    const params = command.params as IRichTextEditingMutationParams;
                    const { unitId: commandUnitId } = params;

                    const { unitId } = this._context;

                    if (commandUnitId !== unitId) {
                        return;
                    }

                    if (command.id === RichTextEditingMutation.id && options?.fromChangeset) {
                        this._scheduleChangesetDrawingRefresh();
                        return;
                    }

                    this._refreshCurrentDrawing();
                }
            })
        );
    }

    private _scheduleChangesetDrawingRefresh(): void {
        if (this._changesetDrawingRefreshScheduled) {
            return;
        }

        this._changesetDrawingRefreshScheduled = true;
        queueMicrotask(() => {
            queueMicrotask(() => {
                this._changesetDrawingRefreshScheduled = false;
                if (this._disposed) {
                    return;
                }

                this._refreshCurrentDrawing();
            });
        });
    }

    private _refreshCurrentDrawing(): void {
        const skeleton = this._docSkeletonManagerService.getSkeleton();
        if (skeleton == null) {
            return;
        }

        const { unitId, mainComponent } = this._context;
        // TODO: @JOCS, Do not use unitId to check if it's need to render images or isEditor. maybe need a config?
        if (this._editorService.isEditor(unitId)) {
            mainComponent?.makeDirty();
            return;
        }

        this._refreshDrawing(skeleton);
    }

    private _initTransformRefresh() {
        this.disposeWithMe(
            merge(
                fromEventSubject(this._context.engine.onTransformChange$).pipe(
                    filter((evt) => evt.type === TRANSFORM_CHANGE_OBSERVABLE_TYPE.resize)
                ),
                fromEventSubject(this._context.scene.onTransformChange$).pipe(
                    filter((evt) => evt.type === TRANSFORM_CHANGE_OBSERVABLE_TYPE.scale)
                )
            ).pipe(
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
            this._collectPublishedPageDrawingPositions(
                unitId,
                page,
                skeHeaders,
                skeFooters,
                docsLeft,
                docsTop,
                updateDrawingMap
            );
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

    private _collectPublishedPageDrawingPositions(
        unitId: string,
        page: IDocumentSkeletonPage,
        skeHeaders: IDocumentSkeletonCached['skeHeaders'],
        skeFooters: IDocumentSkeletonCached['skeFooters'],
        docsLeft: number,
        docsTop: number,
        updateDrawingMap: Record<string, IDrawingParamsWithBehindText>
    ): void {
        const { headerId, footerId, pageWidth } = page;
        const headerPage = headerId ? skeHeaders.get(headerId)?.get(pageWidth) : undefined;
        if (headerPage != null) {
            this._collectSegmentDrawingPositions(
                unitId,
                headerPage,
                docsLeft,
                docsTop,
                updateDrawingMap,
                headerPage.marginTop,
                page.marginLeft,
                page
            );
        }

        const footerPage = footerId ? skeFooters.get(footerId)?.get(pageWidth) : undefined;
        if (footerPage != null) {
            const footerTop = page.pageHeight - page.marginBottom + footerPage.marginTop;
            this._collectSegmentDrawingPositions(
                unitId,
                footerPage,
                docsLeft,
                docsTop,
                updateDrawingMap,
                footerTop,
                page.marginLeft,
                page
            );
        }

        this._collectSegmentDrawingPositions(
            unitId,
            page,
            docsLeft,
            docsTop,
            updateDrawingMap,
            page.marginTop,
            page.marginLeft
        );
    }

    private _collectSegmentDrawingPositions(
        unitId: string,
        page: IDocumentSkeletonPage | IDocumentSkeletonHeaderFooter,
        docsLeft: number,
        docsTop: number,
        updateDrawingMap: Record<string, IDrawingParamsWithBehindText>,
        marginTop: number,
        marginLeft: number,
        hostPage?: IDocumentSkeletonPage
    ): void {
        this._calculateDrawingPosition(
            unitId,
            page,
            docsLeft,
            docsTop,
            updateDrawingMap,
            marginTop,
            marginLeft,
            hostPage
        );
        this._calculateTableCellDrawingPositions(
            unitId,
            page,
            docsLeft,
            docsTop,
            updateDrawingMap,
            marginTop,
            marginLeft
        );
        this._calculateColumnGroupDrawingPositions(
            unitId,
            page,
            docsLeft,
            docsTop,
            updateDrawingMap,
            marginTop,
            marginLeft
        );
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

        const drawingPositionContext: IDrawingPositionContext = {
            unitId,
            page,
            docsLeft,
            docsTop,
            pageOffsetLeft,
            pageOffsetTop,
            updateDrawingMap,
            hostPage,
            clipOffset,
        };
        skeDrawings.forEach((drawing) => this._collectDrawingPosition(drawing, drawingPositionContext));

        this._liquid.restorePagePadding({
            marginTop,
            marginLeft,
        } as IDocumentSkeletonPage);
    }

    private _collectDrawingPosition(
        drawing: IDocumentSkeletonDrawing,
        context: IDrawingPositionContext
    ): void {
        const { aLeft, aTop, angle: skeletonAngle, drawingId, drawingOrigin, height: skeletonHeight, width: skeletonWidth } = drawing;
        const currentDrawing = this._context.unit?.getSnapshot?.().drawings?.[drawingId];
        const runtimeDrawing = getDocsOverlayRuntimeDrawing(drawingOrigin, currentDrawing);
        const { angle = skeletonAngle, size } = runtimeDrawing.docTransform;
        const height = size?.height ?? skeletonHeight;
        const width = size?.width ?? skeletonWidth;
        const { left: clipOffsetLeft, top: clipOffsetTop } = context.clipOffset ?? {};
        const behindText = getDocsDrawingBehindText({ drawingOrigin: runtimeDrawing, hostPage: context.hostPage });
        const { isMultiTransform = BooleanNumber.FALSE } = runtimeDrawing;
        const clipPage = getDocsDrawingClipPage({
            drawing: { behindText, transform: { width, height } },
            hostPage: context.hostPage,
            page: context.page,
        });
        const clipBounds = getDocsDrawingPageClipBounds({
            docsLeft: context.docsLeft,
            docsTop: context.docsTop,
            pageOffsetLeft: context.pageOffsetLeft,
            pageOffsetTop: context.pageOffsetTop,
            clipOffsetLeft,
            clipOffsetTop,
            page: clipPage,
        });
        const anchorPage = runtimeDrawing.layoutType === PositionedObjectLayoutType.WRAP_NONE
            ? getDocsPageRelativeDrawingAnchorPage({
                page: context.page,
                clipPage,
                hostPage: context.hostPage,
            })
            : undefined;
        const pageRelativeLeft = anchorPage == null
            ? undefined
            : getDocsPageRelativeDrawingLeft({
                hostPage: anchorPage,
                positionH: runtimeDrawing.docTransform.positionH,
                width,
            });
        const pageRelativeTop = anchorPage == null
            ? undefined
            : getDocsPageRelativeDrawingTop({
                hostPage: anchorPage,
                positionV: runtimeDrawing.docTransform.positionV,
                height,
            });
        const transform: IDrawingTransformStateWithClipBounds = {
            left: (pageRelativeLeft ?? aLeft) + context.docsLeft +
                (pageRelativeLeft == null ? this._liquid.x : context.pageOffsetLeft),
            top: (pageRelativeTop ?? aTop) + context.docsTop +
                (pageRelativeTop == null ? this._liquid.y : context.pageOffsetTop),
            width,
            height,
            angle,
            flipX: runtimeDrawing.docTransform.flipX,
            flipY: runtimeDrawing.docTransform.flipY,
            clipBounds,
        };
        const existingDrawing = context.updateDrawingMap[drawingId];
        if (existingDrawing == null) {
            context.updateDrawingMap[drawingId] = {
                unitId: context.unitId,
                subUnitId: context.unitId,
                drawingId,
                behindText,
                transform,
                transforms: [transform],
                customBlockRenderViewport: drawing.customBlockRenderViewport,
                isMultiTransform,
            };
        } else if (isMultiTransform === BooleanNumber.TRUE) {
            existingDrawing.transforms.push(transform);
        }
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
                    if (
                        (cell.skeDrawings?.size ?? 0) === 0 &&
                        (cell.skeTables?.size ?? 0) === 0 &&
                        (cell.skeColumnGroups?.size ?? 0) === 0
                    ) {
                        return;
                    }

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
                    this._calculateColumnGroupDrawingPositions(
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

    private _calculateColumnGroupDrawingPositions(
        unitId: string,
        page: IDocumentSkeletonPage | IDocumentSkeletonHeaderFooter,
        docsLeft: number,
        docsTop: number,
        updateDrawingMap: Record<string, IDrawingParamsWithBehindText>,
        baseMarginTop: number,
        baseMarginLeft: number
    ): void {
        page.skeColumnGroups?.forEach((columnGroup) => {
            columnGroup.columns.forEach((column) => {
                const nestedPage = column.page;
                const marginTop = baseMarginTop + columnGroup.top + column.top + nestedPage.marginTop;
                const marginLeft = baseMarginLeft + columnGroup.left + column.left + nestedPage.marginLeft;
                const clipOffset = { left: marginLeft, top: marginTop };

                this._calculateDrawingPosition(
                    unitId,
                    nestedPage,
                    docsLeft,
                    docsTop,
                    updateDrawingMap,
                    marginTop,
                    marginLeft,
                    undefined,
                    clipOffset
                );
                this._calculateTableCellDrawingPositions(
                    unitId,
                    nestedPage,
                    docsLeft,
                    docsTop,
                    updateDrawingMap,
                    marginTop,
                    marginLeft
                );
                this._calculateColumnGroupDrawingPositions(
                    unitId,
                    nestedPage,
                    docsLeft,
                    docsTop,
                    updateDrawingMap,
                    marginTop,
                    marginLeft
                );
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
