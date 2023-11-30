import type { IRichTextEditingMutationParams } from '@univerjs/base-docs';
import {
    CoverContentCommand,
    DocSkeletonManagerService,
    DocViewModelManagerService,
    getDocObject,
    RichTextEditingMutation,
    VIEWPORT_KEY,
} from '@univerjs/base-docs';
import { IRenderManagerService } from '@univerjs/base-render';
import type { ICommandInfo, Nullable } from '@univerjs/core';
import {
    Disposable,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    FOCUSING_FORMULA_EDITOR,
    ICommandService,
    IContextService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { type Subscription } from 'rxjs';

import { getEditorObject } from '../../basics/editor/get-editor-object';
import { IFormulaEditorManagerService } from '../../services/editor/formula-editor-manager.service';
import { IEditorBridgeService } from '../../services/editor-bridge.service';

@OnLifecycle(LifecycleStages.Steady, FormulaEditorController)
export class FormulaEditorController extends Disposable {
    private _onSheetSelectionSubscription: Nullable<Subscription>;

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @Inject(DocViewModelManagerService) private readonly _docViewModelManagerService: DocViewModelManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @IContextService private readonly _contextService: IContextService,
        @IFormulaEditorManagerService private readonly _formulaEditorManagerService: IFormulaEditorManagerService
    ) {
        super();

        this._initialize();
    }

    override dispose(): void {
        this._onSheetSelectionSubscription?.unsubscribe();
    }

    private _initialize() {
        this._syncFormulaEditorContent();
        this._commandExecutedListener();
        this._syncEditorSize();
        this._listenCurrentSkeleton();
    }

    private _listenCurrentSkeleton() {
        this._docSkeletonManagerService.currentSkeleton$.subscribe((params) => {
            if (params == null) {
                return;
            }

            const { unitId } = params;
            if (unitId !== DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY) {
                return;
            }

            this._contextService.setContextValue(FOCUSING_FORMULA_EDITOR, true);
        });
    }

    // Listen to changes in the size of the formula editor container to set the size of the editor.
    private _syncEditorSize() {
        this._formulaEditorManagerService.position$.subscribe((position) => {
            if (position == null) {
                return;
            }
            const editorObject = getEditorObject(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, this._renderManagerService);

            if (editorObject == null) {
                return;
            }

            const { width, height } = position;

            const { document: documentComponent, scene, engine } = editorObject;

            const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);

            viewportMain?.getScrollBar()?.dispose();

            scene.transformByState({
                width,
                height,
            });

            documentComponent.resize(width, height);

            // resize canvas
            requestIdleCallback(() => {
                engine.resizeBySize(width, height);
            });
        });
    }

    // Sync cell content to formula editor bar when sheet selection changed.
    private _syncFormulaEditorContent() {
        this._onSheetSelectionSubscription = this._editorBridgeService.state$.subscribe((param) => {
            if (param == null || this._editorBridgeService.isForceKeepVisible()) {
                return;
            }

            const content = param.documentLayoutObject.documentModel?.getBody()?.dataStream.replace(/\r\n$/, '');

            this._commandService.executeCommand(CoverContentCommand.id, {
                unitId: DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
                body: {
                    dataStream: `${content}`,
                },
                segmentId: null,
            });
        });
    }

    private _commandExecutedListener() {
        // sync cell content to formula editor bar when edit cell editor.
        const updateCommandList = [RichTextEditingMutation.id];

        const includeUnitList = [DOCS_NORMAL_EDITOR_UNIT_ID_KEY];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const params = command.params as IRichTextEditingMutationParams;
                    const { unitId } = params;

                    if (includeUnitList.includes(unitId)) {
                        const editorDocDataModel = this._univerInstanceService.getUniverDocInstance(unitId);
                        const content = editorDocDataModel?.getBody()?.dataStream.replace(/\r\n$/, '');

                        this._commandService.executeCommand(CoverContentCommand.id, {
                            unitId: DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
                            body: {
                                dataStream: `${content}`,
                            },
                            segmentId: null,
                        });
                    }
                }
            })
        );
    }

    private _getDocObject() {
        return getDocObject(this._univerInstanceService, this._renderManagerService);
    }
}
