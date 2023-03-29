import {
    CommandManager,
    Command,
    SheetActionBase,
    ISheetActionData,
} from '../../Command';
import {
    DeleteRangeAction,
    IAddMergeActionData,
    InsertColumnAction,
    InsertRowAction,
    RemoveRowAction,
    IRemoveMergeActionData,
    RemoveMergeAction,
    RemoveColumnAction,
    AddMergeAction,
} from '../Action';
import { Nullable, Tools, Rectangle, Tuples } from '../../Shared';
import { Worksheet } from './Worksheet';
import { IRangeData } from '../../Interfaces';

/**
 * Manage merged cells
 */
export class Merges {
    private _rectangleList: IRangeData[];

    private _worksheet: Worksheet;

    constructor(worksheet: Worksheet, mergeData: any) {
        this._worksheet = worksheet;
        this._rectangleList = mergeData;
        CommandManager.getCommandObservers().add(({ actions }) => {
            if (!actions || actions.length === 0) return;

            const action = actions[0] as SheetActionBase<
                ISheetActionData,
                ISheetActionData,
                void
            >;

            // TODO not use try catch
            try {
                action.getWorkBook();
            } catch (error) {
                return;
            }
            const currentUnitId = worksheet.getContext().getWorkBook().getUnitId();
            const actionUnitId = action.getWorkBook().getUnitId();
            if (currentUnitId !== actionUnitId) return;

            let insertRowAction = actions.find(
                (action) => action instanceof InsertRowAction
            ) as InsertRowAction;
            let insertColumnAction = actions.find(
                (action) => action instanceof InsertColumnAction
            ) as InsertColumnAction;
            let deleteRowAction = actions.find(
                (action) => action instanceof RemoveRowAction
            ) as RemoveRowAction;
            let deleteColumnAction = actions.find(
                (action) => action instanceof RemoveColumnAction
            ) as RemoveColumnAction;
            let deleteRangeAction = actions.find(
                (action) => action instanceof DeleteRangeAction
            ) as DeleteRangeAction;

            if (insertRowAction) {
                const data = insertRowAction.getDoActionData();
                if (data.sheetId === this._worksheet.getSheetId()) {
                    const rectangleList = Tools.deepClone(this._rectangleList);
                    for (let i = 0; i < rectangleList.length; i++) {
                        const merge = rectangleList[i];
                        const count = data.rowCount;
                        if (data.rowIndex > merge.endRow) {
                            continue;
                        } else if (
                            data.rowIndex >= merge.startRow &&
                            data.rowIndex <= merge.endRow
                        ) {
                            merge.endRow += count;
                        } else {
                            merge.startRow += count;
                            merge.endRow += count;
                        }
                    }
                    this.modifyMerge(this._rectangleList, rectangleList);
                }
            }
            if (insertColumnAction) {
                const data = insertColumnAction.getDoActionData();
                if (data.sheetId === this._worksheet.getSheetId()) {
                    const rectangleList = Tools.deepClone(this._rectangleList);
                    for (let i = 0; i < rectangleList.length; i++) {
                        const merge = rectangleList[i];
                        const count = data.columnCount;
                        if (data.columnIndex > merge.endColumn) {
                            continue;
                        } else if (
                            data.columnIndex >= merge.startColumn &&
                            data.columnIndex <= merge.endColumn
                        ) {
                            merge.endColumn += count;
                        } else {
                            merge.startColumn += count;
                            merge.endColumn += count;
                        }
                    }
                    this.modifyMerge(this._rectangleList, rectangleList);
                }
            }
            if (deleteRowAction) {
                const data = deleteRowAction.getDoActionData();
                if (data.sheetId === this._worksheet.getSheetId()) {
                    const rectangleList = Tools.deepClone(this._rectangleList);
                    for (let i = 0; i < rectangleList.length; i++) {
                        const merge = rectangleList[i];
                        const count = data.rowCount;
                        if (data.rowIndex > merge.endRow) {
                            continue;
                        } else if (
                            data.rowIndex >= merge.startRow &&
                            data.rowIndex <= merge.endRow
                        ) {
                            merge.endRow -= count;
                        } else {
                            merge.startRow -= count;
                            merge.endRow -= count;
                        }
                    }
                    this.modifyMerge(this._rectangleList, rectangleList);
                }
            }
            if (deleteColumnAction) {
                const data = deleteColumnAction.getDoActionData();
                if (data.sheetId === this._worksheet.getSheetId()) {
                    const rectangleList = Tools.deepClone(this._rectangleList);
                    for (let i = 0; i < rectangleList.length; i++) {
                        const merge = rectangleList[i];
                        const count = data.columnCount;
                        if (data.columnIndex > merge.endColumn) {
                            continue;
                        } else if (
                            data.columnIndex >= merge.startColumn &&
                            data.columnIndex <= merge.endColumn
                        ) {
                            merge.endColumn -= count;
                        } else {
                            merge.startColumn -= count;
                            merge.endColumn -= count;
                        }
                    }
                    this.modifyMerge(this._rectangleList, rectangleList);
                }
            }
            if (deleteRangeAction) {
                const data = deleteRangeAction.getDoActionData();
                if (data.sheetId === this._worksheet.getSheetId()) {
                    const rectangleList = Tools.deepClone(this._rectangleList);
                    const hasMerge = this.getByRowColumn(
                        data.rangeData.startRow,
                        data.rangeData.endRow,
                        data.rangeData.startColumn,
                        data.rangeData.endColumn
                    );
                    if (hasMerge) {
                        hasMerge.forEach((item) => {
                            const target = new Rectangle(item);
                            for (let i = 0; i < rectangleList.length; i++) {
                                const current = rectangleList[i];
                                if (target.intersects(new Rectangle(current))) {
                                    rectangleList.splice(i, 1);
                                }
                            }
                        });
                    }
                    // 单元格上移
                    if (data.shiftDimension) {
                        for (let i = 0; i < rectangleList.length; i++) {
                            const merge = rectangleList[i];
                            if (merge.endRow >= data.rangeData.startRow) {
                                if (merge.endColumn < data.rangeData.startColumn) {
                                    continue;
                                } else if (
                                    merge.startColumn > data.rangeData.endColumn
                                ) {
                                    continue;
                                } else if (
                                    merge.startColumn >=
                                        data.rangeData.startColumn &&
                                    merge.endColumn <= data.rangeData.endColumn
                                ) {
                                    const count =
                                        data.rangeData.endRow -
                                        data.rangeData.startRow;

                                    merge.startRow -= count;
                                    merge.endRow -= count;
                                } else {
                                    return;
                                }
                            }
                        }
                    } else {
                        // 单元格左移
                        for (let i = 0; i < rectangleList.length; i++) {
                            const merge = rectangleList[i];
                            if (merge.startColumn > data.rangeData.endColumn) {
                                if (merge.endRow < data.rangeData.startRow) {
                                    continue;
                                } else if (merge.startRow > data.rangeData.endRow) {
                                    continue;
                                } else if (
                                    merge.startRow >= data.rangeData.startRow &&
                                    merge.endRow <= data.rangeData.endRow
                                ) {
                                    const count =
                                        data.rangeData.endColumn -
                                        data.rangeData.startColumn;

                                    merge.startColumn -= count;
                                    merge.endColumn -= count;
                                } else {
                                    return;
                                }
                            }
                        }
                    }

                    this.modifyMerge(this._rectangleList, rectangleList);
                }
            }
        });
    }

    getMergeData(): IRangeData[] {
        return this._rectangleList;
    }

    getByRowColumn(
        startRow: number,
        endRow: number,
        startColumn: number,
        endColumn: number
    ): Nullable<IRangeData[]>;
    getByRowColumn(row: number, column: number): Nullable<IRangeData[]>;
    getByRowColumn(...argument: any): Nullable<IRangeData[]> {
        const { _rectangleList } = this;
        let target: Rectangle;
        if (
            Tuples.checkup(
                argument,
                Tuples.NUMBER_TYPE,
                Tuples.NUMBER_TYPE,
                Tuples.NUMBER_TYPE,
                Tuples.NUMBER_TYPE
            )
        ) {
            target = new Rectangle(
                argument[0],
                argument[2],
                argument[1],
                argument[3]
            );
        } else if (
            Tuples.checkup(argument, Tuples.NUMBER_TYPE, Tuples.NUMBER_TYPE)
        ) {
            target = new Rectangle(
                argument[0],
                argument[1],
                argument[0],
                argument[1]
            );
        }
        const rectList = [];
        for (let i = 0; i < _rectangleList.length; i++) {
            const rectangle = _rectangleList[i];
            if (target!.intersects(new Rectangle(rectangle))) {
                // return rectangle;
                rectList.push(rectangle);
            }
        }

        return rectList.length ? rectList : null;
    }

    remove(rectangle: IRangeData): void {
        let commandManager = this._worksheet.getCommandManager();
        let context = this._worksheet.getContext();
        let removeAction: IRemoveMergeActionData = {
            actionName: RemoveMergeAction.NAME,
            sheetId: this._worksheet.getSheetId(),
            rectangles: [rectangle],
        };

        let command = new Command(
            {
                WorkBookUnit: context.getWorkBook(),
            },
            removeAction
        );
        commandManager.invoke(command);
    }

    size() {
        return this._rectangleList.length;
    }

    add(rectangle: IRangeData): void {
        let commandManager = this._worksheet.getCommandManager();
        let context = this._worksheet.getContext();
        let removeAction: IRemoveMergeActionData = {
            actionName: RemoveMergeAction.NAME,
            sheetId: this._worksheet.getSheetId(),
            rectangles: [rectangle],
        };
        let appendAction: IAddMergeActionData = {
            actionName: AddMergeAction.NAME,
            sheetId: this._worksheet.getSheetId(),
            rectangles: [rectangle],
        };
        let command = new Command(
            {
                WorkBookUnit: context.getWorkBook(),
            },
            removeAction,
            appendAction
        );
        commandManager.invoke(command);
    }

    union(rectangle: IRangeData): IRangeData {
        const { _rectangleList } = this;
        const { length } = _rectangleList;
        let target = new Rectangle(rectangle);
        for (let i = 0; i < length; i++) {
            const element = _rectangleList[i];
            target = target.union(new Rectangle(element));
        }
        return target.getData();
    }

    getMergedRanges(rectangle: IRangeData): IRangeData[] {
        const { _rectangleList } = this;
        const { length } = _rectangleList;
        const result = [];
        for (let i = 0; i < length; i++) {
            const item = _rectangleList[i];
            const target = new Rectangle(rectangle);
            if (target.intersects(new Rectangle(item))) {
                result.push(item);
            }
        }
        return result;
    }

    modifyMerge(originMerge: IRangeData[], currentMerge: IRangeData[]) {
        let commandManager = this._worksheet.getCommandManager();
        let context = this._worksheet.getContext();
        let removeAction: IRemoveMergeActionData = {
            actionName: RemoveMergeAction.NAME,
            sheetId: this._worksheet.getSheetId(),
            rectangles: [...originMerge],
        };
        let appendAction: IAddMergeActionData = {
            actionName: AddMergeAction.NAME,
            sheetId: this._worksheet.getSheetId(),
            rectangles: [...currentMerge],
        };
        let command = new Command(
            {
                WorkBookUnit: context.getWorkBook(),
            },
            removeAction,
            appendAction
        );
        commandManager.invoke(command);
    }
}
