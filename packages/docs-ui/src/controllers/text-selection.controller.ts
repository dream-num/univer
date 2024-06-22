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
import { Disposable, ICommandService, IUniverInstanceService, LifecycleStages, OnLifecycle, toDisposable, UniverInstanceType } from '@univerjs/core';
import type { Documents, IMouseEvent, IPointerEvent, RenderComponentType } from '@univerjs/engine-render';
import { CURSOR_TYPE, IRenderManagerService, ITextSelectionRenderManager } from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';

import { IEditorService } from '@univerjs/ui';
import type { ISetDocZoomRatioOperationParams } from '@univerjs/docs';
import { DocSkeletonManagerService, getDocObjectById, SetDocZoomRatioOperation, TextSelectionManagerService } from '@univerjs/docs';

@OnLifecycle(LifecycleStages.Rendered, TextSelectionController)
export class TextSelectionController extends Disposable {
    private _loadedMap = new WeakSet<RenderComponentType>();

    constructor(
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ITextSelectionRenderManager
        private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @IEditorService private readonly _editorService: IEditorService
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        this._init();
        this._skeletonListener();
        this._commandExecutedListener();
    }

    private _init() {
        this.disposeWithMe(
            this._renderManagerService.currentRender$.subscribe((unitId) => {
                this._create(unitId);
            })
        );

        this._renderManagerService.getRenderAll().forEach((_, unitId) => {
            this._create(unitId);
        });
    }

    private _create(unitId: Nullable<string>) {
        if (unitId == null) {
            return;
        }

        if (this._univerInstanceService.getUniverDocInstance(unitId) == null) {
            return;
        }

        const docObject = this._getDocObjectById(unitId);
        if (docObject == null || docObject.document == null) {
            return;
        }

        if (!this._loadedMap.has(docObject.document)) {
            this._initialMain(unitId);
            this._loadedMap.add(docObject.document);
        }
    }

    // eslint-disable-next-line max-lines-per-function
    private _initialMain(unitId: string) {
        const docObject = this._getDocObjectById(unitId);
        if (docObject == null) {
            return;
        }

        const { document, scene } = docObject;
        this.disposeWithMe(
            toDisposable(
                document.onPointerEnter$.subscribeEvent(() => {
                    if (this._isEditorReadOnly(unitId)) {
                        return;
                    }
                    document.cursor = CURSOR_TYPE.TEXT;
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                document.onPointerLeave$.subscribeEvent(() => {
                    document.cursor = CURSOR_TYPE.DEFAULT;
                    scene.resetCursor();
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                document?.pointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
                    if (this._isEditorReadOnly(unitId)) {
                        return;
                    }

                    const currentDocInstance = this._univerInstanceService.getCurrentUniverDocInstance();
                    if (currentDocInstance?.getUnitId() !== unitId) {
                        this._univerInstanceService.setCurrentUnitForType(unitId);
                    }

                    this._textSelectionRenderManager.eventTrigger(evt);

                    const { offsetX, offsetY } = evt;

                    if (this._editorService.getEditor(unitId)) {
                         /**
                          * To accommodate focus switching between different editors.
                          * Since the editor for Univer is canvas-based,
                          * it primarily relies on focus and cannot use the focus event.
                          * Our editor's focus monitoring is based on PointerDown.
                          * The order of occurrence is such that PointerDown comes first.
                          * Translate the above text into English.
                          */
                        this._setEditorFocus(unitId);
                        setTimeout(() => {
                            this._setEditorFocus(unitId);
                            this._textSelectionRenderManager.setCursorManually(offsetX, offsetY);
                        }, 0);
                    }

                    if (evt.button !== 2) {
                        state.stopPropagation();
                    }
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                document?.onDblclick$.subscribeEvent((evt: IPointerEvent | IMouseEvent) => {
                    if (this._isEditorReadOnly(unitId)) {
                        return;
                    }
                    this._textSelectionRenderManager.handleDblClick(evt);
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                document?.onTripleClick$.subscribeEvent((evt: IPointerEvent | IMouseEvent) => {
                    if (this._isEditorReadOnly(unitId)) {
                        return;
                    }
                    this._textSelectionRenderManager.handleTripleClick(evt);
                })
            )
        );
    }

    private _isEditorReadOnly(unitId: string) {
        const editor = this._editorService.getEditor(unitId);
        if (!editor) {
            return false;
        }

        return editor.isReadOnly();
    }

    private _setEditorFocus(unitId: string) {
        /**
         * The object for selecting data in the editor is set to the current sheet.
         */
        const sheetInstances = this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (sheetInstances.length > 0) {
            const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            this._editorService.setOperationSheetUnitId(workbook.getUnitId());
            // this._editorService.setOperationSheetSubUnitId(workbook.getActiveSheet().getSheetId());
        }

        this._editorService.focusStyle(unitId);
    }

    private _commandExecutedListener() {
        const updateCommandList = [SetDocZoomRatioOperation.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const params = command.params as ISetDocZoomRatioOperationParams;
                    const { unitId: documentId } = params;

                    const unitId = this._textSelectionManagerService.getCurrentSelection()?.unitId;

                    if (documentId !== unitId) {
                        return;
                    }

                    this._textSelectionManagerService.refreshSelection();
                }
            })
        );
    }

    private _skeletonListener() {
        // Change text selection runtime(skeleton, scene) and update text selection manager current selection.
        this.disposeWithMe(
            this._docSkeletonManagerService.currentSkeleton$.subscribe((param) => {
                if (param == null) {
                    return;
                }
                const { unitId, skeleton } = param;

                const currentRender = this._renderManagerService.getRenderById(unitId);

                if (currentRender == null) {
                    return;
                }

                const { scene, mainComponent } = currentRender;

                this._textSelectionRenderManager.changeRuntime(skeleton, scene, mainComponent as Documents);

                this._textSelectionManagerService.setCurrentSelectionNotRefresh({
                    unitId,
                    subUnitId: '',
                });

                // The initial cursor is set at the beginning of the document,
                // and can be set to the previous cursor position in the future.
                if (!this._editorService.isEditor(unitId)) {
                    this._textSelectionManagerService.replaceTextRanges([
                        {
                            startOffset: 0,
                            endOffset: 0,
                        },
                    ], false);
                }
            })
        );
    }

    private _getDocObjectById(unitId: string) {
        if (this._univerInstanceService.getUnitType(unitId) !== UniverInstanceType.UNIVER_DOC) {
            return null;
        }

        return getDocObjectById(unitId, this._renderManagerService);
    }
}
