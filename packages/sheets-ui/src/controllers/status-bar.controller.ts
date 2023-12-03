import { BaseValueObject, FormulaEngineService, ISheetData, RangeReferenceObject } from '@univerjs/engine-formula';
import { ISelectionWithStyle, SelectionManagerService } from '@univerjs/sheets';
import { Disposable, IRange, IUniverInstanceService, LifecycleStages, ObjectMatrix, OnLifecycle } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { IStatusBarService, IStatusBarServiceStatus } from '../services/status-bar.service';

@OnLifecycle(LifecycleStages.Ready, StatusBarController)
export class StatusBarController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @Inject(FormulaEngineService) private readonly _formulaEngineService: FormulaEngineService,
        @IStatusBarService private readonly _statusBarService: IStatusBarService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._registerSelectionListener();
    }

    private _registerSelectionListener(): void {
        this._selectionManagerService.selectionInfo$.subscribe((selectionRangeWithStyle) => {
            if (selectionRangeWithStyle) {
                this._calculateSelection(selectionRangeWithStyle);
            }
        });
    }

    private _calculateSelection(selections: ISelectionWithStyle[]) {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const unitId = workbook.getUnitId();
        const sheetId = workbook.getActiveSheet().getSheetId();
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
                const executor = this._formulaEngineService.getExecutor(f);
                if (!executor) {
                    return undefined;
                }
                const res = executor?.calculate(...refs) as BaseValueObject;
                if (!res.getValue) {
                    return undefined;
                }
                return {
                    func: f,
                    value: (executor?.calculate(...refs) as BaseValueObject).getValue(),
                };
            });
            if (calcResult.every((r) => r === undefined)) {
                return;
            }
            const availableResult = calcResult.filter((r) => r !== undefined);
            this._statusBarService.setState(availableResult as IStatusBarServiceStatus);
        } else {
            this._statusBarService.setState(null);
        }
    }

    private _isSingleCell(range: IRange) {
        return range.startRow === range.endRow && range.startColumn === range.endColumn;
    }
}
