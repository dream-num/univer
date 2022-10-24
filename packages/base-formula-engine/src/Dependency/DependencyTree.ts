import { IGridRange } from '@univer/core';
import { IFormulaData } from '../Basics/Common';

export class FormulaDependencyTree implements IFormulaData {
    children: IFormulaData[];
    parent: IFormulaData;
    isVisited = false;

    formula: string;
    row: number;
    column: number;
    sheetId: string;

    rangeList: IGridRange[];

    pushChildren(data: IFormulaData) {
        this.children.push(data);
    }

    pushRangeList(range: IGridRange) {
        this.rangeList.push(range);
    }
}
