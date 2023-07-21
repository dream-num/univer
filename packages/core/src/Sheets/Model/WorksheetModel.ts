import { ObjectArray } from '../../Shared/ObjectArray';
import { ObjectMatrix } from '../../Shared/ObjectMatrix';
import { IKeyType, Nullable } from '../../Shared/Types';
import { ICellData } from '../../Types/Interfaces/ICellData';
import { IColumnData } from '../../Types/Interfaces/IColumnData';
import { IRangeData } from '../../Types/Interfaces/IRangeData';
import { IRowData } from '../../Types/Interfaces/IRowData';
import { IStyleData } from '../../Types/Interfaces/IStyleData';

export class WorksheetModel {
    activation: boolean;

    row: ObjectArray<IRowData>;

    column: ObjectArray<IColumnData>;

    cell: ObjectMatrix<ICellData>;

    sheetId: string;

    merge: IRangeData[];

    style: IKeyType<Nullable<IStyleData>>;
}
