import { BooleanNumber, SheetTypes } from '../Enum';
import { ObjectArrayType } from '../../Shared/ObjectArray';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { ICellData } from './ICellData';
import { IColumnData } from './IColumnData';
import { IRangeData, IRangeType } from './IRangeData';
import { IRowData } from './IRowData';
import { IKeyValue } from '../../Shared/Types';

export interface IWorksheet {}
// type MetaData = {
//     metadataId?: string;
//     metadataKey: string;
//     metadataValue?: string;
//     visibility?: DeveloperMetadataVisibility;
// };

/**
 * Properties of a worksheet's configuration
 *
 * TODO: 考虑将非通用配置，抽离到插件
 *
 * 比如 showGridlines 是sheet特有的，而如果实现如普通表格，就不需要 showGridlines
 */
export interface IWorksheetConfig {
    type: SheetTypes;
    id: string;
    name: string;
    tabColor: string;

    /**
     * Determine whether the sheet is hidden
     *
     * @remarks
     * See {@link BooleanNumber| the BooleanNumber enum} for more details.
     *
     * @defaultValue `BooleanNumber.FALSE`
     */
    hidden: BooleanNumber;
    freezeRow: number;
    freezeColumn: number;
    rowCount: number;
    columnCount: number;
    zoomRatio: number;
    scrollTop: number;
    scrollLeft: number;
    defaultColumnWidth: number;
    defaultRowHeight: number;
    mergeData: IRangeData[];
    hideRow: [];
    hideColumn: [];
    status: BooleanNumber;
    cellData: ObjectMatrixPrimitiveType<ICellData>;
    rowData: ObjectArrayType<Partial<IRowData>>; // TODO:配置文件不能为ObjectArray实例，应该是纯json配置 @jerry
    columnData: ObjectArrayType<Partial<IColumnData>>;
    showGridlines: BooleanNumber;
    rowTitle: {
        width: number;
        hidden?: BooleanNumber;
    };
    columnTitle: {
        height: number;
        hidden?: BooleanNumber;
    };
    selections: IRangeType[];
    rightToLeft: BooleanNumber;
    // metaData: MetaData[];
    pluginMeta: IKeyValue;
}
