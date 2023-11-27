import {
    Direction,
    Disposable,
    ICellData,
    isFormulaString,
    LifecycleStages,
    Nullable,
    OnLifecycle,
    Tools,
} from '@univerjs/core';
import {
    APPLY_TYPE,
    AutoFillService,
    DATA_TYPE,
    IAutoFillRule,
    IAutoFillService,
    ICopyDataInTypeIndexInfo,
} from '@univerjs/ui-plugin-sheets';

@OnLifecycle(LifecycleStages.Ready, FormulaAutoFillController)
export class FormulaAutoFillController extends Disposable {
    constructor(@IAutoFillService private readonly _autoFillService: AutoFillService) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._registerAutoFill();
    }

    private _registerAutoFill(): void {
        const formulaRule: IAutoFillRule = {
            type: DATA_TYPE.FORMULA,
            priority: 1001,
            match: (cellData) => isFormulaString(cellData?.f),
            isContinue: (prev, cur) => {
                if (prev.type === DATA_TYPE.FORMULA) {
                    return true;
                }
                return false;
            },
            applyFunctions: {
                [APPLY_TYPE.COPY]: (dataWithIndex, len, direction) => {
                    const { data, index } = dataWithIndex; // TODO@Dushusir: now you have index infos when applying formula
                    return fillCopyFormula(data, len, direction, index);
                },
            },
        };
        this._autoFillService.registerRule(formulaRule);
    }
}

/**
 *  TODO@Dushusir: add step
 * @param data
 * @param len
 * @param direction
 * @returns
 */
export function fillCopyFormula(
    data: Array<Nullable<ICellData>>,
    len: number,
    direction: Direction,
    index: ICopyDataInTypeIndexInfo
) {
    const applyData = [];
    let formulaId: string = '';

    for (let i = 1; i <= len; i++) {
        const index = (i - 1) % data.length;
        const d = Tools.deepClone(data[index]);

        if (d) {
            const originalFormula = data[index]?.f;

            if (originalFormula) {
                // The first position setting formula and formulaId
                if (i === 1) {
                    const shiftedFormula = shiftFormula(originalFormula, i, direction);
                    d.si = d.si || Tools.generateRandomId(6);
                    formulaId = d.si;
                    d.f = shiftedFormula;
                    d.v = null;
                } else {
                    // At the beginning of the second formula, set formulaId only
                    d.si = formulaId;
                    d.f = null;
                    d.v = null;
                }

                if (direction === Direction.DOWN || direction === Direction.RIGHT) {
                    applyData.push(d);
                } else {
                    applyData.unshift(d);
                }
            }
        }
    }

    return applyData;
}

function shiftFormula(originalFormula: string, shift: number, direction: Direction): string {
    const tokens = tokenizeFormula(originalFormula);
    const shiftedTokens = [];

    for (const token of tokens) {
        if (isCellReference(token)) {
            const shiftedReference = shiftCellReference(token, shift, direction);
            shiftedTokens.push(shiftedReference);
        } else {
            shiftedTokens.push(token);
        }
    }

    return shiftedTokens.join('');
}

function tokenizeFormula(formula: string): string[] {
    const regex = /([A-Z]+\d+|[A-Z]+|\d+|\S)/g;
    return formula.match(regex) || [];
}

function isCellReference(token: string): boolean {
    const cellReferenceRegex = /^[A-Z]+\d+$/;
    return cellReferenceRegex.test(token);
}

function shiftCellReference(cellReference: string, shift: number, direction: Direction): string {
    const [col, row] = extractColRow(cellReference);

    let shiftedCol = col;
    let shiftedRow = row;

    if (direction === Direction.DOWN) {
        shiftedRow += shift;
    } else if (direction === Direction.RIGHT) {
        shiftedCol = shiftColumn(col, shift);
    } else if (direction === Direction.UP) {
        shiftedRow -= shift;
    } else if (direction === Direction.LEFT) {
        shiftedCol = shiftColumn(col, -shift);
    }

    return shiftedCol + shiftedRow;
}

function extractColRow(cellReference: string): [string, number] {
    const col = cellReference.replace(/\d/g, '');
    const row = parseInt(cellReference.replace(/[A-Z]+/g, ''), 10);
    return [col, row];
}

function shiftColumn(col: string, shift: number): string {
    const currentCharCode = col.charCodeAt(0);
    const shiftedCharCode = currentCharCode + shift;
    return String.fromCharCode(shiftedCharCode);
}
