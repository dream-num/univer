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

/* eslint-disable ts/no-explicit-any */

import type { Dependency, DependencyItem, IdentifierDecorator } from '@wendellhu/redi';

/**
 * Overrides the dependencies definited in the plugin. Only dependencies that are identified by `IdentifierDecorator` can be overridden.
 * If you override a dependency with `null`, the original dependency will be removed.
 */
export type DependencyOverride = [identifier: IdentifierDecorator<any>, DependencyItem<any> | null][];

export function mergeOverrideWithDependencies(dependencies: Dependency[], override?: DependencyOverride): Dependency[] {
    if (!override) {
        return dependencies;
    }

    const result: Dependency[] = [];
    for (const dependency of dependencies) {
        if (dependency.length === 1) {
            result.push(dependency);
            continue;
        }

        const overrideItem = override.find(([identifier]) => identifier === dependency[0]);
        if (overrideItem) {
            if (overrideItem[1] === null) {
                continue;
            }
            result.push([dependency[0], overrideItem[1]]);
        } else {
            result.push(dependency);
        }
    }

    return result;
}
