export interface IRowColIter {
    forEach(cb: (row: number, col: number) => void): void;
}

export function createRowColIter(rowStart: number, rowEnd: number, colStart: number, colEnd: number): IRowColIter {
    return {
        forEach(cb) {
            for (let r = rowStart; r <= rowEnd; r++) {
                for (let c = colStart; c <= colEnd; c++) {
                    cb(r, c);
                }
            }
        },
    };
}
