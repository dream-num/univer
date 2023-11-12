import { BaseValueObject, IFunctionService, ISheetData } from '@univerjs/base-formula-engine';
import { RangeReferenceObject } from '@univerjs/base-formula-engine/reference-object/range-reference-object.js';
import { ISelectionWithStyle, SelectionManagerService } from '@univerjs/base-sheets';
import { Disposable, IRange, IUniverInstanceService, LifecycleStages, ObjectMatrix, OnLifecycle } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { IStatusBarService, IStatusBarServiceStatus } from '../services/status-bar.service';

@OnLifecycle(LifecycleStages.Ready, StatusBarController)
export class StatusBarController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @IFunctionService private readonly _functionService: IFunctionService,
        @IStatusBarService private readonly _statusBarService: IStatusBarService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._registerSelectionListener();
        this._listenStatusChange();
    }

    private _registerSelectionListener(): void {
        this._selectionManagerService.selectionInfo$.subscribe((selectionRangeWithStyle) => {
            if (selectionRangeWithStyle) {
                this._calculateSelection(selectionRangeWithStyle);
            }
        });
    }

    private _calculateSelection(selections: ISelectionWithStyle[]) {
        const unitId = this._univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const sheetId = this._univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
        const sheetData: ISheetData = {};
        this._univerInstanceService
            .getCurrentUniverSheetInstance()
            .getSheets()
            .forEach((sheet) => {
                const sheetConfig = sheet.getConfig();
                sheetData[sheet.getSheetId()] = {
                    cellData: new ObjectMatrix(sheetConfig.cellData),
                    rowCount: sheetConfig.rowCount,
                    columnCount: sheetConfig.columnCount,
                };
            });
        if (selections?.length && (selections?.length > 1 || !this._isSingleCell(selections[0].range))) {
            const refs = selections.map((s) => new RangeReferenceObject(s.range, sheetId, unitId));
            refs.forEach((ref) =>
                ref.setUnitData({
                    [unitId]: sheetData,
                })
            );

            const functions = this._statusBarService.getFunctions();
            const calcResult = functions.map((f) => {
                const executor = this._functionService.getExecutor(f);
                if (!executor) {
                    return undefined;
                }
                return {
                    func: f,
                    value: (executor?.calculate(...refs) as BaseValueObject).getValue(),
                };
            });
            if (calcResult.some((r) => r === undefined)) {
                return;
            }
            this._statusBarService.setState(calcResult as IStatusBarServiceStatus);
        } else {
            this._statusBarService.setState(null);
        }
    }

    private _listenStatusChange() {
        this._statusBarService.state$.subscribe((status) => {
            console.error(status);
        });
    }

    private _isSingleCell(range: IRange) {
        return range.startRow === range.endRow && range.startColumn === range.endColumn;
    }
}
