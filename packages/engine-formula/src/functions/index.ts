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

import type { Ctor } from '@univerjs/core';
import type { IFunctionNames } from '../basics/function';
import type { BaseFunction } from './base-function';
import { functionArray } from './array/function-map';
import { functionCompatibility } from './compatibility/function-map';
import { functionCube } from './cube/function-map';
import { functionDatabase } from './database/function-map';
import { functionDate } from './date/function-map';
import { functionEngineering } from './engineering/function-map';
import { functionFinancial } from './financial/function-map';
import { functionInformation } from './information/function-map';
import { functionLogical } from './logical/function-map';
import { functionLookup } from './lookup/function-map';
import { functionMath } from './math/function-map';
import { functionMeta } from './meta/function-map';
import { functionStatistical } from './statistical/function-map';
import { functionText } from './text/function-map';
import { functionUniver } from './univer/function-map';
import { functionWeb } from './web/function-map';

export const ALL_IMPLEMENTED_FUNCTIONS = [
    ...functionArray,
    ...functionCompatibility,
    ...functionCube,
    ...functionDatabase,
    ...functionDate,
    ...functionEngineering,
    ...functionFinancial,
    ...functionInformation,
    ...functionLogical,
    ...functionLookup,
    ...functionMath,
    ...functionMeta,
    ...functionStatistical,
    ...functionText,
    ...functionUniver,
    ...functionWeb,
] as Array<[Ctor<BaseFunction>, IFunctionNames]>;

export const ALL_IMPLEMENTED_FUNCTIONS_SET = new Set(ALL_IMPLEMENTED_FUNCTIONS.map(([_, name]) => name));
