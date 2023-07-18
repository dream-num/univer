import { IRangeData } from '../Types/Interfaces';
import { Tools } from './Tools';

/**
 * A square area containing four position information: startRow, startColumn, endRow, and endColumn
 */
export class Rectangle implements IRangeData {
    startRow: number;

    startColumn: number;

    endRow: number;

    endColumn: number;

    constructor();
    constructor(rectangle: IRangeData);
    constructor(
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    );
    constructor(...argument: any[]) {
        if (Tools.hasLength(argument, 0)) {
            this.startRow = 0;
            this.startColumn = 0;
            this.endRow = 0;
            this.endColumn = 0;
            return;
        }
        if (Tools.hasLength(argument, 1)) {
            const rectangle = argument[0];
            this.startRow = rectangle.startRow;
            this.startColumn = rectangle.startColumn;
            this.endRow = rectangle.endRow;
            this.endColumn = rectangle.endColumn;
            return;
        }
        if (Tools.hasLength(argument, 4)) {
            const startRow = argument[0];
            const startColumn = argument[1];
            const endRow = argument[2];
            const endColumn = argument[3];
            this.startRow = startRow;
            this.startColumn = startColumn;
            this.endRow = endRow;
            this.endColumn = endColumn;
        }
    }

    static equals(src: IRangeData, target: IRangeData): boolean {
        return (
            src.endRow === target.endRow &&
            src.endColumn === target.endColumn &&
            src.startRow === target.startRow &&
            src.startColumn === target.startColumn
        );
    }

    static intersects(src: IRangeData, target: IRangeData): boolean {
        const currentStartRow = src.startRow;
        const currentEndRow = src.endRow;
        const currentStartColumn = src.startColumn;
        const currentEndColumn = src.endColumn;

        const incomingStartRow = target.startRow;
        const incomingEndRow = target.endRow;
        const incomingStartColumn = target.startColumn;
        const incomingEndColumn = target.endColumn;

        const zx = Math.abs(
            currentStartColumn +
                currentEndColumn -
                incomingStartColumn -
                incomingEndColumn
        );
        const x =
            Math.abs(currentStartColumn - currentEndColumn) +
            Math.abs(incomingStartColumn - incomingEndColumn);
        const zy = Math.abs(
            currentStartRow + currentEndRow - incomingStartRow - incomingEndRow
        );
        const y =
            Math.abs(currentStartRow - currentEndRow) +
            Math.abs(incomingStartRow - incomingEndRow);

        return zx <= x && zy <= y;
    }

    intersects(rectangle: Rectangle): boolean {
        return Rectangle.intersects(this, rectangle);
    }

    union(rectangle: Rectangle) {
        const { startRow, startColumn, endRow, endColumn } = this;
        return new Rectangle(
            rectangle.startRow < this.startRow ? rectangle.startRow : startRow,
            rectangle.startColumn < startColumn
                ? rectangle.startColumn
                : startColumn,
            rectangle.endRow > endRow ? rectangle.endRow : endRow,
            rectangle.endColumn > endColumn ? rectangle.endColumn : endColumn
        );
    }

    getData() {
        return {
            startRow: this.startRow,
            startColumn: this.startColumn,
            endRow: this.endRow,
            endColumn: this.endColumn,
        };
    }

    equals(rectangle: Rectangle) {
        return Rectangle.equals(this, rectangle);
    }
}
