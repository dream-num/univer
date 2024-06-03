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

import type { ICommandInfo, Nullable, Workbook } from '@univerjs/core';
import { checkForSubstrings, Disposable, ICommandService, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { IRenderManagerService, ITextSelectionRenderManager, ScrollBar } from '@univerjs/engine-render';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import { CoverContentCommand, DocSkeletonManagerService, RichTextEditingMutation, VIEWPORT_KEY } from '@univerjs/docs';
import { IEditorService, SetEditorResizeOperation } from '@univerjs/ui';
import { fromEvent } from 'rxjs';

@OnLifecycle(LifecycleStages.Rendered, DocEditorBridgeController)
export class DocEditorBridgeController extends Disposable {
    private _initialEditors = new Set<string>();

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IEditorService private readonly _editorService: IEditorService,
        @ICommandService private readonly _commandService: ICommandService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService

    ) {
        super();
        this._initialize();
    }

    private _initialize() {
        this.disposeWithMe(
            this._editorService.resize$.subscribe((unitId: string) => {
                this._resize(unitId);
            })
        );

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

        this._initialValueChange();
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

        const editorDataModel = this._univerInstanceService.getUniverDocInstance(unitId);

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

        const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);

        let scrollBar = viewportMain?.getScrollBar() as Nullable<ScrollBar>;

        const contentWidth = Math.max(actualWidth, width);

        const contentHeight = Math.max(actualHeight, height);

        scene.transformByState({
            width: contentWidth,
            height: contentHeight,
        });

        mainComponent?.resize(contentWidth, contentHeight);

        if (!editor.isSingle()) {
            if (actualHeight > height) {
                if (scrollBar == null) {
                    viewportMain && new ScrollBar(viewportMain, { enableHorizontal: false, barSize: 8 });
                } else {
                    viewportMain?.resetCanvasSizeAndUpdateScrollBar();
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
                    viewportMain?.resetCanvasSizeAndUpdateScrollBar();
                }
            } else {
                scrollBar = null;
                viewportMain?.scrollTo({ x: 0, y: 0 });
                viewportMain?.getScrollBar()?.dispose();
            }
        }
    }

    private _initialSetValue() {
        this.disposeWithMe(
            this._editorService.setValue$.subscribe((param) => {
                this._commandService.executeCommand(CoverContentCommand.id, {
                    unitId: param.editorUnitId,
                    body: param.body,
                    segmentId: null,
                });
            })
        );
    }

    private _initialBlur() {
        this.disposeWithMe(
            this._editorService.blur$.subscribe(() => {
                this._textSelectionRenderManager.removeAllTextRanges();

                this._textSelectionRenderManager.blur();
            })
        );

        this.disposeWithMe(
            this._textSelectionRenderManager.onBlur$.subscribe(() => {
                const unitId = this._univerInstanceService.getCurrentUniverDocInstance()?.getUnitId();
                if (unitId == null) {
                    return;
                }

                const editor = this._editorService.getEditor(unitId);

                const focusEditor = this._editorService.getFocusEditor();

                if (editor == null || editor.isSheetEditor() || (focusEditor && focusEditor.editorUnitId === unitId)) {
                    return;
                }

                this._editorService.blur();
            })
        );
    }

    private _initialFocus() {
        this.disposeWithMe(
            this._editorService.focus$.subscribe((textRange) => {
                this._textSelectionRenderManager.removeAllTextRanges();
                this._textSelectionRenderManager.addTextRanges([textRange]);
            })
        );

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
                    this._editorService.changeSpreadsheetFocusState(true);
                    event.stopPropagation();
                    return;
                }
                this._editorService.changeSpreadsheetFocusState(false);
            })
        );

        // this.disposeWithMe(
        //     fromEvent(window, 'mousedown').subscribe(() => {
        //         this._editorService.changeSpreadsheetFocusState(false);
        //     })
        // );

        const currentUniverSheet = this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        currentUniverSheet.forEach((unit) => {
            const unitId = unit.getUnitId();
            const render = this._renderManagerService.getRenderById(unitId);
            const canvasEle = render?.engine.getCanvas().getCanvasEle();
            if (canvasEle == null) {
                return;
            }
            fromEvent(canvasEle, 'mousedown').subscribe((evt) => {
                this._editorService.changeSpreadsheetFocusState(true);
                evt.stopPropagation();
            });
        });
    }

    private _initialValueChange() {
        this.disposeWithMe(
            this._textSelectionRenderManager.onCompositionupdate$.subscribe(this._valueChange.bind(this))
        );
        this.disposeWithMe(
            this._textSelectionRenderManager.onInput$.subscribe(this._valueChange.bind(this))
        );
        this.disposeWithMe(
            this._textSelectionRenderManager.onKeydown$.subscribe(this._valueChange.bind(this))
        );
        this.disposeWithMe(
            this._textSelectionRenderManager.onPaste$.subscribe(this._valueChange.bind(this))
        );
    }

    private _valueChange() {
        const unitId = this._univerInstanceService.getCurrentUniverDocInstance()?.getUnitId();
        if (unitId == null) {
            return;
        }

        const editor = this._editorService.getEditor(unitId);

        if (editor == null || editor.isSheetEditor()) {
            return;
        }

        this._editorService.refreshValueChange(unitId);
    }

    /**
     * Listen to document edits to refresh the size of the formula editor.
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

                    this._valueChange();
                }
            })
        );
    }
}
