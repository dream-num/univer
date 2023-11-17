import {
    IMoveRangeCommandParams,
    MoveRangeCommand,
    NORMAL_SELECTION_PLUGIN_NAME,
    SelectionManagerService,
} from '@univerjs/base-sheets';
import {
    Disposable,
    DisposableCollection,
    ICommandService,
    LifecycleStages,
    OnLifecycle,
    toDisposable,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { ISelectionRenderService } from '../services/selection/selection-render.service';

@OnLifecycle(LifecycleStages.Steady, MoveRangeController)
export class MoveRangeController extends Disposable {
    constructor(
        @Inject(ISelectionRenderService) private readonly _selectionRenderService: ISelectionRenderService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @Inject(ICommandService) private readonly _commandService: ICommandService
    ) {
        super();
        this._initialize();
    }

    private _initialize = () => {
        const disposableCollection = new DisposableCollection();

        this.disposeWithMe(
            toDisposable(
                this._selectionManagerService.selectionInfo$.subscribe(() => {
                    // Each range change requires re-listening
                    disposableCollection.dispose();

                    const current = this._selectionManagerService.getCurrent();

                    /**
                     * Moving the selection only responds to regular selections;
                     * it does not apply to selections for features like formulas or charts.
                     */
                    if (current?.pluginName !== NORMAL_SELECTION_PLUGIN_NAME) {
                        return;
                    }

                    const selectionControls = this._selectionRenderService.getCurrentControls();
                    selectionControls.forEach((controlSelection) => {
                        disposableCollection.add(
                            toDisposable(
                                controlSelection.selectionMoved$.subscribe((_toRange) => {
                                    if (!_toRange) {
                                        return;
                                    }

                                    const _fromRange = controlSelection.model.getRange();
                                    const fromRange = {
                                        startRow: _fromRange.startRow,
                                        startColumn: _fromRange.startColumn,
                                        endRow: _fromRange.endRow,
                                        endColumn: _fromRange.endColumn,
                                    };
                                    const toRange = {
                                        startRow: _toRange.startRow,
                                        startColumn: _toRange.startColumn,
                                        endRow: _toRange.endRow,
                                        endColumn: _toRange.endColumn,
                                    };

                                    if (
                                        fromRange.startRow === toRange.startRow &&
                                        fromRange.startColumn === toRange.startColumn
                                    ) {
                                        return;
                                    }

                                    if (toRange.startRow < 0 || toRange.startColumn < 0) {
                                        return;
                                    }

                                    const params: IMoveRangeCommandParams = {
                                        fromRange,
                                        toRange,
                                    };
                                    this._commandService.executeCommand(MoveRangeCommand.id, params);
                                })
                            )
                        );
                    });
                })
            )
        );
    };
}
