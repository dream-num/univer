import type { IRichTextEditingMutationParams } from '@univerjs/base-docs';
import {
    CoverContentCommand,
    DocSkeletonManagerService,
    DocViewModelManagerService,
    getDocObject,
    RichTextEditingMutation,
} from '@univerjs/base-docs';
import { IRenderManagerService } from '@univerjs/base-render';
import type { ICommandInfo, Nullable } from '@univerjs/core';
import {
    Disposable,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { type Subscription } from 'rxjs';

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
        @ICommandService private readonly _commandService: ICommandService
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
