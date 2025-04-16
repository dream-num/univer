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

/**
 * Merge the second set to the first set.
 * @param s1 the first set
 * @param s2 the second set
 * @returns the merged set
 */
export function mergeSets<T>(s1: Set<T>, s2: Set<T>): Set<T> {
    s2.forEach((s) => s1.add(s));
    return s1;
}
