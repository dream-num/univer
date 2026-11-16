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

import type { Nullable } from '@univerjs/core';
import type { IRuntimeUnitDataType } from '../../basics/common';
import type { BaseAstNode } from '../ast-node/base-ast-node';
import type { BaseReferenceObject, FunctionVariantType } from '../reference-object/base-reference-object';
import type { ArrayValueObject } from '../value-object/array-value-object';
import type { BaseValueObject } from '../value-object/base-value-object';

export interface IFormulaValueDemandScope {
    readCell(unitId: string, sheetId: string, row: number, column: number): void;
    samples: Map<BaseAstNode, Map<string, FunctionVariantType[]>>;
    sampleCounts: Map<BaseAstNode, Map<string, number>>;
    /**
     * Attempt-local range materialization cache. It is deliberately separate
     * from the process-wide reference cache so dirty demand reads cannot reuse
     * a value from another calculation. The scheduler clears/isolates it at
     * cycle boundaries.
     */
    arrayCache?: Map<string, ArrayValueObject>;
    probe?: boolean;
}

// A runtime belongs to one calculation service. Keeping the scope on that
// identity lets two Univer instances await unrelated async functions safely.
const valueDemandScopes = new WeakMap<IRuntimeUnitDataType, IFormulaValueDemandScope>();

export function getFormulaValueDemand(runtimeData: IRuntimeUnitDataType) {
    return valueDemandScopes.get(runtimeData);
}

export async function withFormulaValueDemand<T>(
    runtimeData: IRuntimeUnitDataType,
    scope: IFormulaValueDemandScope,
    execute: () => Promise<T>
): Promise<T> {
    const previous = valueDemandScopes.get(runtimeData);
    valueDemandScopes.set(runtimeData, scope);
    try {
        return await execute();
    } finally {
        if (previous) {
            valueDemandScopes.set(runtimeData, previous);
        } else {
            valueDemandScopes.delete(runtimeData);
        }
    }
}

export function beginFormulaSample(
    scope: IFormulaValueDemandScope,
    node: BaseAstNode,
    values?: readonly FunctionVariantType[]
) {
    // Only the numeric sampling builtins use the raw-child path. Custom async
    // functions pass arguments after their declared value conversion, so making
    // a key cannot introduce a read of an address-only or reference argument.
    const argumentsToEncode = values ?? node.getChildren().map((child) => child.getValue());
    const encodedArguments: unknown[][] = [];
    for (const value of argumentsToEncode) {
        const encoded = encodeFormulaSampleValue(value, values == null);
        if (!encoded) {
            return;
        }
        encodedArguments.push(encoded);
    }
    const key = JSON.stringify(encodedArguments);
    let counts = scope.sampleCounts.get(node);
    if (!counts) {
        counts = new Map();
        scope.sampleCounts.set(node, counts);
    }
    const ordinal = counts.get(key) ?? 0;
    counts.set(key, ordinal + 1);
    return { key, ordinal, value: scope.samples.get(node)?.get(key)?.[ordinal] };
}

function encodeFormulaSampleValue(
    value: Nullable<FunctionVariantType>,
    resolveReference: boolean
): unknown[] | undefined {
    if (value == null) {
        return ['missing'];
    }
    if (value.isReferenceObject()) {
        return resolveReference
            ? encodeFormulaSampleValue((value as BaseReferenceObject).toArrayValueObject(), false)
            : undefined;
    }
    const object = value as BaseValueObject;
    if (object.isArray()) {
        const array = object as ArrayValueObject;
        const cells: unknown[][] = [];
        for (let row = 0; row < array.getRowCount(); row++) {
            for (let column = 0; column < array.getColumnCount(); column++) {
                const encoded = encodeFormulaSampleValue(array.get(row, column), false);
                if (!encoded) {
                    return;
                }
                cells.push(encoded);
            }
        }
        return ['array', array.getRowCount(), array.getColumnCount(), cells];
    }
    if (object.isError()) {
        return ['error', object.getValue()];
    }
    if (object.isNull()) {
        return ['null'];
    }
    if (object.isString()) {
        return ['string', object.getValue()];
    }
    if (object.isBoolean()) {
        return ['boolean', object.getValue()];
    }
    if (object.isNumber()) {
        const number = object.getValue() as number;
        if (!Number.isFinite(number)) {
            return ['number', String(number)];
        }
        return ['number', Object.is(number, -0) ? '-0' : number];
    }
    // Lambda closures and other rich objects can read values that are not
    // represented by these arguments. They must execute their own demand path.
    return undefined;
}

export function rememberFormulaSample(
    scope: IFormulaValueDemandScope,
    node: BaseAstNode,
    key: string,
    ordinal: number,
    value: FunctionVariantType
) {
    let samples = scope.samples.get(node);
    if (!samples) {
        samples = new Map();
        scope.samples.set(node, samples);
    }
    let values = samples.get(key);
    if (!values) {
        values = [];
        samples.set(key, values);
    }
    values[ordinal] = value;
}
