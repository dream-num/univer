import {
    CoverContentCommand,
    DocSkeletonManagerService,
    DocViewModelManagerService,
    getDocObject,
} from '@univerjs/base-docs';
import { IRenderManagerService } from '@univerjs/base-render';
import {
    Disposable,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    Nullable,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { Subscription } from 'rxjs';

import { IEditorBridgeService } from '../../services/editor-bridge.service';

@OnLifecycle(LifecycleStages.Steady, FormulaEditorController)
export class FormulaEditorController extends Disposable {
    private _onSheetSelectionSubscription: Nullable<Subscription>;

    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
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
    }

    // Sync cell content to formula editor when sheet selection changed.
    private _syncFormulaEditorContent() {
        this._onSheetSelectionSubscription = this._editorBridgeService.state$.subscribe((param) => {
            if (param == null || this._editorBridgeService.isForceKeepVisible()) {
                return;
            }

            const content = param.documentLayoutObject.documentModel?.getBody()?.dataStream.replace(/\r\n$/, '');

            this._commandService.executeCommand(CoverContentCommand.id, {
                unitId: DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
                body: {
                    dataStream: `=${content}`,
                },
                segmentId: null,
            });

            console.log('cell selection changed', param);
        });
    }

    private _getDocObject() {
        return getDocObject(this._currentUniverService, this._renderManagerService);
    }
}
