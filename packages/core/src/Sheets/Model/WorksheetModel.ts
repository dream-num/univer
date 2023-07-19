import { IKeyType, Nullable, ObjectArray, ObjectMatrix } from '../../Shared';
import { ICellData, IColumnData, IRowData, IStyleData } from '../../Interfaces';

export class WorksheetModel {
    cell: ObjectMatrix<ICellData>;

    row: ObjectArray<IRowData>;

    column: ObjectArray<IColumnData>;

    style: IKeyType<Nullable<IStyleData>>;
}
