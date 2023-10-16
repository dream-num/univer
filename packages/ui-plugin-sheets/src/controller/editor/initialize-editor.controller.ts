import { DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DOCS_NORMAL_EDITOR_UNIT_ID_KEY } from '@univerjs/base-render';
import { Disposable, ICurrentUniverService, LifecycleStages, Nullable, OnLifecycle } from '@univerjs/core';
import { Subscription } from 'rxjs';

@OnLifecycle(LifecycleStages.Rendered, InitializeEditorController)
export class InitializeEditorController extends Disposable {
    private _onInputSubscription: Nullable<Subscription>;

    constructor(@ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService) {
        super();

        this._initialize();

        this._commandExecutedListener();
    }

    override dispose(): void {
        this._onInputSubscription?.unsubscribe();
    }

    private _initialize() {
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
}
