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
import { Disposable, ICommandService, Inject, isInternalEditorID, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import type { Documents, IMouseEvent, IPointerEvent, IRenderContext, IRenderModule, RenderComponentType } from '@univerjs/engine-render';
import { CURSOR_TYPE, DocumentEditArea, ITextSelectionRenderManager, PageLayoutType, Vector2 } from '@univerjs/engine-render';

import { IEditorService } from '@univerjs/ui';
import type { ISetDocZoomRatioOperationParams } from '@univerjs/docs';
import { DocSkeletonManagerService, neoGetDocObject, SetDocZoomRatioOperation, TextSelectionManagerService } from '@univerjs/docs';

export class DocTextSelectionRenderController extends Disposable implements IRenderModule {
    private _loadedMap = new WeakSet<RenderComponentType>();

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @ICommandService private readonly _commandService: ICommandService,
        @IEditorService private readonly _editorService: IEditorService,
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService
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
        const { unitId } = this._context;
        const docObject = neoGetDocObject(this._context);
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
        const docObject = neoGetDocObject(this._context);
        const { document, scene } = docObject;
        this.disposeWithMe(document.onPointerEnter$.subscribeEvent(() => {
            if (this._isEditorReadOnly(unitId)) {
                return;
            }
            document.cursor = CURSOR_TYPE.TEXT;
        }));

        this.disposeWithMe(document.onPointerLeave$.subscribeEvent(() => {
            document.cursor = CURSOR_TYPE.DEFAULT;
            scene.resetCursor();
        }));

        this.disposeWithMe(document.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
            if (this._isEditorReadOnly(unitId)) {
                return;
            }

            // FIXME:@Jocs: editor status should not be coupled with the instance service.
            const docDataModel = this._instanceSrv.getCurrentUnitForType(UniverInstanceType.UNIVER_DOC);
            if (docDataModel?.getUnitId() !== unitId) {
                this._instanceSrv.setCurrentUnitForType(unitId);
            }

            const skeleton = this._docSkeletonManagerService.getSkeleton();
            const { offsetX, offsetY } = evt;
            const coord = this._getTransformCoordForDocumentOffset(offsetX, offsetY);

            if (coord != null) {
                const {
                    pageLayoutType = PageLayoutType.VERTICAL,
                    pageMarginLeft,
                    pageMarginTop,
                } = document.getOffsetConfig();
                const { editArea } = skeleton.findEditAreaByCoord(
                    coord,
                    pageLayoutType,
                    pageMarginLeft,
                    pageMarginTop
                );

                const viewModel = this._docSkeletonManagerService.getViewModel();
                const preEditArea = viewModel.getEditArea();

                if (preEditArea !== DocumentEditArea.BODY && editArea !== DocumentEditArea.BODY && editArea !== preEditArea) {
                    viewModel.setEditArea(editArea);
                }
            }

            this._textSelectionRenderManager.eventTrigger(evt);

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
                const { offsetX, offsetY } = evt;

                setTimeout(() => {
                    this._setEditorFocus(unitId);
                    this._textSelectionRenderManager.setCursorManually(offsetX, offsetY);
                }, 0);
            }

            if (evt.button !== 2) {
                state.stopPropagation();
            }
        }));

        this.disposeWithMe(document.onDblclick$.subscribeEvent((evt: IPointerEvent | IMouseEvent) => {
            if (this._isEditorReadOnly(unitId)) {
                return;
            }

            this._textSelectionRenderManager.handleDblClick(evt);
        }));

        this.disposeWithMe(document.onTripleClick$.subscribeEvent((evt: IPointerEvent | IMouseEvent) => {
            if (this._isEditorReadOnly(unitId)) {
                return;
            }

            this._textSelectionRenderManager.handleTripleClick(evt);
        }));
    }

    private _getTransformCoordForDocumentOffset(evtOffsetX: number, evtOffsetY: number) {
        const docObject = neoGetDocObject(this._context);
        const { document, scene } = docObject;
        const { documentTransform } = document.getOffsetConfig();
        const activeViewport = scene.getViewports()[0];

        if (activeViewport == null) {
            return;
        }

        const originCoord = activeViewport.transformVector2SceneCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));

        return documentTransform.clone().invert().applyPoint(originCoord);
    }

    private _isEditorReadOnly(unitId: string) {
        const editor = this._editorService.getEditor(unitId);
        if (!editor) {
            return false;
        }

        return editor.isReadOnly();
    }

    private _setEditorFocus(unitId: string) {
        // TODO@wzhudev: fix
        /**
         * The object for selecting data in the editor is set to the current sheet.
         */
        // const sheetInstances = this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        // if (sheetInstances.length > 0) {
        //     const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        //     this._editorService.setOperationSheetUnitId(workbook.getUnitId());
        //     // this._editorService.setOperationSheetSubUnitId(workbook.getActiveSheet().getSheetId());
        // }

        this._editorService.focusStyle(unitId);
    }

    private _commandExecutedListener() {
        const updateCommandList = [SetDocZoomRatioOperation.id];

        this.disposeWithMe(this._commandService.onCommandExecuted((command: ICommandInfo) => {
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
        let init = false;
        // Change text selection runtime(skeleton, scene) and update text selection manager current selection.
        this.disposeWithMe(this._docSkeletonManagerService.currentSkeleton$.subscribe((skeleton) => {
            if (!skeleton) return;

            const { scene, mainComponent, unitId } = this._context;
            const isInternalEditor = isInternalEditorID(unitId);

            if (init) {
                this._textSelectionRenderManager.changeRuntime(skeleton, scene, mainComponent as Documents);
                this._textSelectionManagerService.setCurrentSelectionNotRefresh({
                    unitId,
                    subUnitId: '',
                });

                // The initial cursor is set at the beginning of the document,
                // and can be set to the previous cursor position in the future.
                // The skeleton of the editor has not been calculated at this moment, and it is determined whether it is an editor by its ID.
                if (!isInternalEditor) {
                    this._textSelectionManagerService.replaceTextRanges([
                        {
                            startOffset: 0,
                            endOffset: 0,
                        },
                    ], false);
                }
            }

            init = true;
        }));
    }
}
