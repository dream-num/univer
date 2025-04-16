/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export function calculateFactorial(n: number, step: number = 1): number {
    let _n = Math.floor(n);

    if (n < 0) {
        return Number.NaN;
    }

    let result = 1;

    while (_n > 1 && Number.isFinite(result)) {
        result *= _n;
        _n -= step;
    }

    return result;
}

export function calculateCombin(n: number, k: number): number {
    const t = Math.min(n - k, k);

    let result = 1;

    for (let i = 1; i <= t; i++) {
        if (!Number.isFinite(result)) {
            break;
        }

        result *= n - i + 1;
        result /= i;
    }

    return result;
}

export function calculateGcd(a: number, b: number): number {
    let _a = Math.floor(a);
    let _b = Math.floor(b);

    while (_b !== 0) {
        const t = _b;
        _b = _a % _b;
        _a = t;
    }

    return _a;
}

export function calculateLcm(a: number, b: number): number {
    const den = calculateGcd(a, b);

    if (den === 0) {
        return 0;
    }

    return Math.abs(a * b) / den;
}

export function calculateMdeterm(matrix: number[][]): number {
    const n = matrix.length;

    if (n === 1) {
        return matrix[0][0];
    }

    if (n === 2) {
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    }

    const { rowSwap, smallPivotDetected, luMatrix, permutation } = performLUDecomposition(matrix);

    if (smallPivotDetected) {
        return 0; // Matrix is irreversible
    }

    let det = rowSwap ? 1 : -1;

    for (let i = 0; i < permutation.length; i++) {
        det *= luMatrix[i][i];
    }

    return det === 0 ? 0 : det; // deal with -0 case
}

export function calculateMinverse(matrix: number[][]): number[][] | null {
    const det = calculateMdeterm(matrix);

    if (det === 0) {
        return null; // Matrix is irreversible
    }

    if (matrix.length === 1) {
        return [[1 / det]];
    }

    const adjugate = adjoint(matrix);
    const inverseMatrix = adjugate.map((row) => row.map((value) => value / det));

    return inverseMatrix;
}

function minor(matrix: number[][], row: number, col: number): number[][] {
    return matrix
        .filter((_, r) => r !== row)
        .map((row) => row.filter((_, c) => c !== col));
}

function adjoint(matrix: number[][]): number[][] {
    const n = matrix.length;
    const adj = Array.from({ length: n }, () => new Array(n).fill(0));

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const sign = ((i + j) % 2 === 0 ? 1 : -1);
            const res = sign * calculateMdeterm(minor(matrix, i, j));
            adj[j][i] = (res === 0 ? 0 : res); // deal with -0 case
        }
    }

    return adj;
}

export function calculateMmult(matrix1: number[][], matrix2: number[][]): number[][] {
    return matrix1.map((row) => matrix2[0].map((_, colIndex) =>
        row.reduce((sum, element, rowIndex) => sum + element * matrix2[rowIndex][colIndex], 0)
    ));
}

export function matrixTranspose(matrix: number[][]): number[][] {
    return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
}

export function inverseMatrixByLUD(matrix: number[][]) {
    const { smallPivotDetected, luMatrix, permutation } = performLUDecomposition(matrix);

    if (smallPivotDetected) {
        return null;
    }

    return transformMatrix(luMatrix, permutation);
}

function performLUDecomposition(matrix: number[][]) {
    const decomposedMatrix = matrixTranspose(matrix);
    const numRows = decomposedMatrix.length;
    const numCols = decomposedMatrix[0].length;
    let isRowSwap = true;
    let smallPivotDetected = false;
    const luMatrix = createMatrix(numRows, numCols, 0);
    const permutation = new Array(numCols).fill(0).map((_, index) => index);

    for (let c = 0; c < numCols; c++) {
        for (let i = 0; i < c; i++) {
            let value = decomposedMatrix[i][c];

            for (let k = 0; k < i; k++) {
                value -= luMatrix[i][k] * luMatrix[k][c];
            }

            luMatrix[i][c] = value;
        }

        let maxPivot = -Infinity;
        let pivotRow = c;

        for (let r = c; r < numRows; r++) {
            let value = decomposedMatrix[r][c];

            for (let k = 0; k < c; k++) {
                value -= luMatrix[r][k] * luMatrix[k][c];
            }

            luMatrix[r][c] = value;

            const absValue = Math.abs(value);

            if (absValue > maxPivot) {
                maxPivot = absValue;
                pivotRow = r;
            }
        }

        if (Math.abs(luMatrix[pivotRow][c]) < 1e-11) {
            smallPivotDetected = true;
            break;
        }

        if (pivotRow !== c) {
            [luMatrix[c], luMatrix[pivotRow]] = [luMatrix[pivotRow], luMatrix[c]];
            [decomposedMatrix[c], decomposedMatrix[pivotRow]] = [decomposedMatrix[pivotRow], decomposedMatrix[c]];
            [permutation[c], permutation[pivotRow]] = [permutation[pivotRow], permutation[c]];
            isRowSwap = !isRowSwap;
        }

        const pivotElement = luMatrix[c][c];

        for (let r = c + 1; r < numRows; r++) {
            luMatrix[r][c] /= pivotElement;
        }
    }

    return {
        rowSwap: isRowSwap,
        smallPivotDetected,
        luMatrix,
        permutation,
    };
}

function transformMatrix(inputMatrix: number[][], indices: number[]): number[][] {
    const size = indices.length;
    const identityMatrix = createMatrix(size, size, 0);

    for (let i = 0; i < size; i++) {
        identityMatrix[i][i] = 1;
    }

    const resultMatrix = createMatrix(size, size, 0);

    for (let rowIndex = 0; rowIndex < size; rowIndex++) {
        const index = indices[rowIndex];
        for (let colIndex = 0; colIndex < size; colIndex++) {
            resultMatrix[rowIndex][colIndex] = identityMatrix[index][colIndex];
        }
    }

    for (let pivot = 0; pivot < size; pivot++) {
        const currentRow = resultMatrix[pivot];

        for (let row = pivot + 1; row < size; row++) {
            const factor = inputMatrix[row][pivot];

            for (let column = 0; column < size; column++) {
                resultMatrix[row][column] -= currentRow[column] * factor;
            }
        }
    }

    for (let row = size - 1; row >= 0; row--) {
        const currentRow = resultMatrix[row];
        const pivotElement = inputMatrix[row][row];

        for (let column = 0; column < size; column++) {
            currentRow[column] /= pivotElement;
        }

        for (let upperRow = 0; upperRow < row; upperRow++) {
            const upperFactor = inputMatrix[upperRow][row];

            for (let upperCol = 0; upperCol < size; upperCol++) {
                resultMatrix[upperRow][upperCol] -= currentRow[upperCol] * upperFactor;
            }
        }
    }

    return resultMatrix;
}

function createMatrix(rows: number, cols: number, initialValue: number): number[][] {
    const matrix: number[][] = [];

    for (let r = 0; r < rows; r++) {
        matrix[r] = [];

        for (let c = 0; c < cols; c++) {
            matrix[r].push(initialValue);
        }
    }

    return matrix;
}

export function inverseMatrixByUSV(matrix: number[][]): number[][] | null {
    const matrixUSV = getMatrixUSV(matrix);

    if (!matrixUSV) {
        return null;
    }

    const { matrixU, matrixS, matrixV } = matrixUSV;

    const matrixUT = matrixTranspose(matrixU);
    const newMatrix = Array.from({ length: matrixS.length }, () => new Array(matrix[0].length).fill(0));
    const EPSILON = Math.max(matrix.length, matrix[0].length) * Number.EPSILON * matrixS[0];

    for (let i = 0; i < matrixS.length; i++) {
        if (Math.abs(matrixS[i]) > EPSILON) {
            newMatrix[i][i] = 1 / matrixS[i];
        }
    }

    return calculateMmult(matrixV, calculateMmult(newMatrix, matrixUT));
}

// eslint-disable-next-line
function getMatrixUSV(matrix: number[][]) {
    const matrixU = matrixTranspose(matrix);
    const m = matrixU.length;
    const n = matrixU[0].length;

    if (m < n) {
        return null;
    }

    const matrixF = new Array(n).fill(0);
    const matrixS = new Array(n).fill(0);
    const matrixV = Array.from({ length: n }, () => new Array(n).fill(0));

    let EPSILON = Number.EPSILON;
    let sqrt = 0;
    let msp = 0;
    let maxCoeffecient = 0;

    for (let i = 0; i < n; i++) {
        matrixF[i] = sqrt;
        msp = getMatrixSumProductOfRows(matrixU, i, m, i, i);

        if (msp <= 1e-64 / EPSILON) {
            sqrt = 0;
        } else {
            sqrt = Math.sqrt(msp);

            if (matrixU[i][i] >= 0) {
                sqrt = -sqrt;
            }

            const temp = matrixU[i][i] * sqrt - msp;
            matrixU[i][i] -= sqrt;

            for (let j = i + 1; j < n; j++) {
                msp = getMatrixSumProductOfRows(matrixU, i, m, i, j);

                for (let k = i; k < m; k++) {
                    matrixU[k][j] += msp / temp * matrixU[k][i];
                }
            }
        }

        matrixS[i] = sqrt;

        msp = getMatrixSumProductOfCols(matrixU, i + 1, n, i, i);

        if (msp <= 1e-64 / EPSILON) {
            sqrt = 0;
        } else {
            sqrt = Math.sqrt(msp);

            if (matrixU[i][i + 1] >= 0) {
                sqrt = -sqrt;
            }

            const temp = matrixU[i][i + 1] * sqrt - msp;
            matrixU[i][i + 1] -= sqrt;

            for (let j = i + 1; j < n; j++) {
                matrixF[j] = matrixU[i][j] / temp;
            }

            for (let j = i + 1; j < m; j++) {
                msp = getMatrixSumProductOfCols(matrixU, i + 1, n, j, i);

                for (let k = i + 1; k < n; k++) {
                    matrixU[j][k] += msp * matrixF[k];
                }
            }
        }

        const coefficient = Math.abs(matrixS[i]) + Math.abs(matrixF[i]);

        if (coefficient > maxCoeffecient) {
            maxCoeffecient = coefficient;
        }
    }

    let o = 0;

    for (let i = n - 1; i >= 0; i--) {
        if (sqrt !== 0) {
            for (let j = o; j < n; j++) {
                matrixV[j][i] = matrixU[i][j] / (sqrt * matrixU[i][i + 1]);
            }

            for (let j = o; j < n; j++) {
                msp = 0;

                for (let k = o; k < n; k++) {
                    msp += matrixU[i][k] * matrixV[k][j];
                }

                for (let k = o; k < n; k++) {
                    matrixV[k][j] += msp * matrixV[k][i];
                }
            }
        }

        for (let j = o; j < n; j++) {
            matrixV[i][j] = 0;
            matrixV[j][i] = 0;
        }

        matrixV[i][i] = 1;
        sqrt = matrixF[i];
        o = i;
    }

    for (let i = n - 1; i >= 0; i--) {
        sqrt = matrixS[i];

        for (let j = i + 1; j < n; j++) {
            matrixU[i][j] = 0;
        }

        if (sqrt !== 0) {
            for (let j = i + 1; j < n; j++) {
                msp = getMatrixSumProductOfRows(matrixU, i + 1, m, i, j);

                for (let k = i; k < m; k++) {
                    matrixU[k][j] += msp / (matrixU[i][i] * sqrt) * matrixU[k][i];
                }
            }

            for (let j = i; j < m; j++) {
                matrixU[j][i] /= sqrt;
            }
        } else {
            for (let j = i; j < m; j++) {
                matrixU[j][i] = 0;
            }
        }

        matrixU[i][i] += 1;
    }

    EPSILON *= maxCoeffecient;

    let a = 0;
    let b = 0;
    let ratio = 0;

    for (let i = n - 1; i >= 0; i--) {
        for (let S = 0; S < 50; S++) {
            let isNeedHandle = false;
            let index = i;

            for (; index >= 0; index--) {
                if (Math.abs(matrixF[index]) <= EPSILON) {
                    isNeedHandle = true;
                    break;
                }

                if (Math.abs(matrixS[index - 1]) <= EPSILON) {
                    break;
                }
            }

            if (!isNeedHandle) {
                let temp1 = 0;
                let temp2 = 1;

                for (let j = index; j < i + 1; j++) {
                    a = temp2 * matrixF[j];
                    b = matrixS[j];
                    matrixF[j] *= temp1;

                    if (Math.abs(a) <= EPSILON) {
                        break;
                    }

                    ratio = computeHypotenuse(a, b);
                    matrixS[j] = ratio;
                    temp1 = b / ratio;
                    temp2 = -a / ratio;

                    for (let k = 0; k < m; k++) {
                        const value1 = matrixU[k][index - 1];
                        const value2 = matrixU[k][j];

                        matrixU[k][index - 1] = value1 * temp1 + value2 * temp2;
                        matrixU[k][j] = -value1 * temp2 + value2 * temp1;
                    }
                }
            }

            if (index === i) {
                if (matrixS[i] < 0) {
                    matrixS[i] = -matrixS[i];

                    for (let j = 0; j < n; j++) {
                        matrixV[j][i] = -matrixV[j][i];
                    }
                }

                break;
            }

            if (S >= 49) {
                return null;
            }

            let indexValue = matrixS[index];

            a = ((matrixS[i - 1] - matrixS[i]) * (matrixS[i - 1] + matrixS[i]) + (matrixF[i - 1] - matrixF[i]) * (matrixF[i - 1] + matrixF[i])) / (2 * matrixF[i] * matrixS[i - 1]);
            ratio = computeHypotenuse(a, 1);

            if (a < 0) {
                a = ((indexValue - matrixS[i]) * (indexValue + matrixS[i]) + matrixF[i] * (matrixS[i - 1] / (a - ratio) - matrixF[i])) / indexValue;
            } else {
                a = ((indexValue - matrixS[i]) * (indexValue + matrixS[i]) + matrixF[i] * (matrixS[i - 1] / (a + ratio) - matrixF[i])) / indexValue;
            }

            let temp1 = 1;
            let temp2 = 1;

            for (let j = index + 1; j < i + 1; j++) {
                let matrixFValue = matrixF[j];
                let matrixSValue = matrixS[j];

                b = temp2 * matrixFValue;
                matrixFValue *= temp1;
                ratio = computeHypotenuse(a, b);
                matrixF[j - 1] = ratio;

                temp1 = a / ratio;
                temp2 = b / ratio;
                a = indexValue * temp1 + matrixFValue * temp2;
                b = matrixSValue * temp2;
                matrixFValue = -indexValue * temp2 + matrixFValue * temp1;
                matrixSValue *= temp1;

                for (let k = 0; k < n; k++) {
                    const value1 = matrixV[k][j - 1];
                    const value2 = matrixV[k][j];

                    matrixV[k][j - 1] = value1 * temp1 + value2 * temp2;
                    matrixV[k][j] = -value1 * temp2 + value2 * temp1;
                }

                ratio = computeHypotenuse(a, b);
                matrixS[j - 1] = ratio;
                temp1 = a / ratio;
                temp2 = b / ratio;
                a = temp1 * matrixFValue + temp2 * matrixSValue;
                indexValue = -temp2 * matrixFValue + temp1 * matrixSValue;

                for (let k = 0; k < m; k++) {
                    const value1 = matrixU[k][j - 1];
                    const value2 = matrixU[k][j];

                    matrixU[k][j - 1] = value1 * temp1 + value2 * temp2;
                    matrixU[k][j] = -value1 * temp2 + value2 * temp1;
                }
            }

            matrixF[index] = 0;
            matrixF[i] = a;
            matrixS[i] = indexValue;
        }
    }

    for (let i = 0; i < matrixS.length; i++) {
        if (matrixS[i] < EPSILON) {
            matrixS[i] = 0;
        }
    }

    for (let i = 0; i < n; i++) {
        for (let j = i - 1; j >= 0; j--) {
            if (matrixS[j] < matrixS[i]) {
                const temp = matrixS[j];
                matrixS[j] = matrixS[i];
                matrixS[i] = temp;

                for (let k = 0; k < matrixU.length; k++) {
                    const temp = matrixU[k][i];
                    matrixU[k][i] = matrixU[k][j];
                    matrixU[k][j] = temp;
                }

                for (let k = 0; k < matrixV.length; k++) {
                    const temp = matrixV[k][i];
                    matrixV[k][i] = matrixV[k][j];
                    matrixV[k][j] = temp;
                }

                i = j;
            }
        }
    }

    return {
        matrixU,
        matrixS,
        matrixV,
    };
}

function computeHypotenuse(a: number, b: number): number {
    let ratio = 0;

    if (Math.abs(a) > Math.abs(b)) {
        ratio = b / a;
        return Math.abs(a) * Math.sqrt(1 + ratio * ratio);
    }

    if (b !== 0) {
        ratio = a / b;
        return Math.abs(b) * Math.sqrt(1 + ratio * ratio);
    }

    return 0;
}

function getMatrixSumProductOfRows(matrix: number[][], startRow: number, endRow: number, col1: number, col2: number): number {
    let sum = 0;

    for (let i = startRow; i < endRow; i++) {
        sum += matrix[i][col1] * matrix[i][col2];
    }

    return sum;
}

function getMatrixSumProductOfCols(matrix: number[][], startCol: number, endCol: number, row1: number, row2: number): number {
    let sum = 0;

    for (let i = startCol; i < endCol; i++) {
        sum += matrix[row1][i] * matrix[row2][i];
    }

    return sum;
}

export const romanToArabicMap = new Map<string, number>([
    ['I', 1],
    ['V', 5],
    ['X', 10],
    ['L', 50],
    ['C', 100],
    ['D', 500],
    ['M', 1000],
]);

export const arabicToRomanMap = new Map<number, string>([
    [1, 'I'],
    [4, 'IV'],
    [5, 'V'],
    [9, 'IX'],
    [10, 'X'],
    [40, 'XL'],
    [45, 'VL'],
    [49, 'IL'],
    [50, 'L'],
    [90, 'XC'],
    [95, 'VC'],
    [99, 'IC'],
    [100, 'C'],
    [400, 'CD'],
    [450, 'LD'],
    [490, 'XD'],
    [495, 'VD'],
    [499, 'ID'],
    [500, 'D'],
    [900, 'CM'],
    [950, 'LM'],
    [990, 'XM'],
    [995, 'VM'],
    [999, 'IM'],
    [1000, 'M'],
]);

/**
 * form: A number specifying the type of roman numeral you want.
 * The roman numeral style ranges from Classic to Simplified, becoming more concise as the value of form increases
 * 0 Classic
 * 1 More concise
 * 2 More concise
 * 3 More concise
 * 4 Simplified
 */
export const romanFormArray: number[][] = [
    [1, 4, 5, 9, 10, 40, 50, 90, 100, 400, 500, 900, 1000, 4000],
    [1, 4, 5, 9, 10, 40, 45, 50, 90, 95, 100, 400, 450, 500, 900, 950, 1000, 4000],
    [1, 4, 5, 9, 10, 40, 45, 49, 50, 90, 95, 99, 100, 400, 450, 490, 500, 900, 950, 990, 1000, 4000],
    [1, 4, 5, 9, 10, 40, 45, 49, 50, 90, 95, 99, 100, 400, 450, 490, 495, 500, 900, 950, 990, 995, 1000, 4000],
    [1, 4, 5, 9, 10, 40, 45, 49, 50, 90, 95, 99, 100, 400, 450, 490, 495, 499, 500, 900, 950, 990, 995, 999, 1000, 4000],
];
