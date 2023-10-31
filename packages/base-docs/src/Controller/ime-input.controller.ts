import {
    IRenderManagerService,
    ITextSelectionRangeWithStyle,
    ITextSelectionRenderManager,
} from '@univerjs/base-render';
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
import { IMEInputCommand } from '../commands/commands/core-editing.command';
import { DocSkeletonManagerService } from '../services/doc-skeleton-manager.service';
import { TextSelectionManagerService } from '../services/text-selection-manager.service';

@OnLifecycle(LifecycleStages.Rendered, IMEInputController)
export class IMEInputController extends Disposable {
    private _previousIMEContent: string = '';

    private _previousIMERange: Nullable<ITextSelectionRangeWithStyle>;

    private _onStartSubscription: Nullable<Subscription>;

    private _onUpdateSubscription: Nullable<Subscription>;

    private _onEndSubscription: Nullable<Subscription>;

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
        this._onStartSubscription?.unsubscribe();
        this._onUpdateSubscription?.unsubscribe();
        this._onEndSubscription?.unsubscribe();
    }

    private _initialize() {
        this._initialOnCompositionstart();

        this._initialOnCompositionUpdate();

        this._onEndSubscription = this._textSelectionRenderManager.onCompositionend$.subscribe((config) => {
            this._resetIME();
        });
    }

    private _initialOnCompositionstart() {
        this._onStartSubscription = this._textSelectionRenderManager.onCompositionstart$.subscribe((config) => {
            if (config == null) {
                return;
            }

            const { activeRange } = config;

            if (activeRange == null) {
                return;
            }

            this._previousIMERange = activeRange;
        });
    }

    private _initialOnCompositionUpdate() {
        this._onUpdateSubscription = this._textSelectionRenderManager.onCompositionupdate$.subscribe(async (config) => {
            const skeleton = this._docSkeletonManagerService.getCurrent()?.skeleton;

            if (this._previousIMERange == null || config == null || skeleton == null) {
                return;
            }

            const documentModel = this._currentUniverService.getCurrentUniverDocInstance();

            const { event, activeRange } = config;

            const { cursorStart, cursorEnd, isEndBack, isStartBack, segmentId, style } = this._previousIMERange;

            if (skeleton == null || activeRange == null) {
                return;
            }

            const e = event as CompositionEvent;

            const content = e.data;

            if (content === this._previousIMEContent) {
                return;
            }

            await this._commandService.executeCommand(IMEInputCommand.id, {
                unitId: documentModel.getUnitId(),
                newText: content,
                oldTextLen: this._previousIMEContent.length,
                range: this._previousIMERange,
                segmentId,
            });

            skeleton.calculate();

            const len = content.length;

            // move selection
            this._textSelectionManagerService.replace([
                {
                    cursorStart: cursorStart + len,
                    cursorEnd: cursorEnd + len,
                    isCollapse: true,
                    isEndBack,
                    isStartBack,
                    style,
                },
            ]);

            if (!this._previousIMERange.isCollapse) {
                this._previousIMERange.isCollapse = true;
            }

            this._previousIMEContent = content;
        });
    }

    private _resetIME() {
        this._previousIMEContent = '';

        this._previousIMERange = null;
    }

    private _commandExecutedListener() {}

    private _getDocObject() {
        return getDocObject(this._currentUniverService, this._renderManagerService);
    }
}
