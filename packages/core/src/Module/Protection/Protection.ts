import { Nullable, Rectangle } from '../../Shared';
import { Allowed } from './Allowed';
import { AllowedList } from './AllowedList';
import { UnlockList } from './UnlockList';

export class Protection {
    protected _unlockList: UnlockList;

    protected _allowedList: AllowedList;

    protected _useColumnFormat: boolean;

    protected _useRowFormat: boolean;

    protected _useInsertRow: boolean;

    protected _useInsertColumn: boolean;

    protected _useRemoveRow: boolean;

    protected _useRemoveColumn: boolean;

    protected _useCellFormat: boolean;

    protected _useSort: boolean;

    protected _useFilter: boolean;

    protected _useSelectLockCell: boolean;

    protected _useSelectUnlockCell: boolean;

    protected _enable: boolean;

    protected _password: string;

    constructor() {
        this._unlockList = new UnlockList();
        this._allowedList = new AllowedList();
    }

    isEnable(): boolean {
        return this._enable;
    }

    isLockCell(row: number, column: number): Nullable<Rectangle> {
        return this._unlockList.isLockCell(row, column);
    }

    isAllowCell(row: number, column: number): Nullable<Allowed> {
        return this._allowedList.isLockCell(row, column);
    }

    getUseCellFormat(): boolean {
        return this._useCellFormat;
    }

    getUseSort(): boolean {
        return this._useSort;
    }

    getUseFilter(): boolean {
        return this._useRemoveColumn;
    }

    getUseSelectLockCell(): boolean {
        return this._useSelectLockCell;
    }

    getUseSelectUnlockCell(): boolean {
        return this._useSelectUnlockCell;
    }

    getUseColumnFormat(): boolean {
        return this._useCellFormat;
    }

    getUseRowFormat(): boolean {
        return this._useCellFormat;
    }

    getUseInsertRow(): boolean {
        return this._useCellFormat;
    }

    getUseInsertColumn(): boolean {
        return this._useInsertColumn;
    }

    getEnable(): boolean {
        return this._enable;
    }

    getUseRemoveRow(): boolean {
        return this._useRemoveRow;
    }

    getPassword(): string {
        return this._password;
    }

    getAllowedList(): AllowedList {
        return this._allowedList;
    }

    getUnlockList(): UnlockList {
        return this._unlockList;
    }

    getUseRemoveColumn(): boolean {
        return this._useRemoveColumn;
    }

    setUseSort(): boolean {
        return this._useSort;
    }

    setUseFilter(): boolean {
        return this._useRemoveColumn;
    }

    setUseCellFormat(): boolean {
        return this._useCellFormat;
    }

    setEnable(enable: boolean): void {
        this._enable = enable;
    }

    setUseSelectLockCell(value: boolean): void {
        this._useSelectLockCell = value;
    }

    setUseSelectUnlockCell(value: boolean): void {
        this._useSelectUnlockCell = value;
    }

    setUseColumnFormat(value: boolean): void {
        this._useCellFormat = value;
    }

    setPassword(password: string): void {
        this._password = password;
    }

    setUseRowFormat(value: boolean): void {
        this._useCellFormat = value;
    }

    setUseInsertRow(value: boolean): void {
        this._useCellFormat = value;
    }

    setUseInsertColumn(value: boolean): void {
        this._useInsertColumn = value;
    }

    setUseRemoveRow(value: boolean): void {
        this._useRemoveRow = value;
    }

    setUseRemoveColumn(value: boolean): void {
        this._useRemoveColumn = value;
    }
}
