import { Column } from './Column';
import { Row } from './Row';
import { Merge } from './Merge';
import { Range } from './Range';

export class Spreadsheet {
    private range: Range;

    private merge: Merge;

    private row: Row;

    private column: Column;

    constructor() {
        this.range = new Range();
        this.merge = new Merge();
        this.row = new Row();
        this.column = new Column();
    }

    insertSheet(): string;
    insertSheet(index: number): string;
    insertSheet(...parameter: any[]): string {
        switch (parameter.length) {
            case 0: {
                return String();
            }
            case 1: {
                return String();
            }
        }
        throw new Error('overload method error');
    }

    getSheetSize(): number {
        return 0;
    }

    getActiveSheetIndex(): number {
        return 0;
    }

    getActiveSheet(): number {
        return 0;
    }

    setActiveSheet(sheetId: string): void {}

    removeSheetById(sheetId: string): void {}
}
