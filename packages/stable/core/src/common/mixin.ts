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

interface IMixinProperty<T> {
    // eslint-disable-next-line ts/no-explicit-any
    [fnName: string]: (this: T, ...args: any[]) => any;
}

/**
 * Mixin some methods to targetObject as prototype, the static methods will not be mixed in
 * @param {T} targetClassPrototype The target class to mixin
 * @param {IMixinProperty<T>} mixin The mixin object which contains the methods to mixin.
 */
export function mixinClass<T>(targetClassPrototype: T, mixin: IMixinProperty<T>): void {
    for (const key in mixin) {
        // eslint-disable-next-line no-prototype-builtins
        if (mixin.hasOwnProperty(key)) {
            // @ts-ignore
            targetClassPrototype[key] = mixin[key];
        }
    }
}
