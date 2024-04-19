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

import { Disposable } from '../shared';

/**
 * Type of built-in univer document instances.
 */
export enum UniverInstanceType {
    UNIVER = 0,
    DOC = 1,
    SHEET = 2,
    SLIDE = 3,

    UNRECOGNIZED = -1,
}

export type UnitType = UniverInstanceType | number;

export abstract class UnitModel<_D = object, T extends UnitType = UnitType> extends Disposable {
    abstract readonly type: T;
    abstract getUnitId(): string;
}
