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

import { getDocObject } from '../Basics/component-tools';
import { InsertCommand } from '../commands/commands/core-editing.command';
import { DocSkeletonManagerService } from '../services/doc-skeleton-manager.service';
import { TextSelectionManagerService } from '../services/text-selection-manager.service';

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

    private _initialNormalInput() {
        this._onInputSubscription = this._textSelectionRenderManager.onInput$.subscribe((config) => {
            if (config == null) {
                return;
            }

            const documentModel = this._currentUniverService.getCurrentUniverDocInstance();

            const { event, content = '', activeRange } = config;

            const e = event as InputEvent;

            const skeleton = this._docSkeletonManagerService.getCurrent()?.skeleton;

            if (e.data == null || skeleton == null) {
                return;
            }

            if (!skeleton || !activeRange) {
                return;
            }

            const { cursorStart, cursorEnd, isCollapse, isEndBack, isStartBack, segmentId, style } = activeRange;

            this._commandService.executeCommand(InsertCommand.id, {
                unitId: documentModel.getUnitId(),
                body: {
                    dataStream: content,
                },
                range: activeRange,
                segmentId,
            });

            skeleton.calculate();

            const len = content.length;

            // move selection
            this._textSelectionManagerService.replace([
                {
                    cursorStart: cursorStart + len,
                    cursorEnd: cursorStart + len,
                    isCollapse: true,
                    isEndBack,
                    isStartBack,
                    style,
                },
            ]);
        });
    }

    private _commandExecutedListener() {}

    private _getDocObject() {
        return getDocObject(this._currentUniverService, this._renderManagerService);
    }
}
