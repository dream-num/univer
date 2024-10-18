/**
 * Copyright 2023-present DreamNum Inc.
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

    let det = 0;

    for (let col = 0; col < n; col++) {
        det += ((col % 2 === 0 ? 1 : -1) * matrix[0][col] * calculateMdeterm(minor(matrix, 0, col)));
    }

    return det;
}

export function calculateMinverse(matrix: number[][]): number[][] | null {
    const det = calculateMdeterm(matrix);

    if (det === 0) {
        return null; // 矩阵不可逆
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
            adj[j][i] = sign * calculateMdeterm(minor(matrix, i, j));
        }
    }

    return adj;
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
