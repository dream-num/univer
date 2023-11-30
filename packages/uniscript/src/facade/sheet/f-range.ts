import type { ISetStyleCommandParams } from '@univerjs/base-sheets';
import { SetStyleCommand } from '@univerjs/base-sheets';
import type { ICellV, IColorStyle, IRange, Workbook, Worksheet } from '@univerjs/core';
import { ICommandService } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

export class FRange {
    constructor(
        private readonly _workbook: Workbook,
        private readonly _worksheet: Worksheet,
        private readonly _range: IRange,
        @Inject(Injector) private readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService
    ) {}

    getRow(): number {
        return this._range.startRow;
    }

    getColumn(): number {
        return this._range.startColumn;
    }

    getWidth(): number {
        return this._range.endColumn - this._range.startColumn + 1;
    }

    getHeight(): number {
        return this._range.endRow - this._range.startRow + 1;
    }

    getValue(): ICellV | null {
        return this._worksheet.getCell(this._range.startRow, this._range.startColumn)?.v ?? null;
    }

    setBackgroundColor(color: string): void {
        this._commandService.executeCommand(SetStyleCommand.id, {
            workbookId: this._workbook.getUnitId(),
            worksheetId: this._worksheet.getSheetId(),
            range: this._range,
            style: {
                type: 'bg',
                value: {
                    rgb: color,
                },
            },
        } as ISetStyleCommandParams<IColorStyle>);
    }
}
