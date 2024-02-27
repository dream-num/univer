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
import { Disposable, ICommandService, IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { ITextSelectionRenderManager, ScrollBar } from '@univerjs/engine-render';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import { CoverContentCommand, DocSkeletonManagerService, RichTextEditingMutation, VIEWPORT_KEY } from '@univerjs/docs';
import { IEditorService, SetEditorResizeOperation } from '@univerjs/ui';

@OnLifecycle(LifecycleStages.Rendered, DocEditorBridgeController)
export class DocEditorBridgeController extends Disposable {
    private _initialEditors = new Set<string>();

    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IEditorService private readonly _editorService: IEditorService,
        @ICommandService private readonly _commandService: ICommandService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager

    ) {
        super();
        this._initialize();
    }

    private _initialize() {
        this._editorService.resize$.subscribe((unitId: string) => {
            this._resize(unitId);
        });

        this._editorService.getAllEditor().forEach((editor) => {
            const unitId = editor.editorUnitId;
            if (this._initialEditors.has(unitId)) {
                return;
            }
            this._initialEditors.add(unitId);
            this._resize(unitId);
        });

        this._commandExecutedListener();

        this._initialSetValue();

        this._initialBlur();

        this._initialFocus();
    }

    private _resize(unitId: Nullable<string>) {
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

        const { marginTop = 0, marginBottom = 0, marginLeft = 0, marginRight = 0 } = editorDataModel.getSnapshot().documentStyle;

        const { scene, mainComponent } = editor.render;

        let { actualHeight, actualWidth } = skeleton.getActualSize();

        actualHeight += marginTop + marginBottom;

        actualWidth += marginLeft + marginRight;

        const { width, height } = editor.getBoundingClientRect();

        const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);

        let scrollBar = viewportMain?.getScrollBar() as Nullable<ScrollBar>;

        const contentWidth = Math.max(actualWidth, width);

        const contentHeight = Math.max(actualHeight, height);

        scene.transformByState({
            width: contentWidth,
            height: contentHeight,
        });

        mainComponent?.resize(contentWidth, contentHeight);

        if (editor.isSingle === false) {
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
        } else {
            if (actualWidth > width) {
                if (scrollBar == null) {
                    viewportMain && new ScrollBar(viewportMain, { barSize: 8, enableVertical: false });
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

    private _initialSetValue() {
        this._editorService.setValue$.subscribe((param) => {
            this._commandService.executeCommand(CoverContentCommand.id, {
                unitId: param.editorUnitId,
                body: param.body,
                segmentId: null,
            });
        });
    }

    private _initialBlur() {
        this._editorService.blur$.subscribe(() => {
            this._textSelectionRenderManager.removeAllTextRanges();

            this._textSelectionRenderManager.blur();
        });
    }

    private _initialFocus() {
        this._editorService.focus$.subscribe((textRange) => {
            this._textSelectionRenderManager.removeAllTextRanges();
            this._textSelectionRenderManager.addTextRanges([textRange]);
        });
    }

    /**
     * Listen to document edits to refresh the size of the normula editor.
     */
    private _commandExecutedListener() {
        const updateCommandList = [RichTextEditingMutation.id, SetEditorResizeOperation.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const params = command.params as IRichTextEditingMutationParams;
                    const { unitId } = params;

                    if (this._editorService.isSheetEditor(unitId)) {
                        return;
                    }

                    this._resize(unitId);
                }
            })
        );
    }
}
