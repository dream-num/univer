export class InfoBarModel {
    private _sheetName: string;

    get sheetName(): string {
        return this._sheetName;
    }

    setSheetName(name: string) {
        this._sheetName = name;
    }
}
