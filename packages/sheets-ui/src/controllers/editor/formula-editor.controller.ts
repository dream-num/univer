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

import type { Nullable } from '@univerjs/core';
import type {
    IRichTextEditingMutationParams,
} from '@univerjs/docs';
import type { RenderComponentType } from '@univerjs/engine-render';
import type { IEditorBridgeServiceVisibleParam } from '../../services/editor-bridge.service';
import {
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    EDITOR_ACTIVATED,
    FOCUSING_EDITOR_BUT_HIDDEN,
    FOCUSING_FX_BAR_EDITOR,
    ICommandService,
    IContextService,
    Inject,
    IUndoRedoService,
    IUniverInstanceService,
    RxDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import {
    DocSelectionManagerService,
    DocSkeletonManagerService,
    RichTextEditingMutation,
} from '@univerjs/docs';
import { CoverContentCommand, VIEWPORT_KEY as DOC_VIEWPORT_KEY, IEditorService } from '@univerjs/docs-ui';
import { DeviceInputEventType, IRenderManagerService, ScrollBar } from '@univerjs/engine-render';
import { combineLatest, filter, takeUntil } from 'rxjs';
import { getEditorObject } from '../../basics/editor/get-editor-object';
import { SetCellEditVisibleOperation } from '../../commands/operations/cell-edit.operation';
import { IEditorBridgeService } from '../../services/editor-bridge.service';
import { IFormulaEditorManagerService } from '../../services/editor/formula-editor-manager.service';

export class FormulaEditorController extends RxDisposable {
    private _loadedMap = new WeakSet<RenderComponentType>();

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @ICommandService private readonly _commandService: ICommandService,
        @IContextService private readonly _contextService: IContextService,
        @IFormulaEditorManagerService private readonly _formulaEditorManagerService: IFormulaEditorManagerService,
        @IUndoRedoService private readonly _undoRedoService: IUndoRedoService,
        @Inject(DocSelectionManagerService) private readonly _textSelectionManagerService: DocSelectionManagerService,
        @IEditorService private readonly _editorService: IEditorService
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        this._syncEditorSize();
        this._listenFxBtnClick();
        this._handleContentChange();

        this._univerInstanceService.focused$.pipe(takeUntil(this.dispose$)).subscribe((unitId) => {
            this._create(unitId);
        });

        this._create(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);

        this.disposeWithMe(this._editorService.focus$.subscribe(() => {
            const focusUnitId = this._editorService.getFocusEditor()?.getEditorId();
            if (focusUnitId !== DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY) {
                this._contextService.setContextValue(FOCUSING_FX_BAR_EDITOR, false);
            } else {
                this._contextService.setContextValue(FOCUSING_FX_BAR_EDITOR, true);
            }
        }));
    }

    private _handleContentChange() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === RichTextEditingMutation.id) {
                    const params = commandInfo.params as IRichTextEditingMutationParams;
                    const { unitId } = params;
                    if (unitId === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY) {
                        this.autoScroll();
                    }
                }
            })
        );
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
                this._contextService.setContextValue(FOCUSING_FX_BAR_EDITOR, true);

                const currentSheet = this._univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_SHEET);
                const formulaEditorDataModel = this._univerInstanceService.getUniverDocInstance(
                    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY
                );

                const visibleState = this._editorBridgeService.isVisible();
                if (visibleState.visible === false) {
                    this._commandService.syncExecuteCommand(
                        SetCellEditVisibleOperation.id,
                        {
                            visible: true,
                            eventType: DeviceInputEventType.PointerDown,
                            unitId: currentSheet?.getUnitId() ?? '',
                        } as IEditorBridgeServiceVisibleParam
                    );
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

                this._textSelectionManagerService.replaceDocRanges(textRanges);
            }
        });
    }

    private _syncEditorSize() {
        // this._univerInstanceService.
        const addFOrmulaBar$ = this._univerInstanceService.unitAdded$.pipe(filter((unit) => unit.getUnitId() === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY));
        this.disposeWithMe(combineLatest([this._formulaEditorManagerService.position$, addFOrmulaBar$]).subscribe(([position]) => {
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
            this.autoScroll();
            this._scheduledCallback = requestIdleCallback(() => engine.resizeBySize(width, height));
        }));
    }

    private _scheduledCallback: number = -1;
    private _clearScheduledCallback(): void {
        if (this._scheduledCallback !== -1) cancelIdleCallback(this._scheduledCallback);
        this._scheduledCallback = -1;
    }

    autoScroll() {
        const position = this._formulaEditorManagerService.getPosition();

        const skeleton = this._renderManagerService.getRenderById(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY)?.with(DocSkeletonManagerService).getSkeleton();
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
        const viewportMain = scene.getViewport(DOC_VIEWPORT_KEY.VIEW_MAIN);
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
                viewportMain?.resetCanvasSizeAndUpdateScroll();
            }
        } else {
            scrollBar = null;
            viewportMain?.scrollToViewportPos({ viewportScrollX: 0, viewportScrollY: 0 });
            viewportMain?.getScrollBar()?.dispose();
        }
    }
}
