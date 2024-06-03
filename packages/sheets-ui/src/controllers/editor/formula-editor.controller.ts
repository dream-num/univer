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

import type { ICommandInfo, IParagraph, ITextRun, Nullable } from '@univerjs/core';
import {
    createInterceptorKey,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    EDITOR_ACTIVATED,
    FOCUSING_EDITOR_BUT_HIDDEN,
    FOCUSING_FORMULA_EDITOR,
    HorizontalAlign,
    ICommandService,
    IContextService,
    InterceptorManager,
    IUndoRedoService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    RxDisposable,
    toDisposable,
    Tools,
} from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import {
    CoverContentCommand,
    DocSkeletonManagerService,
    DocViewModelManagerService,
    RichTextEditingMutation,
    TextSelectionManagerService,
    VIEWPORT_KEY,
} from '@univerjs/docs';
import type { RenderComponentType } from '@univerjs/engine-render';
import { DeviceInputEventType, IRenderManagerService, ScrollBar } from '@univerjs/engine-render';
import type { IMoveRangeMutationParams, ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { MoveRangeMutation, SetRangeValuesMutation } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';
import { takeUntil } from 'rxjs';

import { SetEditorResizeOperation } from '@univerjs/ui';
import { getEditorObject } from '../../basics/editor/get-editor-object';
import { IFormulaEditorManagerService } from '../../services/editor/formula-editor-manager.service';
import type { IEditorBridgeServiceParam } from '../../services/editor-bridge.service';
import { IEditorBridgeService } from '../../services/editor-bridge.service';

export const FORMULA_EDIT_PERMISSION_CHECK = createInterceptorKey<boolean, { row: number; col: number }>('formulaEditPermissionCheck');

@OnLifecycle(LifecycleStages.Rendered, FormulaEditorController)
export class FormulaEditorController extends RxDisposable {
    private _loadedMap = new WeakSet<RenderComponentType>();

    public interceptor = new InterceptorManager({ FORMULA_EDIT_PERMISSION_CHECK });

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @ICommandService private readonly _commandService: ICommandService,
        @IContextService private readonly _contextService: IContextService,
        @IFormulaEditorManagerService private readonly _formulaEditorManagerService: IFormulaEditorManagerService,
        @IUndoRedoService private readonly _undoRedoService: IUndoRedoService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @Inject(DocViewModelManagerService) private readonly _docViewModelManagerService: DocViewModelManagerService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        this._syncFormulaEditorContent();
        this._commandExecutedListener();
        this._syncEditorSize();
        this._listenFxBtnClick();
        this._listenFoldBtnClick();

        this._renderManagerService.currentRender$.pipe(takeUntil(this.dispose$)).subscribe((unitId) => {
            this._create(unitId);
        });

        this._create(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);

        this._textSelectionManagerService.textSelection$.pipe(takeUntil(this.dispose$)).subscribe((param) => {
            if (param == null) {
                return;
            }
            const { unitId } = param;
            // Mark formula editor as non-focused, when current selection is not in formula editor.
            if (unitId !== DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY) {
                this._contextService.setContextValue(FOCUSING_FORMULA_EDITOR, false);
                this._undoRedoService.clearUndoRedo(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);
            }
        });
    }

    private _create(unitId: Nullable<string>) {
        if (unitId !== DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY) {
            return;
        }

        const formulaEditorDocObject = this._renderManagerService.getRenderById(unitId);
        if (formulaEditorDocObject == null) {
            return;
        }

        const { mainComponent: documentComponent } = formulaEditorDocObject;

        if (documentComponent == null) {
            return;
        }

        if (!this._loadedMap.has(documentComponent)) {
            this._initialMain(unitId);
            this._loadedMap.add(documentComponent);
        }
    }

    private _listenFxBtnClick() {
        this._formulaEditorManagerService.fxBtnClick$.pipe(takeUntil(this.dispose$)).subscribe(() => {
            const isFocusButHidden =
                this._contextService.getContextValue(FOCUSING_EDITOR_BUT_HIDDEN) &&
                !this._contextService.getContextValue(EDITOR_ACTIVATED);

            if (isFocusButHidden) {
                this._univerInstanceService.setCurrentUnitForType(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);

                this._contextService.setContextValue(FOCUSING_FORMULA_EDITOR, true);

                const formulaEditorDataModel = this._univerInstanceService.getUniverDocInstance(
                    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY
                );

                const visibleState = this._editorBridgeService.isVisible();
                if (visibleState.visible === false) {
                    this._editorBridgeService.changeVisible({
                        visible: true,
                        eventType: DeviceInputEventType.PointerDown,
                    });
                }

                const content = formulaEditorDataModel?.getBody()?.dataStream;

                if (content == null) {
                    return;
                }

                let newContent = content.startsWith('=') ? content : `=${content}`;

                newContent = newContent.replace(/\r\n$/, '');

                const textRanges = [
                    {
                        startOffset: newContent.length,
                        endOffset: newContent.length,
                    },
                ];

                const coverContentParams = {
                    unitId: DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
                    body: {
                        dataStream: newContent,
                    },
                    segmentId: '',
                };

                this._commandService.executeCommand(CoverContentCommand.id, coverContentParams);

                this._textSelectionManagerService.replaceTextRanges(textRanges);
            }
        });
    }

    private _listenFoldBtnClick() {
        this._formulaEditorManagerService.foldBtnStatus$.pipe(takeUntil(this.dispose$)).subscribe(() => {
            this._textSelectionManagerService.refreshSelection();
        });
    }

    private _initialMain(unitId: string) {
        const formulaEditorDocObject = this._renderManagerService.getRenderById(unitId);
        if (formulaEditorDocObject == null) {
            return;
        }

        const { mainComponent: documentComponent } = formulaEditorDocObject;

        if (documentComponent == null) {
            return;
        }

        this.disposeWithMe(
            toDisposable(
                documentComponent.onPointerDownObserver.add(() => {
                    this._contextService.setContextValue(FOCUSING_FORMULA_EDITOR, true);
                    this._undoRedoService.clearUndoRedo(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);

                    // When clicking on the formula bar, the cell editor also needs to enter the edit state
                    const visibleState = this._editorBridgeService.isVisible();
                    if (visibleState.visible === false) {
                        this._editorBridgeService.changeVisible({
                            visible: true,
                            eventType: DeviceInputEventType.Dblclick,
                        });
                    }
                })
            )
        );
    }

    // Listen to changes in the size of the formula editor container to set the size of the editor.
    private _syncEditorSize() {
        this._formulaEditorManagerService.position$.pipe(takeUntil(this.dispose$)).subscribe((position) => {
            if (!position) return this._clearScheduledCallback();

            const editorObject = getEditorObject(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, this._renderManagerService);
            const formulaEditorDataModel = this._univerInstanceService.getUniverDocInstance(
                DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY
            );

            if (editorObject == null || formulaEditorDataModel == null) return this._clearScheduledCallback();

            const { width, height } = position;
            if (width === 0 || height === 0) return this._clearScheduledCallback();

            const { engine } = editorObject;
            formulaEditorDataModel.updateDocumentDataPageSize(width);
            this._autoScroll();
            this._scheduledCallback = requestIdleCallback(() => engine.resizeBySize(width, height));
        });
    }

    private _scheduledCallback: number = -1;
    private _clearScheduledCallback(): void {
        if (this._scheduledCallback !== -1) cancelIdleCallback(this._scheduledCallback);
        this._scheduledCallback = -1;
    }

    // Sync cell content to formula editor bar when sheet selection changed.
    private _syncFormulaEditorContent() {
        this._editorBridgeService.currentEditCellState$.pipe(takeUntil(this.dispose$)).subscribe((editCellState) => {
            if (editCellState == null || this._editorBridgeService.isForceKeepVisible()) {
                return;
            }

            const permissionCheck = this.interceptor.fetchThroughInterceptors(FORMULA_EDIT_PERMISSION_CHECK)(null, { row: editCellState.row, col: editCellState.column });
            if (!permissionCheck) {
                this._syncContentAndRender(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, '', [{ startIndex: 0 }], []);
                return;
            }

            this._editorSyncHandler(editCellState);
        });

        this._editorBridgeService.visible$.pipe(takeUntil(this.dispose$)).subscribe((state) => {
            if (state == null || state.visible === false || this._editorBridgeService.isForceKeepVisible()) {
                return;
            }

            const cellEditState = this._editorBridgeService.getLatestEditCellState();

            if (cellEditState == null) {
                return;
            }

            this._editorSyncHandler(cellEditState);
        });
    }

    private _editorSyncHandler(param: IEditorBridgeServiceParam) {
        const body = param.documentLayoutObject.documentModel?.getBody();

        let dataStream = body?.dataStream;
        let paragraphs = body?.paragraphs;
        let textRuns: ITextRun[] = [];

        if (dataStream == null || paragraphs == null) {
            return;
        }

        if (
            param.isInArrayFormulaRange === true &&
            this._editorBridgeService.isVisible().eventType === DeviceInputEventType.Dblclick
        ) {
            dataStream = '\r\n';
            paragraphs = [
                {
                    startIndex: 0,
                },
            ];
        } else if (param.isInArrayFormulaRange === true) {
            textRuns = body?.textRuns || [];
        }

        this._syncContentAndRender(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, dataStream, paragraphs, textRuns);

        // Also need to resize document and scene after sync content.
        this._autoScroll();
    }

    private _commandExecutedListener() {
        const updateCommandList = [RichTextEditingMutation.id, SetEditorResizeOperation.id];

        const INCLUDE_LIST = [DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const params = command.params as IRichTextEditingMutationParams;
                    const { unitId } = params;

                    if (INCLUDE_LIST.includes(unitId)) {
                        // sync cell content to formula editor bar when edit cell editor and vice verse.
                        const editorDocDataModel = this._univerInstanceService.getUniverDocInstance(unitId);
                        const dataStream = editorDocDataModel?.getBody()?.dataStream;
                        const paragraphs = editorDocDataModel?.getBody()?.paragraphs;

                        const syncId =
                            unitId === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY
                                ? DOCS_NORMAL_EDITOR_UNIT_ID_KEY
                                : DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY;

                        if (dataStream == null || paragraphs == null) {
                            return;
                        }

                        this._syncContentAndRender(syncId, dataStream, paragraphs);

                        // handle weather need to show scroll bar.
                        this._autoScroll();
                    }
                }
            })
        );

        // Update formula bar content when you call SetRangeValuesMutation and MoveRangeMutation.
        const needUpdateFormulaEditorContentCommandList = [SetRangeValuesMutation.id, MoveRangeMutation.id];
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (needUpdateFormulaEditorContentCommandList.includes(command.id)) {
                    const editCellState = this._editorBridgeService.getLatestEditCellState();

                    if (editCellState == null) {
                        return;
                    }

                    let needUpdate = false;

                    const { row, column } = editCellState;

                    if (command.id === SetRangeValuesMutation.id && command.params) {
                        const params = command.params as ISetRangeValuesMutationParams;
                        if (params.cellValue?.[row]?.[column]) {
                            needUpdate = true;
                        }
                    } else if (command.id === MoveRangeMutation.id && command.params) {
                        const params = command.params as IMoveRangeMutationParams;
                        if (params.to.value?.[row]?.[column]) {
                            needUpdate = true;
                        }
                    }

                    if (needUpdate) {
                        const body = editCellState.documentLayoutObject.documentModel?.getBody();

                        if (body == null) {
                            return;
                        }
                        const { dataStream, paragraphs = [] } = body;
                        this._syncContentAndRender(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, dataStream, paragraphs);
                        // handle weather need to show scroll bar.
                        this._autoScroll();
                    }
                }
            })
        );
    }

    private _syncContentAndRender(
        unitId: string,
        dataStream: string,
        paragraphs: IParagraph[],
        textRuns: ITextRun[] = []
    ) {
        const INCLUDE_LIST = [DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY];

        const docsSkeletonObject = this._docSkeletonManagerService.getSkeletonByUnitId(unitId);
        const docDataModel = this._univerInstanceService.getUniverDocInstance(unitId);
        const docViewModel = this._docViewModelManagerService.getViewModel(unitId);

        if (docDataModel == null || docViewModel == null || docsSkeletonObject == null) {
            return;
        }

        docDataModel.getBody()!.dataStream = dataStream;
        docDataModel.getBody()!.paragraphs = this._clearParagraph(paragraphs);

        // Need to empty textRuns(previous formula highlight) every time when sync content(change selection or edit cell or edit formula bar).
        if (unitId === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY) {
            docDataModel.getBody()!.textRuns = [];
        }

        if (textRuns.length > 0) {
            docDataModel.getBody()!.textRuns = textRuns;
        }

        docViewModel.reset(docDataModel);

        const { skeleton } = docsSkeletonObject;

        const currentRender = this._renderManagerService.getRenderById(unitId);

        if (currentRender == null) {
            return;
        }

        skeleton.calculate();

        if (INCLUDE_LIST.includes(unitId)) {
            currentRender.mainComponent?.makeDirty();
        }
    }

    private _clearParagraph(paragraphs: IParagraph[]) {
        const newParagraphs = Tools.deepClone(paragraphs);
        for (const paragraph of newParagraphs) {
            if (paragraph.paragraphStyle) {
                paragraph.paragraphStyle.horizontalAlign = HorizontalAlign.UNSPECIFIED;
            }
        }

        return newParagraphs;
    }

    private _autoScroll() {
        const skeleton = this._docSkeletonManagerService.getSkeletonByUnitId(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY)
            ?.skeleton;
        const position = this._formulaEditorManagerService.getPosition();

        const editorObject = this._renderManagerService.getRenderById(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);

        const formulaEditorDataModel = this._univerInstanceService.getUniverDocInstance(
            DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY
        );

        if (skeleton == null || position == null || editorObject == null || formulaEditorDataModel == null) {
            return;
        }

        const { marginTop = 0, marginBottom = 0 } = formulaEditorDataModel.getSnapshot().documentStyle;

        const { scene, mainComponent } = editorObject;

        let { actualHeight } = skeleton.getActualSize();
        // page actual height also need to include page margin top and margin bottom.
        actualHeight += marginTop + marginBottom;

        const { width, height } = position;
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
                viewportMain?.resetCanvasSizeAndUpdateScrollBar();
            }
        } else {
            scrollBar = null;
            viewportMain?.scrollTo({ x: 0, y: 0 });
            viewportMain?.getScrollBar()?.dispose();
        }
    }
}
