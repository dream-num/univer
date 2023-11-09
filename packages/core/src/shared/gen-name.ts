export class GenName {
    private _include: string[];

    private _count: number;

    constructor() {
        this._include = [];
        this._count = 1;
    }

    checked(name: string): boolean {
        return this._include.includes(name);
    }

    onlyName(name: string): string {
        let output = name;
        let count = 1;
        while (this.checked(output)) {
            output = name + count;
            count++;
        }
        this._include.push(output);
        return output;
    }

    sheetName(name: string = 'sheet1'): string {
        let output = name;
        while (this.checked(output)) {
            output = `sheet${this._count}`;
            this._count++;
        }
        this._include.push(output);
        return output;
    }
}
