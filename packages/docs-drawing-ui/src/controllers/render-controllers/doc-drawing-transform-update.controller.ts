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

import type { DocumentDataModel, ICommandInfo } from '@univerjs/core';
import {
    BooleanNumber,
    Disposable,
    ICommandService,
    PositionedObjectLayoutType,
} from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import { DocSkeletonManagerService, RichTextEditingMutation, SetDocZoomRatioOperation } from '@univerjs/docs';
import { IDrawingManagerService } from '@univerjs/drawing';
import type { Documents, DocumentSkeleton, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Liquid } from '@univerjs/engine-render';
import { IEditorService } from '@univerjs/ui';
import { Inject } from '@wendellhu/redi';

export class DocDrawingTransformUpdateController extends Disposable implements IRenderModule {
    private _liquid = new Liquid();

    private _pageMarginCache = new Map<string, { marginLeft: number; marginTop: number }>();

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @IEditorService private readonly _editorService: IEditorService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService
    ) {
        super();

        this._initialize();

        this._commandExecutedListener();
    }

    private _initialize() {
        this._initialRenderRefresh();
    }

    private _initialRenderRefresh() {
        const { mainComponent } = this._context;
        this._docSkeletonManagerService.currentSkeleton$.subscribe((documentSkeleton) => {
            if (documentSkeleton == null) {
                return;
            }

            const docsComponent = mainComponent as Documents;

            // TODO: @Jocs, Why NEED change skeleton here?
            docsComponent.changeSkeleton(documentSkeleton);

            this._refreshDrawing(documentSkeleton);
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

                    if (this._editorService.isEditor(unitId)) {
                        mainComponent?.makeDirty();
                        return;
                    }

                    this._refreshDrawing(skeleton);
                }
            })
        );
    }

    private _refreshDrawing(skeleton: DocumentSkeleton) {
        const skeletonData = skeleton?.getSkeletonData();
        const { mainComponent, scene, unitId } = this._context;
        const documentComponent = mainComponent as Documents;

        if (!skeletonData) {
            return;
        }

        const { left: docsLeft, top: docsTop, pageLayoutType, pageMarginLeft, pageMarginTop } = documentComponent;
        const { pages } = skeletonData;
        const updateDrawings: any[] = []; // IFloatingObjectManagerParam
        const { scaleX, scaleY } = scene.getAncestorScale();

        this._liquid.reset();
        this._pageMarginCache.clear();

        // const objectList: BaseObject[] = [];
        // const pageMarginCache = new Map<string, { marginLeft: number; marginTop: number }>();

        // const cumPageLeft = 0;
        // const cumPageTop = 0;
        /**
         * TODO: @DR-Univer We should not refresh all floating elements, but instead make a diff.
         */
        for (let i = 0, len = pages.length; i < len; i++) {
            const page = pages[i];
            const { skeDrawings, marginLeft, marginTop } = page;
            // cumPageLeft + = pageWidth + documents.pageMarginLeft;

            this._liquid.translatePagePadding(page);
            skeDrawings.forEach((drawing) => {
                const { aLeft, aTop, height, width, angle, drawingId, drawingOrigin } = drawing;
                const behindText = drawingOrigin.layoutType === PositionedObjectLayoutType.WRAP_NONE && drawingOrigin.behindDoc === BooleanNumber.TRUE;

                updateDrawings.push({
                    unitId,
                    subUnitId: unitId,
                    drawingId,
                    behindText,
                    transform: {
                        left: aLeft + docsLeft + this._liquid.x,
                        top: aTop + docsTop + this._liquid.y,
                        width,
                        height,
                        angle,
                    },
                });

                this._pageMarginCache.set(drawingId, {
                    marginLeft: this._liquid.x,
                    marginTop: this._liquid.y,
                });
            });

            this._liquid.restorePagePadding(page);

            this._liquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
        }

        // console.log('updateDrawings', skeleton.getViewModel().getDataModel(), pages, updateDrawings);
        if (updateDrawings.length > 0) {
            this._drawingManagerService.refreshTransform(updateDrawings);
        }
    }
}
