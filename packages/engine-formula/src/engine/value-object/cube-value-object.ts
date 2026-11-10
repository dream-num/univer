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

import type { BaseReferenceObject } from '../reference-object/base-reference-object';
import type { ArrayValueObject } from './array-value-object';
import { BaseValueObject } from './base-value-object';
import { NumberValueObject } from './primitive-object';

export class CubeValueObject extends BaseValueObject {
    static create(values: ArrayValueObject[], references?: BaseReferenceObject[]) {
        return new CubeValueObject(values, references);
    }

    override isCube() {
        return true;
    }

    private _values: ArrayValueObject[] = [];

    constructor(values: ArrayValueObject[], private _references?: BaseReferenceObject[]) {
        super();
        this._values = values;
    }

    override dispose(): void {
        this._values.forEach((value) => {
            value.dispose();
        });
        this._values = [];
        this._references = undefined;
    }

    getCubeValues(): ArrayValueObject[] {
        return this._values;
    }

    getCubeReferences(): BaseReferenceObject[] | undefined {
        return this._references;
    }

    getCubeCount(): number {
        return this._values.length;
    }

    override sum() {
        const result = NumberValueObject.create(0);
        this._values.forEach((arr) => {
            result.plus(arr.sum());
        });
        return result;
    }

    override max() {
        let result = NumberValueObject.create(Number.NEGATIVE_INFINITY);
        this._values.forEach((arr) => {
            const compare = arr.max() as NumberValueObject;
            if (result.isLessThan(compare)) {
                result = compare;
            }
        });
        return result;
    }

    override min() {
        let result = NumberValueObject.create(Number.POSITIVE_INFINITY);
        this._values.forEach((arr) => {
            const compare = arr.max() as NumberValueObject;
            if (result.isGreaterThan(compare)) {
                result = compare;
            }
        });
        return result;
    }

    override count() {
        const count = NumberValueObject.create(0);
        this._values.forEach((arr) => {
            count.plus(arr.count());
        });
        return count;
    }

    override countA() {
        const count = NumberValueObject.create(0);
        this._values.forEach((arr) => {
            count.plus(arr.countA());
        });
        return count;
    }

    override countBlank() {
        const count = NumberValueObject.create(0);
        this._values.forEach((arr) => {
            count.plus(arr.countBlank());
        });
        return count;
    }
}
