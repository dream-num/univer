import { Nullable, Rectangle } from '@univer/core';
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

// import { Range } from '@univer/core';

// interface IConfig {
//     canSelect: boolean;

//     canSetCell: boolean;
//     canSetRow: boolean;
//     canSetCol: boolean;

//     canInsertRow: boolean;
//     canInsertcol: boolean;
//     canInsertLink: boolean;

//     canDeleteRow: boolean;
//     canDeleteCol: boolean;

//     canSort: boolean;
//     canFilter: boolean;
//     canReport: boolean;
// }

// export class Protection {
//     // 是否可编辑
//     private _canEdit: boolean;

//     private _password: string;

//     private _config: IConfig;

//     // 可编辑范围
//     private _editRange: Array<Range>;

//     // 禁止编辑范围
//     private _notEditRange: Array<Range>;

//     setConfig() {}

//     getConfig() {}

//     // return sheet or range
//     getProtectionType() {}
// }

// class Demo {
//     /**
//      * 将给定用户添加到受保护工作表或范围的编辑器列表中。
//      * @param  { string | User | string[]} emailAddress
//      */
//     addEditor(user: string | User | string[]) {}

//     /**
//      * 将指定的目标受众添加为受保护范围的编辑者。
//      * @param  { string } audienceId
//      */
//     addTargetAudience(audienceId: string) {}

//     /**
//      * 确定拥有电子表格的域中的所有用户是否都有权编辑受保护的范围或工作表。
//      */
//     canDomainEdit() {}

//     /**
//      * 确定用户是否有权编辑受保护的范围或工作表。
//      */
//     canEdit() {}

//     /**
//      * 获取受保护的区域或工作表的说明。
//      */
//     getDescription() {}

//     /**
//      * 获取受保护区域或工作表的编辑器列表。
//      */
//     getEditors() {}

//     /**
//      * 获取受保护区域的类型，范围或 SHEET。
//      */
//     getProtectionType() {}

//     /**
//      * 获取受保护的范围。
//      */
//     getRange() {}

//     /**
//      * 获取受保护区域的名称（如果它与命名区域相关联）。
//      */
//     getRangeName() {}

//     /**
//      * 返回可以编辑受保护范围的目标访问群体的 ID。
//      */
//     getTargetAudiences() {}

//     /**
//      * 获取受保护工作表中未受保护的范围的数组。
//      */
//     getUnprotectedRanges() {}

//     /**
//      * 确定受保护区域是否正在使用"基于警告"的保护。
//      */
//     isWarningOnly() {}

//     /**
//      * 取消保护范围或工作表。
//      */
//     remove() {}

//     /**
//      * 从受保护的工作表或范围的编辑器列表中删除给定用户。
//      * @param  { string | User  } user
//      */
//     removeEditor(user: string | User) {}

//     /**
//      *  从受保护的工作表或范围的编辑器列表中删除给定的用户数组。
//      * @param  { string[] } emailAddresses
//      */
//     removeEditors(emailAddresses: string[]) {}

//     /**
//      * 将指定的目标访问群体作为受保护范围的编辑者删除。
//      * @param  { string } audienceId
//      */
//     removeTargetAudience(audienceId: string) {}

//     /**
//      * 设置受保护的区域或工作表的说明。
//      * @param  { string } description
//      */
//     setDescription(description: string) {}

//     /**
//      * 设置拥有电子表格的域中的所有用户是否都有权编辑受保护的区域或工作表。
//      * @param  { string } editable
//      */
//     setDomainEdit(editable: string) {}

//     /**
//      * 将受保护的范围与现有的命名区域相关联。
//      * @param  { NamedRange } namedRange
//      */
//     setNamedRange(namedRange: NamedRange) {}

//     /**
//      * 调整受保护的范围。
//      * @param  { Range } range
//      */
//     setRange(range: Range) {}

//     /**
//      * 将受保护的范围与现有的命名区域相关联。
//      * @param  { string } rangeName
//      */
//     setRangeName(rangeName: string) {}

//     /**
//      * 取消保护受保护工作表中给定的范围数组。
//      * @param  { Range[] } ranges
//      */
//     setUnprotectedRanges(ranges: Range[]) {}

//     /**
//      * 设置此受保护范围是否使用"基于警告"的保护。
//      * @param  { Boolean } warningOnly
//      */
//     setWarningOnly(warningOnly: boolean) {}
// }
