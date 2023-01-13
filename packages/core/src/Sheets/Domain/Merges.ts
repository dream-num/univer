import {
    IAddMergeActionData,
    CommandManager,
    InsertRowAction,
    IRemoveMergeActionData,
    Command,
    RemoveRowAction,
    DeleteRangeAction,
    SheetActionBase,
    ISheetActionData,
} from '../../Command';
import { InsertColumnAction, RemoveColumnAction } from '../Action';
import { ACTION_NAMES } from '../../Const';
import { IRangeData } from '../../Interfaces';
import { Worksheet } from './Worksheet';
import { Nullable, Tools } from '../../Shared';
import { Rectangle } from '../../Shared/Rectangle';
import { Tuples } from '../../Shared/Tuples';

/**
 * Manage merged cells
 */
export class Merges {
    private _rectangleList: IRangeData[];

    private _worksheet: Worksheet;

    constructor(worksheet: Worksheet, mergeData: any) {
        this._worksheet = worksheet;
        this._rectangleList = mergeData;

        // TODO 1. insertRowData, insertColumnData,insertRange
        // 2. remove getCommandInjectorObservers, replace with ActionExtension
        // CommandManager.getCommandInjectorObservers().add((inject) => {
        //     let insertRowAction = inject.include(InsertRowAction);
        //     let insertColumnAction = inject.include(Insert
        //
        //
        //     ColumnAction);
        //     let deleteRowAction = inject.include(RemoveRowAction);
        //     let deleteColumnAction = inject.include(RemoveColumnAction);
        //     let deleteRangeAction = inject.include(DeleteRangeAction);
        //
        //     if (insertRowAction) {
        //         const data = insertRowAction.getDoActionData();
        //         if (data.sheetId === this._worksheet.getSheetId()) {
        //             const rectangleList = Tools.deepClone(this._rectangleList);
        //             for (let i = 0; i < rectangleList.length; i++) {
        //                 const merge = rectangleList[i];
        //                 const count = data.rowCount;
        //                 if (data.rowIndex > merge.endRow) {
        //                     continue;
        //                 } else if (
        //                     data.rowIndex >= merge.startRow &&
        //                     data.rowIndex <= merge.endRow
        //                 ) {
        //                     merge.endRow += count;
        //                 } else {
        //                     merge.startRow += count;
        //                     merge.endRow += count;
        //                 }
        //             }
        //             this.modifyMerge(this._rectangleList, rectangleList);
        //         }
        //     }
        //     if (insertColumnAction) {
        //         const data = insertColumnAction.getDoActionData();
        //         if (data.sheetId === this._worksheet.getSheetId()) {
        //             const rectangleList = Tools.deepClone(this._rectangleList);
        //             for (let i = 0; i < rectangleList.length; i++) {
        //                 const merge = rectangleList[i];
        //                 const count = data.columnCount;
        //                 if (data.columnIndex > merge.endColumn) {
        //                     continue;
        //                 } else if (
        //                     data.columnIndex >= merge.startColumn &&
        //                     data.columnIndex <= merge.endColumn
        //                 ) {
        //                     merge.endColumn += count;
        //                 } else {
        //                     merge.startColumn += count;
        //                     merge.endColumn += count;
        //                 }
        //             }
        //             this.modifyMerge(this._rectangleList, rectangleList);
        //         }
        //     }
        //     if (deleteRowAction) {
        //         const data = deleteRowAction.getDoActionData();
        //         if (data.sheetId === this._worksheet.getSheetId()) {
        //             if (data.sheetId === this._worksheet.getSheetId()) {
        //                 const rectangleList = Tools.deepClone(this._rectangleList);
        //                 for (let i = 0; i < rectangleList.length; i++) {
        //                     const merge = rectangleList[i];
        //                     const count = data.rowCount;
        //                     if (data.rowIndex > merge.endRow) {
        //                         continue;
        //                     } else if (
        //                         data.rowIndex >= merge.startRow &&
        //                         data.rowIndex <= merge.endRow
        //                     ) {
        //                         merge.endRow -= count;
        //                     } else {
        //                         merge.startRow -= count;
        //                         merge.endRow -= count;
        //                     }
        //                 }
        //                 this.modifyMerge(this._rectangleList, rectangleList);
        //             }
        //         }
        //     }
        //     if (deleteColumnAction) {
        //         const data = deleteColumnAction.getDoActionData();
        //         if (data.sheetId === this._worksheet.getSheetId()) {
        //             if (data.sheetId === this._worksheet.getSheetId()) {
        //                 const rectangleList = Tools.deepClone(this._rectangleList);
        //                 for (let i = 0; i < rectangleList.length; i++) {
        //                     const merge = rectangleList[i];
        //                     const count = data.columnCount;
        //                     if (data.columnIndex > merge.endColumn) {
        //                         continue;
        //                     } else if (
        //                         data.columnIndex >= merge.startColumn &&
        //                         data.columnIndex <= merge.endColumn
        //                     ) {
        //                         merge.endColumn -= count;
        //                     } else {
        //                         merge.startColumn -= count;
        //                         merge.endColumn -= count;
        //                     }
        //                 }
        //                 this.modifyMerge(this._rectangleList, rectangleList);
        //             }
        //         }
        //     }
        //     if (deleteRangeAction) {
        //         const data = deleteRangeAction.getDoActionData();
        //         if (data.sheetId === this._worksheet.getSheetId()) {
        //             const rectangleList = Tools.deepClone(this._rectangleList);
        //             const hasMerge = this.getByRowColumn(
        //                 data.rangeData.startRow,
        //                 data.rangeData.endRow,
        //                 data.rangeData.startColumn,
        //                 data.rangeData.endColumn
        //             );
        //             if (hasMerge) {
        //                 hasMerge.forEach((item) => {
        //                     const target = new Rectangle(item);
        //                     for (let i = 0; i < rectangleList.length; i++) {
        //                         const current = rectangleList[i];
        //                         if (target.intersects(new Rectangle(current))) {
        //                             rectangleList.splice(i, 1);
        //                         }
        //                     }
        //                 });
        //             }
        //             // 单元格上移
        //             if (data.shiftDimension) {
        //                 for (let i = 0; i < rectangleList.length; i++) {
        //                     const merge = rectangleList[i];
        //                     if (merge.endRow >= data.rangeData.startRow) {
        //                         if (merge.endColumn < data.rangeData.startColumn) {
        //                             continue;
        //                         } else if (
        //                             merge.startColumn > data.rangeData.endColumn
        //                         ) {
        //                             continue;
        //                         } else if (
        //                             merge.startColumn >=
        //                                 data.rangeData.startColumn &&
        //                             merge.endColumn <= data.rangeData.endColumn
        //                         ) {
        //                             const count =
        //                                 data.rangeData.endRow -
        //                                 data.rangeData.startRow;
        //
        //                             merge.startRow -= count;
        //                             merge.endRow -= count;
        //                         } else {
        //                             return;
        //                         }
        //                     }
        //                 }
        //             } else {
        //                 // 单元格左移
        //                 for (let i = 0; i < rectangleList.length; i++) {
        //                     const merge = rectangleList[i];
        //                     if (merge.startColumn > data.rangeData.endColumn) {
        //                         if (merge.endRow < data.rangeData.startRow) {
        //                             continue;
        //                         } else if (merge.startRow > data.rangeData.endRow) {
        //                             continue;
        //                         } else if (
        //                             merge.startRow >= data.rangeData.startRow &&
        //                             merge.endRow <= data.rangeData.endRow
        //                         ) {
        //                             const count =
        //                                 data.rangeData.endColumn -
        //                                 data.rangeData.startColumn;
        //
        //                             merge.startColumn -= count;
        //                             merge.endColumn -= count;
        //                         } else {
        //                             return;
        //                         }
        //                     }
        //                 }
        //             }
        //
        //             this.modifyMerge(this._rectangleList, rectangleList);
        //         }
        //     }
        // });

        CommandManager.getCommandObservers().add(({ actions }) => {
            if (!actions || actions.length === 0) return;
            const action = actions[0] as SheetActionBase<
                ISheetActionData,
                ISheetActionData,
                void
            >;
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
            }
            if (deleteColumnAction) {
                const data = deleteColumnAction.getDoActionData();
                if (data.sheetId === this._worksheet.getSheetId()) {
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

    remove(rectangle: IRangeData): IRangeData[] {
        const { _rectangleList } = this;
        const { length } = _rectangleList;
        const target = new Rectangle(rectangle);
        const result = [];
        const remove = [];
        for (let i = 0; i < length; i++) {
            const current = _rectangleList[i];
            if (target.intersects(new Rectangle(current))) {
                remove.push(current);
                continue;
            }
            result.push(current);
        }
        this._rectangleList.length = 0;
        for (let i = 0; i < result.length; i++) {
            this._rectangleList.push(result[i]);
        }
        return remove;
    }
    // remove(rectangle: IRangeData): Merges {
    //     const { _rectangleList } = this;
    //     const target = new Rectangle(rectangle);
    //
    //     let index = _rectangleList.findIndex((current) => {
    //         if (target.intersects(new Rectangle(current))) {
    //             return true;
    //         }
    //         return false;
    //     });
    //     if (index !== -1) {
    //         _rectangleList.splice(index, 1);
    //     }
    //     return this;
    // }

    size() {
        return this._rectangleList.length;
    }

    add(rectangle: IRangeData): IRangeData[] {
        const result = this.remove(rectangle);
        this._rectangleList.push(rectangle);
        return result;
    }
    // add(rectangle: IRangeData): Merges {
    //     const { _rectangleList } = this;
    //     const target = new Rectangle(rectangle);
    //
    //     let index = _rectangleList.findIndex((current) => {
    //         if (target.intersects(new Rectangle(current))) {
    //             return true;
    //         }
    //         return false;
    //     });
    //
    //     if (index === -1) {
    //         this._rectangleList.push(rectangle);
    //     }
    //
    //     return this;
    // }

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
        const commandManager = this._worksheet.getCommandManager();
        const context = this._worksheet.getContext();

        const removeMerge: IRemoveMergeActionData = {
            actionName: ACTION_NAMES.REMOVE_MERGE_ACTION,
            sheetId: this._worksheet.getSheetId(),
            rectangles: originMerge,
        };

        const addMerge: IAddMergeActionData = {
            actionName: ACTION_NAMES.ADD_MERGE_ACTION,
            sheetId: this._worksheet.getSheetId(),
            rectangles: currentMerge,
        };

        const command = new Command(
            {
                WorkBookUnit: context.getWorkBook(),
            },
            removeMerge,
            addMerge
        );
        commandManager.invoke(command);
    }
}
