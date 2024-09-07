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
    const adj = Array.from({ length: n }, () => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const sign = ((i + j) % 2 === 0 ? 1 : -1);
            adj[j][i] = sign * calculateMdeterm(minor(matrix, i, j));
        }
    }

    return adj;
}
