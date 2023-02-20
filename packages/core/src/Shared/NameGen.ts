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
