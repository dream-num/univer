export class SheetBarModel {
    private _sheetList: any;

    get sheetList(): any {
        return this._sheetList;
    }

    setSheetName(list: any) {
        this._sheetList = list;
    }
}
