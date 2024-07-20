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

import { useEffect, useMemo, useState } from 'react';
import type { Dependency } from '@univerjs/core';
import { Injector } from '@univerjs/core';

/**
 * Create an injector that could be provided via `RediContext.Provider`.
 *
 * @param dependenciesFactory dependencies that would be provided in this injector
 * @returns the `RediContext.Provider` value
 */
export function useNewRootInjector(dependenciesFactory: () => Dependency[], afterInit?: (injector: Injector) => void) {
    const [injector] = useState(() => {
        const injector = new Injector(dependenciesFactory());
        if (afterInit) {
            afterInit(injector);
        }

        return injector;
    });

    useEffect(() => () => injector.dispose(), [injector]);

    return useMemo(() => ({ injector }), [injector]);
}
