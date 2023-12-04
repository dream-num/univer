import type { Nullable } from '@univerjs/core';
import { Disposable, ICommandService, IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { IRenderManagerService, ITextSelectionRenderManager } from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';
import type { Subscription } from 'rxjs';

import { getDocObject } from '../basics/component-tools';
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
        this._onInputSubscription = this._textSelectionRenderManager.onInput$.subscribe(async (config) => {
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

            const { startOffset, segmentId, style } = activeRange;

            const len = content.length;

            const textRanges = [
                {
                    startOffset: startOffset + len,
                    endOffset: startOffset + len,
                    collapsed: true,
                    style,
                },
            ];

            await this._commandService.executeCommand(InsertCommand.id, {
                unitId: documentModel.getUnitId(),
                body: {
                    dataStream: content,
                },
                range: activeRange,
                textRanges,
                segmentId,
            });

            skeleton.calculate();
        });
    }

    private _commandExecutedListener() {}

    private _getDocObject() {
        return getDocObject(this._currentUniverService, this._renderManagerService);
    }
}
