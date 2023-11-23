import { getDocObject } from '@univerjs/base-docs';
import { IRenderManagerService } from '@univerjs/base-render';
import {
    Disposable,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    IUniverInstanceService,
    LifecycleStages,
    Nullable,
    OnLifecycle,
} from '@univerjs/core';
import { Subscription } from 'rxjs';

@OnLifecycle(LifecycleStages.Rendered, InitializeEditorController)
export class InitializeEditorController extends Disposable {
    private _onInputSubscription: Nullable<Subscription>;

    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        // TODO: @JOCS, remove use setTimeout.
        setTimeout(() => {
            this._initialize();
        }, 0);

        this._commandExecutedListener();
    }

    override dispose(): void {
        this._onInputSubscription?.unsubscribe();
    }

    private _initialize() {
        // create univer doc sheet cell editor instance
        this._currentUniverService.createDoc({
            id: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            documentStyle: {},
        });

        // create univer doc formula bar editor instance
        this._currentUniverService.createDoc({
            id: DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
            documentStyle: {},
        });
    }

    private _commandExecutedListener() {}

    private _getDocObject() {
        return getDocObject(this._currentUniverService, this._renderManagerService);
    }
}
