import { ICellData, IStyleData } from '@univerjs/core';

export interface ITempCellData extends ICellData {
    style: IStyleData;
    prefix: string[];
}
