// Api status
enum ApiCode {
    OK = 'OK',
}

interface IApiStatus {
    code: `${ApiCode}`;
    message: string;
}

// Data tree from backend
export interface IBackendResponseDataTree {
    error: IApiStatus;
    display: IDisplay;
}

export interface IDisplay {
    type: string;
    name: string;
    nodes: IDisplayNode[];
    uuid: string;
}

export interface IDisplayNode {
    name: string;
    child: IDisplayNode[];
    views: IDisplayView[];
}

export interface IDisplayView {
    viewID: string;
    name: string;
}

// Data tree for UI
export interface IDataTree {
    id: string;
    name: string;
    children: IDataTree[];
}

// Data source from backend
export interface IBackendResponseDataForm {
    error: IApiStatus;
    nextCursor?: string;
    dataformID?: string;
    columns: string[];
    celldatas: IDataFormCellData[];
}

interface IDataFormCellData {
    rowNumber: number;
    cells: Record<string, ICell>;
}

enum CellType {
    STRING = 'STRING',
    NUMBER = 'NUMBER',
}

interface ICell {
    v: ICellValue;
    t: `${CellType}`;
}

interface ICellValue {
    strV?: string;
    numV?: number;
}
