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

import type { Dependency, DependencyIdentifier, Injector } from '@wendellhu/redi';

export * from '@wendellhu/redi';
// export * from '@wendellhu/redi/react-bindings';

/**
 * Register the dependencies to the injector.
 * @param injector The injector to register the dependencies.
 * @param dependencies The dependencies to register.
 */
export function registerDependencies(injector: Injector, dependencies: Dependency[]): void {
    dependencies.forEach((d) => injector.add(d));
}

/**
 * Touch a group of dependencies to ensure they are instantiated.
 * @param injector The injector to touch the dependencies.
 * @param dependencies The dependencies to touch.
 */
export function touchDependencies(injector: Injector, dependencies: [DependencyIdentifier<unknown>][]): void {
    dependencies.forEach(([d]) => {
        if (injector.has(d)) {
            injector.get(d);
        }
    });
}
