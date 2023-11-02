import { AutoFillCommand } from '@univerjs/base-sheets';
import { APPLY_TYPE } from '@univerjs/base-sheets/services/auto-fill/type.js';
import {
    Direction,
    Disposable,
    ICellData,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    Nullable,
    OnLifecycle,
    toDisposable,
} from '@univerjs/core';

import { IControlFillConfig, ISelectionRenderService } from '../services/selection/selection-render.service';

@OnLifecycle(LifecycleStages.Ready, AutoFillController)
export class AutoFillController extends Disposable {
    private _direction: Direction;
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
        this._onSelectionControlFillChanged();
    }

    private _onSelectionControlFillChanged() {
        this.disposeWithMe(
            toDisposable(
                this._selectionRenderService.controlFillConfig$.subscribe((config: IControlFillConfig | null) => {
                    if (!config) {
                        return;
                    }
                    this._fillData(config);
                })
            )
        );
    }

    private _getApplyType() {
        return APPLY_TYPE.SERIES; // default apply type
    }

    private _fillData(config: IControlFillConfig) {
        const { newRange, oldRange: copyRange } = config;
        const applyRange = {
            startRow: newRange.startRow,
            endRow: newRange.endRow,
            startColumn: newRange.startColumn,
            endColumn: newRange.endColumn,
        };
        // calc direction & apply range according to new ranges's start & end and current selection's start & end in config
        let direction: Direction;
        if (newRange.startRow < copyRange.startRow) {
            direction = Direction.UP;
            applyRange.endRow = copyRange.startRow - 1;
        } else if (newRange.endRow > copyRange.endRow) {
            direction = Direction.DOWN;
            applyRange.startRow = copyRange.endRow + 1;
        } else if (newRange.startColumn < copyRange.startColumn) {
            direction = Direction.LEFT;
            applyRange.endColumn = copyRange.startColumn - 1;
        } else if (newRange.endColumn > copyRange.endColumn) {
            direction = Direction.RIGHT;
            applyRange.startColumn = copyRange.endColumn + 1;
        } else {
            return;
        }
        this._direction = direction;

        const {
            startRow: copyStartRow,
            startColumn: copyStartColumn,
            endRow: copyEndRow,
            endColumn: copyEndColumn,
        } = copyRange;

        const {
            startRow: applyStartRow,
            startColumn: applyStartColumn,
            endRow: applyEndRow,
            endColumn: applyEndColumn,
        } = applyRange;

        const currentCellDatas = this._univerInstanceService
            .getCurrentUniverSheetInstance()
            .getActiveSheet()
            .getCellMatrix();

        const copyData = getCopyData(
            currentCellDatas,
            copyStartRow,
            copyEndRow,
            copyStartColumn,
            copyEndColumn,
            direction
        );

        let csLen;
        if (direction === Direction.DOWN || direction === Direction.UP) {
            csLen = copyEndRow - copyStartRow + 1;
        } else {
            csLen = copyEndColumn - copyStartColumn + 1;
        }

        const applyType = this._getApplyType();
        const applyDatas: Array<Array<Nullable<ICellData>>> = [];

        if (direction === Direction.DOWN || direction === Direction.UP) {
            const asLen = applyEndRow - applyStartRow + 1;
            const untransformedApplyDatas = [];
            for (let i = applyStartColumn; i <= applyEndColumn; i++) {
                const copyD = copyData[i - applyStartColumn];

                const applyData = getApplyData(copyD, csLen, asLen, direction, applyType);
                untransformedApplyDatas.push(applyData);
            }
            for (let i = 0; i < untransformedApplyDatas[0].length; i++) {
                const row: Array<Nullable<ICellData>> = [];
                for (let j = 0; j < untransformedApplyDatas.length; j++) {
                    row.push(untransformedApplyDatas[j][i]);
                }
                applyDatas.push(row);
            }
        } else {
            const asLen = applyEndColumn - applyStartColumn + 1;
            for (let i = applyStartRow; i <= applyEndRow; i++) {
                const copyD = copyData[i - applyStartRow];
                const applyData = getApplyData(copyD, csLen, asLen, direction, applyType);
                applyDatas.push(applyData);
            }
        }
        this._commandService.executeCommand(AutoFillCommand.id, {
            selectionRange: newRange,
            applyRange,
            applyDatas,
            workbookId: this._univerInstanceService.getCurrentUniverSheetInstance().getUnitId(),
            worksheetId: this._univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId(),
        });
    }
}
