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
import type { Documents, DocumentSkeleton, IDocumentSkeletonHeaderFooter, IDocumentSkeletonPage, Image, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import {
    BooleanNumber,
    Disposable,
    DOCS_ZEN_EDITOR_UNIT_ID_KEY,
    fromEventSubject,
    ICommandService,
    Inject,
    IUniverInstanceService,
    LifecycleService,
    LifecycleStages,
    PositionedObjectLayoutType,
} from '@univerjs/core';
import { DocSkeletonManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { IEditorService, SetDocZoomRatioOperation } from '@univerjs/docs-ui';
import { IDrawingManagerService } from '@univerjs/drawing';
import { Liquid, TRANSFORM_CHANGE_OBSERVABLE_TYPE } from '@univerjs/engine-render';
import { debounceTime, filter } from 'rxjs';
import { DocRefreshDrawingsService } from '../../services/doc-refresh-drawings.service';

interface IDrawingParamsWithBehindText {
    unitId: string;
    subUnitId: string;
    drawingId: string;
    behindText: boolean;
    transform: ITransformState;
    transforms: ITransformState[];
    // The same drawing render in different place, like image in header and footer.
    // The default value is BooleanNumber.FALSE. if it's true, Please use transforms.
    isMultiTransform: BooleanNumber;
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
        this._docSkeletonManagerService.currentSkeleton$.subscribe((documentSkeleton) => {
            if (documentSkeleton == null) {
                return;
            }

            this._refreshDrawing(documentSkeleton);
        });

        this._docRefreshDrawingsService.refreshDrawings$.subscribe((skeleton) => {
            if (skeleton == null) {
                return;
            }

            this._refreshDrawing(skeleton);
        });
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
                    if (this._editorService.isEditor(unitId) && unitId !== DOCS_ZEN_EDITOR_UNIT_ID_KEY) {
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
                        page.marginLeft
                    );
                }
            }

            if (footerId) {
                const footerPage = skeFooters.get(footerId)?.get(pageWidth);

                if (footerPage) {
                    this._calculateDrawingPosition(
                        unitId,
                        footerPage,
                        docsLeft,
                        docsTop,
                        updateDrawingMap,
                        page.pageHeight - page.marginBottom + footerPage.marginTop,
                        page.marginLeft
                    );
                }
            }

            this._calculateDrawingPosition(unitId, page, docsLeft, docsTop, updateDrawingMap, page.marginTop, page.marginLeft);
            this._liquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
        }

        const updateDrawings = Object.values(updateDrawingMap);

        const nonMultiDrawings = updateDrawings.filter((drawing) => !drawing.isMultiTransform);
        const multiDrawings = updateDrawings.filter((drawing) => drawing.isMultiTransform);
        if (nonMultiDrawings.length > 0) {
            this._drawingManagerService.refreshTransform(nonMultiDrawings as unknown as IDrawingParam[]);
        }

        // if multiDrawings length is 0, also need to remove current multi drawings.
        this._handleMultiDrawingsTransform(multiDrawings as unknown as IDrawingParam[]);
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
        marginLeft: number
    ) {
        const { skeDrawings } = page;
        this._liquid.translatePagePadding({
            marginTop,
            marginLeft,
        } as IDocumentSkeletonPage);

        skeDrawings.forEach((drawing) => {
            const { aLeft, aTop, height, width, angle, drawingId, drawingOrigin } = drawing;
            const behindText = drawingOrigin.layoutType === PositionedObjectLayoutType.WRAP_NONE && drawingOrigin.behindDoc === BooleanNumber.TRUE;
            const { isMultiTransform = BooleanNumber.FALSE } = drawingOrigin;
            const transform = {
                left: aLeft + docsLeft + this._liquid.x,
                top: aTop + docsTop + this._liquid.y,
                width,
                height,
                angle,
            };
            if (updateDrawingMap[drawingId] == null) {
                updateDrawingMap[drawingId] = {
                    unitId,
                    subUnitId: unitId,
                    drawingId,
                    behindText,
                    transform,
                    transforms: [transform],
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

    private _drawingInitializeListener() {
        const init = () => {
            const skeleton = this._docSkeletonManagerService.getSkeleton();
            if (skeleton == null) {
                return;
            }

            this._refreshDrawing(skeleton);

            this._drawingManagerService.initializeNotification(this._context.unitId);
        };

        if (this._lifecycleService.stage >= LifecycleStages.Rendered) {
            if (this._docSkeletonManagerService.getSkeleton()) {
                init();
            } else {
                // wait render-unit ready
                setTimeout(init, 500);
            }
        } else {
            this._lifecycleService.lifecycle$.pipe(filter((stage) => stage === LifecycleStages.Rendered)).subscribe(init);
        }
    }
}
