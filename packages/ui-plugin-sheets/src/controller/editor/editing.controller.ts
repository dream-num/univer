import { DocSkeletonManagerService, getDocObject, TextSelectionManagerService } from '@univerjs/base-docs';
import { IRenderManagerService, ITextSelectionRenderManager } from '@univerjs/base-render';
import {
    Disposable,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    Nullable,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { Subscription } from 'rxjs';

@OnLifecycle(LifecycleStages.Rendered, NormalInputController)
export class NormalInputController extends Disposable {
    private _onInputSubscription: Nullable<Subscription>;

    constructor(
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initialize();

        this._commandExecutedListener();
    }

    override dispose(): void {
        this._onInputSubscription?.unsubscribe();
    }

    private _initialize() {
        this._initialNormalInput();
    }

    private _initialNormalInput() {}

    private _commandExecutedListener() {}

    private _getDocObject() {
        return getDocObject(this._currentUniverService, this._renderManagerService);
    }
}
