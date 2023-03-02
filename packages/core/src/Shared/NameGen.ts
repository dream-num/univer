const include: string[] = [];
let identity: number = 0;

/**
 * Generate unique sheet name
 * TODO... 添加到 context 上
 */
export class NameGen {
    static getSheetName(name?: string): string {
        if (name === undefined) {
            name = NameGen._generateName();
        }
        while (NameGen._checkedName(name)) {
            name = NameGen._generateName();
        }
        return name;
    }

    private static _generateName(): string {
        return `sheet${++identity}`;
    }

    private static _checkedName(name: string): boolean {
        const checked = include.includes(name);
        if (!checked) {
            include.push(name);
        }
        return checked;
    }
}

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
