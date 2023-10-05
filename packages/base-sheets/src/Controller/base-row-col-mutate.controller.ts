import { Disposable, IUndoRedoCommandInfos } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { RowColMutatingService } from '../services/row-col-mutating/row-col-mutating.service';

/**
 * This controller determines basic mutations that should be appended to
 * `InsertRowCommand` `InsertColumnCommand` `RemoveRowCommand` `RemoveColumnCommand`.
 */
export class BaseRowColMutatingController extends Disposable {
    constructor(@Inject(RowColMutatingService) private readonly _mutatingService: RowColMutatingService) {
        super();

        this._init();
    }

    private _init(): void {}
}

// when rows inserted
function insertRowCopyCellsStyleRule(): IUndoRedoCommandInfos {
    return {
        undos: [],
        redos: [],
    };
}

function insertRowUpdateMergedCellsRule() {}

// when rows removed

// when columns inserted

// when columns removed
