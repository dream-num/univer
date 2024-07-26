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
import { Cumipmt } from './cumipmt';
import { Cumprinc } from './cumprinc';
import { Fv } from './fv';
import { Ipmt } from './ipmt';
import { Ispmt } from './ispmt';
import { Nper } from './nper';
import { Pmt } from './pmt';
import { Ppmt } from './ppmt';
import { Pv } from './pv';
import { Rate } from './rate';

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
    [Cumipmt, FUNCTION_NAMES_FINANCIAL.CUMIPMT],
    [Cumprinc, FUNCTION_NAMES_FINANCIAL.CUMPRINC],
    [Fv, FUNCTION_NAMES_FINANCIAL.FV],
    [Ipmt, FUNCTION_NAMES_FINANCIAL.IPMT],
    [Ispmt, FUNCTION_NAMES_FINANCIAL.ISPMT],
    [Nper, FUNCTION_NAMES_FINANCIAL.NPER],
    [Pmt, FUNCTION_NAMES_FINANCIAL.PMT],
    [Ppmt, FUNCTION_NAMES_FINANCIAL.PPMT],
    [Pv, FUNCTION_NAMES_FINANCIAL.PV],
    [Rate, FUNCTION_NAMES_FINANCIAL.RATE],
];
