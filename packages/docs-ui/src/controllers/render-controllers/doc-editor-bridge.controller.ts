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

import type { DocumentDataModel, ICommandInfo, Nullable } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { checkForSubstrings, Disposable, DisposableCollection, ICommandService, Inject, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSkeletonManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { fromEvent } from 'rxjs';
import { IEditorService } from '../../services/editor/editor-manager.service';
import { DocSelectionRenderService } from '../../services/selection/doc-selection-render.service';

export class DocEditorBridgeController extends Disposable implements IRenderModule {
    private _initialEditors = new Set<string>();

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IEditorService private readonly _editorService: IEditorService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DocSelectionRenderService) private readonly _docSelectionRenderService: DocSelectionRenderService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();
        this._initialize();
    }

    private _initialize() {
        this._editorService.getAllEditor().forEach((editor) => {
            const unitId = editor.getEditorId();

            if (unitId !== this._context.unitId) {
                return;
            }

            if (this._initialEditors.has(unitId)) {
                return;
            }
            this._initialEditors.add(unitId);
            this._resize(unitId);
        });

        this._commandExecutedListener();

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

        const editorDataModel = this._univerInstanceService.getUniverDocInstance(unitId);
        if (!editorDataModel) {
            return;
        }

        const skeleton = this._docSkeletonManagerService.getSkeleton();
        if (editor == null || editor.render == null || skeleton == null || editorDataModel == null) {
            return;
        }

        skeleton.calculate();

        const { marginTop = 0, marginBottom = 0, marginLeft = 0, marginRight = 0 } = editorDataModel.getSnapshot().documentStyle;

        const { scene, mainComponent } = editor.render;

        let { actualHeight, actualWidth } = skeleton.getActualSize();

        actualHeight += marginTop + marginBottom;

        actualWidth += marginLeft + marginRight;

        const { width, height } = editor.getBoundingClientRect();

        const contentWidth = Math.max(actualWidth, width);

        const contentHeight = Math.max(actualHeight, height);

        scene.transformByState({
            width: contentWidth,
            height: contentHeight,
        });

        mainComponent?.resize(contentWidth, contentHeight);
    }

    private _initialBlur() {
        this.disposeWithMe(
            this._editorService.blur$.subscribe(() => {
                this._docSelectionRenderService.blur();
            })
        );

        this.disposeWithMe(
            this._docSelectionRenderService.onBlur$.subscribe(() => {
                const { unitId } = this._context;

                const editor = this._editorService.getEditor(unitId);

                const focusEditor = this._editorService.getFocusEditor();

                if (editor == null || editor.isSheetEditor() || (focusEditor && focusEditor.getEditorId() === unitId)) {
                    return;
                }

                // TODO:@ggg: Docs-ui should not rely on sheet-ui stuff, and the code needs to be removed after the editor is refactored.
                if (unitId.includes('range_selector') || unitId.includes('embedding_formula_editor')) {
                    return;
                }

                this._editorService.blur();
            })
        );
    }

    private _initialFocus() {
        const focusExcepts = [
            'univer-formula-search',
            'univer-formula-help',
            'formula-help-decorator',
            'univer-formula-help-param',
        ];

        this.disposeWithMe(
            fromEvent(window, 'mousedown').subscribe((event) => {
                const target = event.target as HTMLElement;
                const hasSearch = target.classList[0] || '';

                if (checkForSubstrings(hasSearch, focusExcepts)) {
                    event.stopPropagation();
                }
            })
        );

        //TODO:@weird94 I don't know why, but keep this first, and should be removed if it was checked unneccesary.
        const disposableCollection = new DisposableCollection();
        this.disposeWithMe(
            this._univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).subscribe((unit) => {
                disposableCollection.dispose();
                if (!unit) {
                    return;
                }
                const unitId = unit.getUnitId();
                const render = this._renderManagerService.getRenderById(unitId);
                const canvasEle = render?.engine.getCanvas().getCanvasEle();
                if (canvasEle == null) {
                    return;
                }

                const disposable = fromEvent(canvasEle, 'mousedown').subscribe((evt) => {
                    evt.stopPropagation();
                });

                disposableCollection.add(disposable);
            })
        );

        this.disposeWithMe(() => disposableCollection.dispose());
    }

    /**
     * Listen to document edits to refresh the size of the formula editor.
     */
    private _commandExecutedListener() {
        const updateCommandList = [RichTextEditingMutation.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const params = command.params as IRichTextEditingMutationParams;
                    const { unitId } = params;

                    if (this._editorService.isSheetEditor(unitId) || unitId !== this._context.unitId) {
                        return;
                    }

                    const editor = this._editorService.getEditor(unitId);

                    // Only for Text editor?
                    if (editor && !editor.params.scrollBar) {
                        this._resize(unitId);
                    }
                }
            })
        );
    }
}
