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

import type { IFunctionInfo, IFunctionNames } from '@univerjs/engine-formula';
import { FunctionType } from '@univerjs/engine-formula';
import { createIdentifier } from '@univerjs/core';

export class MockFunctionService {
    getDescriptions(): Map<IFunctionNames, IFunctionInfo> {
        const map = new Map<IFunctionNames, IFunctionInfo>();
        map.set('IF', { functionName: 'IF', functionType: FunctionType.Logical, description: 'IF function', abstract: 'IF function', functionParameter: [] });
        map.set('TAN', { functionName: 'TAN', functionType: FunctionType.Logical, description: 'TAN function', abstract: 'TAN function', functionParameter: [] });

        return map;
    }
}

export const IMockFunctionService = createIdentifier<MockFunctionService>('mock.univer.formula.function.service');
