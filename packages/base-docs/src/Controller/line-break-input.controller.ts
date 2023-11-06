import { IRenderManagerService, ITextSelectionRenderManager } from '@univerjs/base-render';
import {
    DataStreamTreeTokenType,
    Disposable,
    ICommandInfo,
    ICommandService,
    IParagraph,
    IUniverInstanceService,
    LifecycleStages,
    Nullable,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { Subscription } from 'rxjs';

import { getDocObject } from '../Basics/component-tools';
import { BreakLineCommand, InsertCommand } from '../commands/commands/core-editing.command';
import { DocSkeletonManagerService } from '../services/doc-skeleton-manager.service';
import { TextSelectionManagerService } from '../services/text-selection-manager.service';

@OnLifecycle(LifecycleStages.Rendered, LineBreakInputController)
export class LineBreakInputController extends Disposable {
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

    private _initialize() {}

    private _commandExecutedListener() {
        const updateCommandList = [BreakLineCommand.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (!updateCommandList.includes(command.id)) {
                    return;
                }

                this._breakLineFunction();
            })
        );
    }

    private _breakLineFunction() {
        const skeleton = this._docSkeletonManagerService.getCurrent()?.skeleton;

        const activeRange = this._textSelectionRenderManager.getActiveRange();

        if (activeRange == null || skeleton == null) {
            return;
        }

        const docsModel = this._currentUniverService.getCurrentUniverDocInstance();

        const { cursorStart, segmentId, style } = activeRange;

        // split paragraph

        // const selectionRemain = document.remainActiveSelection() as TextSelection | undefined;

        this._commandService.executeCommand(InsertCommand.id, {
            unitId: docsModel.getUnitId(),
            body: {
                dataStream: DataStreamTreeTokenType.PARAGRAPH,
                paragraphs: this._generateParagraph(DataStreamTreeTokenType.PARAGRAPH),
            },
            range: activeRange,
            segmentId,
        });

        skeleton?.calculate();

        // move selection
        this._textSelectionManagerService.replace([
            {
                cursorStart: cursorStart + 1,
                cursorEnd: cursorStart + 1,
                isCollapse: true,
                style,
            },
        ]);

        // const span = document.findNodeByCharIndex(++cursor);

        // this._adjustSelection(document as Documents, selectionRemain, span, true);
    }

    private _generateParagraph(dataStream: string) {
        const paragraphs: IParagraph[] = [];
        for (let i = 0, len = dataStream.length; i < len; i++) {
            const char = dataStream[i];
            if (char !== DataStreamTreeTokenType.PARAGRAPH) {
                continue;
            }

            paragraphs.push({
                startIndex: i,
            });
        }
        return paragraphs;
    }

    private _getDocObject() {
        return getDocObject(this._currentUniverService, this._renderManagerService);
    }
}
