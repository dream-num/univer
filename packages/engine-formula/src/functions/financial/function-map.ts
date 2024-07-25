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

import { FUNCTION_NAMES_FINANCIAL } from './function-names';
import { Accrint } from './accrint';
import { Accrintm } from './accrintm';
import { Amorlinc } from './amorlinc';
import { Coupdaybs } from './coupdaybs';
import { Coupdays } from './coupdays';
import { Coupdaysnc } from './coupdaysnc';
import { Coupncd } from './coupncd';
import { Coupnum } from './coupnum';
import { Couppcd } from './couppcd';

export const functionFinancial = [
    [Accrint, FUNCTION_NAMES_FINANCIAL.ACCRINT],
    [Accrintm, FUNCTION_NAMES_FINANCIAL.ACCRINTM],
    [Amorlinc, FUNCTION_NAMES_FINANCIAL.AMORLINC],
    [Coupdaybs, FUNCTION_NAMES_FINANCIAL.COUPDAYBS],
    [Coupdays, FUNCTION_NAMES_FINANCIAL.COUPDAYS],
    [Coupdaysnc, FUNCTION_NAMES_FINANCIAL.COUPDAYSNC],
    [Coupncd, FUNCTION_NAMES_FINANCIAL.COUPNCD],
    [Coupnum, FUNCTION_NAMES_FINANCIAL.COUPNUM],
    [Couppcd, FUNCTION_NAMES_FINANCIAL.COUPPCD],
];
