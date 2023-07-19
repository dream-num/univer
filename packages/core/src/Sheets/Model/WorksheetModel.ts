import { ObjectArray } from '../../Shared/ObjectArray';
import { ObjectMatrix } from '../../Shared/ObjectMatrix';
import { IKeyType, Nullable } from '../../Shared/Types';
import { ICellData } from '../../Types/Interfaces/ICellData';
import { IColumnData } from '../../Types/Interfaces/IColumnData';
import { IRowData } from '../../Types/Interfaces/IRowData';
import { IStyleData } from '../../Types/Interfaces/IStyleData';

export class WorksheetModel {
    cell: ObjectMatrix<ICellData>;

    row: ObjectArray<IRowData>;

    column: ObjectArray<IColumnData>;

    style: IKeyType<Nullable<IStyleData>>;
}
