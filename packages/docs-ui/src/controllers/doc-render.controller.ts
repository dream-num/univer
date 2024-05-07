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

import type { ICommandInfo, Nullable } from '@univerjs/core';
import {
    ICommandService,
    LifecycleStages,
    OnLifecycle,
    RxDisposable } from '@univerjs/core';
import type { DocBackground, Documents, DocumentSkeleton, IRender } from '@univerjs/engine-render';
import { IRenderManagerService, PageLayoutType } from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';
import { takeUntil } from 'rxjs';

import { IEditorService } from '@univerjs/ui';
import type { IDocSkeletonManagerParam, IRichTextEditingMutationParams } from '@univerjs/docs';
import { DOCS_VIEW_KEY, DocSkeletonManagerService, RichTextEditingMutation } from '@univerjs/docs';

@OnLifecycle(LifecycleStages.Rendered, DocRenderController)
export class DocRenderController extends RxDisposable {
    private _docRenderMap = new Set<string>();

    constructor(
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @IEditorService private readonly _editorService: IEditorService
    ) {
        super();

        this._initialRenderRefresh();

        this._commandExecutedListener();
    }

    private _initialRenderRefresh() {
        this._docSkeletonManagerService.currentSkeletonBefore$.pipe(takeUntil(this.dispose$)).subscribe((param) => {
            this._create(param);
        });
    }

    private _create(param: Nullable<IDocSkeletonManagerParam>) {
        if (param == null) {
            return;
        }

        const { skeleton: documentSkeleton, unitId } = param;

        let currentRender = this._renderManagerService.getRenderById(unitId);

        if (currentRender == null) {
            this._renderManagerService.create(unitId);
            currentRender = this._renderManagerService.getRenderById(unitId)!;
        }

        const { mainComponent, components } = currentRender;

        const docsComponent = mainComponent as Documents;

        const docBackground = components.get(DOCS_VIEW_KEY.BACKGROUND) as DocBackground;

        docsComponent.changeSkeleton(documentSkeleton);

        docBackground.changeSkeleton(documentSkeleton);

        this._recalculateSizeBySkeleton(currentRender, documentSkeleton);
    }

    private _recalculateSizeBySkeleton(currentRender: IRender, skeleton: DocumentSkeleton) {
        const { mainComponent, scene, unitId, components } = currentRender;

        const docsComponent = mainComponent as Documents;

        const docBackground = components.get(DOCS_VIEW_KEY.BACKGROUND) as DocBackground;

        const pages = skeleton.getSkeletonData()?.pages;

        if (pages == null) {
            return;
        }

        let width = 0;
        let height = 0;

        for (let i = 0, len = pages.length; i < len; i++) {
            const page = pages[i];
            const { pageWidth, pageHeight } = page;

            if (docsComponent.pageLayoutType === PageLayoutType.VERTICAL) {
                height += pageHeight;

                height += docsComponent.pageMarginTop;

                if (i === len - 1) {
                    height += docsComponent.pageMarginTop;
                }

                width = Math.max(width, pageWidth);
            } else if (docsComponent.pageLayoutType === PageLayoutType.HORIZONTAL) {
                width += pageWidth;

                if (i !== len - 1) {
                    width += docsComponent.pageMarginLeft;
                }
                height = Math.max(height, pageHeight);
            }
        }

        docsComponent.resize(width, height);
        docBackground.resize(width, height);

        if (!this._editorService.isEditor(unitId)) {
            scene.resize(width, height);
        }
    }

    private _commandExecutedListener() {
        const updateCommandList = [RichTextEditingMutation.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const params = command.params as IRichTextEditingMutationParams;
                    const { unitId } = params;

                    const docsSkeletonObject = this._docSkeletonManagerService.getSkeletonByUnitId(unitId);

                    if (docsSkeletonObject == null) {
                        return;
                    }

                    const { skeleton } = docsSkeletonObject;

                    const currentRender = this._renderManagerService.getRenderById(unitId);

                    if (currentRender == null) {
                        return;
                    }

                    // TODO: `disabled` is only used for read only demo, and will be removed in the future.
                    const disabled = !!skeleton.getViewModel().getDataModel().getSnapshot().disabled;

                    if (disabled) {
                        return;
                    }

                    skeleton.calculate();

                    if (this._editorService.isEditor(unitId)) {
                        currentRender.mainComponent?.makeDirty();

                        return;
                    }

                    this._recalculateSizeBySkeleton(currentRender, skeleton);
                }
            })
        );
    }
}
