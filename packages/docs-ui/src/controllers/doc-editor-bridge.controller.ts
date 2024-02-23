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

import type { Nullable } from '@univerjs/core';
import { IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { IRenderManagerService, ScrollBar } from '@univerjs/engine-render';
import { DocSkeletonManagerService, VIEWPORT_KEY } from '@univerjs/docs';
import { IEditorService } from '@univerjs/ui';

@OnLifecycle(LifecycleStages.Rendered, DocEditorBridgeController)
export class DocEditorBridgeController {
    private _initialEditors = new Set<string>();

    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IEditorService private readonly _editorService: IEditorService
    ) {
        this._initialize();
    }

    private _initialize() {
        this._editorService.resize$.subscribe((unitId: string) => {
            this._create(unitId);
        });

        this._editorService.getAllEditor().forEach((editor) => {
            const unitId = editor.editorUnitId;
            if (this._initialEditors.has(unitId)) {
                return;
            }
            this._initialEditors.add(unitId);
            this._create(unitId);
        });
    }

    private _create(unitId: Nullable<string>) {
        if (unitId == null) {
            return;
        }

        const editor = this._editorService.getEditor(unitId);

        if (editor?.cancelDefaultResizeListener === true) {
            return;
        }

        const skeleton = this._docSkeletonManagerService.getSkeletonByUnitId(unitId)?.skeleton;

        const editorDataModel = this._currentUniverService.getUniverDocInstance(unitId);

        if (editor == null || editor.render == null || skeleton == null || editorDataModel == null) {
            return;
        }

        const { marginTop = 0, marginBottom = 0 } = editorDataModel.getSnapshot().documentStyle;

        const { scene, mainComponent } = editor.render;

        let { actualHeight } = skeleton.getActualSize();

        actualHeight += marginTop + marginBottom;

        const { width, height } = editor.editorDom.getBoundingClientRect();

        const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);

        let scrollBar = viewportMain?.getScrollBar() as Nullable<ScrollBar>;

        scene.transformByState({
            width,
            height: actualHeight,
        });

        mainComponent?.resize(width, actualHeight);

        if (actualHeight > height) {
            if (scrollBar == null) {
                viewportMain && new ScrollBar(viewportMain, { enableHorizontal: false, barSize: 8 });
            } else {
                viewportMain?.resetSizeAndScrollBar();
            }
        } else {
            scrollBar = null;
            viewportMain?.scrollTo({ x: 0, y: 0 });
            viewportMain?.getScrollBar()?.dispose();
        }
    }
}
