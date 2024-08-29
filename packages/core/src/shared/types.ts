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

export type Nullable<T> = T | null | undefined | void;

/**
 * Key value object
 *
 * @ignore
 * @deprecated As it has
 */
export interface IKeyValue {
    [key: string]: any;
}

/**
 * @ignore
 * @deprecated, use {@link Record} instead.
 */
export interface IKeyType<T> {
    [key: string]: T;
}

export type DeepReadonly<T> = {
    readonly [P in keyof T]: DeepReadonly<T[P]>;
};
