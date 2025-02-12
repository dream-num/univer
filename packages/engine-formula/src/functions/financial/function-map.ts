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
import { Db } from './db';
import { Ddb } from './ddb';
import { Disc } from './disc';
import { Dollarde } from './dollarde';
import { Dollarfr } from './dollarfr';
import { Duration } from './duration';
import { Effect } from './effect';
import { Fv } from './fv';
import { Fvschedule } from './fvschedule';
import { Intrate } from './intrate';
import { Ipmt } from './ipmt';
import { Irr } from './irr';
import { Ispmt } from './ispmt';
import { Mduration } from './mduration';
import { Mirr } from './mirr';
import { Nominal } from './nominal';
import { Nper } from './nper';
import { Npv } from './npv';
import { Oddfprice } from './oddfprice';
import { Oddfyield } from './oddfyield';
import { Oddlprice } from './oddlprice';
import { Oddlyield } from './oddlyield';
import { Pduration } from './pduration';
import { Pmt } from './pmt';
import { Ppmt } from './ppmt';
import { Price } from './price';
import { Pricedisc } from './pricedisc';
import { Pricemat } from './pricemat';
import { Pv } from './pv';
import { Rate } from './rate';
import { Received } from './received';
import { Rri } from './rri';
import { Sln } from './sln';
import { Syd } from './syd';
import { Tbilleq } from './tbilleq';
import { Tbillprice } from './tbillprice';
import { Tbillyield } from './tbillyield';
import { Vdb } from './vdb';
import { Xirr } from './xirr';
import { Xnpv } from './xnpv';
import { Yield } from './yield';
import { Yielddisc } from './yielddisc';
import { Yieldmat } from './yieldmat';

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
    [Db, FUNCTION_NAMES_FINANCIAL.DB],
    [Ddb, FUNCTION_NAMES_FINANCIAL.DDB],
    [Disc, FUNCTION_NAMES_FINANCIAL.DISC],
    [Dollarde, FUNCTION_NAMES_FINANCIAL.DOLLARDE],
    [Dollarfr, FUNCTION_NAMES_FINANCIAL.DOLLARFR],
    [Duration, FUNCTION_NAMES_FINANCIAL.DURATION],
    [Effect, FUNCTION_NAMES_FINANCIAL.EFFECT],
    [Fv, FUNCTION_NAMES_FINANCIAL.FV],
    [Fvschedule, FUNCTION_NAMES_FINANCIAL.FVSCHEDULE],
    [Intrate, FUNCTION_NAMES_FINANCIAL.INTRATE],
    [Ipmt, FUNCTION_NAMES_FINANCIAL.IPMT],
    [Irr, FUNCTION_NAMES_FINANCIAL.IRR],
    [Ispmt, FUNCTION_NAMES_FINANCIAL.ISPMT],
    [Mduration, FUNCTION_NAMES_FINANCIAL.MDURATION],
    [Mirr, FUNCTION_NAMES_FINANCIAL.MIRR],
    [Nominal, FUNCTION_NAMES_FINANCIAL.NOMINAL],
    [Nper, FUNCTION_NAMES_FINANCIAL.NPER],
    [Npv, FUNCTION_NAMES_FINANCIAL.NPV],
    [Oddfprice, FUNCTION_NAMES_FINANCIAL.ODDFPRICE],
    [Oddfyield, FUNCTION_NAMES_FINANCIAL.ODDFYIELD],
    [Oddlprice, FUNCTION_NAMES_FINANCIAL.ODDLPRICE],
    [Oddlyield, FUNCTION_NAMES_FINANCIAL.ODDLYIELD],
    [Pduration, FUNCTION_NAMES_FINANCIAL.PDURATION],
    [Pmt, FUNCTION_NAMES_FINANCIAL.PMT],
    [Ppmt, FUNCTION_NAMES_FINANCIAL.PPMT],
    [Price, FUNCTION_NAMES_FINANCIAL.PRICE],
    [Pricedisc, FUNCTION_NAMES_FINANCIAL.PRICEDISC],
    [Pricemat, FUNCTION_NAMES_FINANCIAL.PRICEMAT],
    [Pv, FUNCTION_NAMES_FINANCIAL.PV],
    [Rate, FUNCTION_NAMES_FINANCIAL.RATE],
    [Received, FUNCTION_NAMES_FINANCIAL.RECEIVED],
    [Rri, FUNCTION_NAMES_FINANCIAL.RRI],
    [Sln, FUNCTION_NAMES_FINANCIAL.SLN],
    [Syd, FUNCTION_NAMES_FINANCIAL.SYD],
    [Tbilleq, FUNCTION_NAMES_FINANCIAL.TBILLEQ],
    [Tbillprice, FUNCTION_NAMES_FINANCIAL.TBILLPRICE],
    [Tbillyield, FUNCTION_NAMES_FINANCIAL.TBILLYIELD],
    [Vdb, FUNCTION_NAMES_FINANCIAL.VDB],
    [Xirr, FUNCTION_NAMES_FINANCIAL.XIRR],
    [Xnpv, FUNCTION_NAMES_FINANCIAL.XNPV],
    [Yield, FUNCTION_NAMES_FINANCIAL.YIELD],
    [Yielddisc, FUNCTION_NAMES_FINANCIAL.YIELDDISC],
    [Yieldmat, FUNCTION_NAMES_FINANCIAL.YIELDMAT],
];
