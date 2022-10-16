import { Context, Plugin } from '@univer/core';
import { NumfmtController } from './Controller/NumfmtController';

export class NumfmtPlugin extends Plugin {
    protected _controller: NumfmtController;

    onMounted(ctx: Context): void {
        this._controller = new NumfmtController();
    }

    getValue(row: number, column: number): string {
        return this._controller.getValue(row, column);
    }

    getColor(row: number, column: number): string {
        return this._controller.getColor(row, column);
    }

    setNumfmt(row: number, column: number, numfmt: string): void {
        this._controller.setNumfmt(row, column, numfmt);
    }
}
