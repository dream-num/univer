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

import type { CellValue, Ctor, Injector, IWorkbookData, Nullable, Worksheet } from '@univerjs/core';
import type { BaseFunction, IFunctionNames } from '@univerjs/engine-formula';
import type { FFormula } from '@univerjs/engine-formula/facade';
import { ICommandService, LocaleType } from '@univerjs/core';
import {
    functionMeta,
    functionStatistical,
    IFormulaCurrentConfigService,
    IFormulaRuntimeService,
    IFunctionService,
    SetArrayFormulaDataMutation,
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationResultMutation,
    SetFormulaCalculationStartMutation,
    SetFormulaCalculationStopMutation,
} from '@univerjs/engine-formula';
import { beforeEach, describe, expect, it } from 'vitest';
import { SetRangeValuesMutation } from '../../../commands/mutations/set-range-values.mutation';
import { createFunctionTestBed } from './create-function-test-bed';

import '@univerjs/engine-formula/facade';

const unitId = 'test';
const subUnitId = 'sheet1';

const getFunctionsTestWorkbookData = (): IWorkbookData => {
    return {
        id: unitId,
        appVersion: '3.0.0-alpha',
        sheets: {
            sheet1: {
                id: subUnitId,
                cellData: {
                    4: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        8: {
                            f: '=COUNTIFS($G$14:$G$185,G5,$J$14:$J$185,"open")',
                            t: 2,
                        },
                    },
                    5: {
                        8: {
                            f: '=COUNTIFS($G$14:$G$185,G5,$J$14:$J$185,"open")',
                            t: 2,
                        },
                    },
                    13: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    14: {
                        6: {
                            v: 2021,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    15: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    16: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    17: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    18: {
                        6: {
                            v: 2021,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    19: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    20: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    21: {
                        6: {
                            v: 2017,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    22: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    23: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    24: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    25: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    26: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    27: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    28: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    29: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    30: {
                        6: {
                            v: 2014,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    31: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    32: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    33: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    34: {
                        6: {
                            v: 2014,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    35: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    36: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    37: {
                        6: {
                            v: 2021,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    38: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    39: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    40: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    41: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    42: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'closed',
                            t: 1,
                        },
                    },
                    43: {
                        6: {
                            v: 2014,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    44: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    45: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    46: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'closed',
                            t: 1,
                        },
                    },
                    47: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    48: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    49: {
                        6: {
                            v: 2021,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    50: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    51: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    52: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    54: {
                        6: {
                            v: 2021,
                            t: 2,
                        },
                        9: {
                            v: 'closed',
                            t: 1,
                        },
                    },
                    55: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    56: {
                        6: {
                            v: 2014,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    57: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    58: {
                        6: {
                            v: 2014,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    59: {
                        6: {
                            v: 2021,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    60: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    61: {
                        6: {
                            v: 2017,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    62: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    63: {
                        6: {
                            v: 2017,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    64: {
                        6: {
                            v: 2021,
                            t: 2,
                        },
                        9: {
                            v: 'closed',
                            t: 1,
                        },
                    },
                    65: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    66: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    67: {
                        6: {
                            v: 2014,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    68: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    69: {
                        6: {
                            v: 2019,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    70: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    71: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    72: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'closed',
                            t: 1,
                        },
                    },
                    73: {
                        6: {
                            v: 2013,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    74: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    75: {
                        6: {
                            v: 2019,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    76: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'open',
                            t: 1,
                        },
                    },
                    77: {
                        6: {
                            v: 2014,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    78: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    79: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'closed',
                            t: 1,
                        },
                    },
                    80: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    81: {
                        6: {
                            v: 2014,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    82: {
                        6: {
                            v: 2021,
                            t: 2,
                        },
                        9: {
                            v: 'closed',
                            t: 1,
                        },
                    },
                    83: {
                        6: {
                            v: 2022,
                            t: 2,
                        },
                        9: {
                            v: 'open',
                            t: 1,
                        },
                    },
                    84: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    85: {
                        6: {
                            v: 2017,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    86: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    87: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    88: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    89: {
                        6: {
                            v: 2017,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    90: {
                        6: {
                            v: 2017,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    91: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    92: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    93: {
                        6: {
                            v: 2014,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    94: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    95: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    96: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    97: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'open',
                            t: 1,
                        },
                    },
                    98: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    99: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    100: {
                        6: {
                            v: 2014,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    101: {
                        6: {
                            v: 2013,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    102: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    103: {
                        6: {
                            v: 2014,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    104: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    105: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    106: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    107: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    108: {
                        6: {
                            v: 2022,
                            t: 2,
                        },
                        9: {
                            v: 'open',
                            t: 1,
                        },
                    },
                    109: {
                        6: {
                            v: 2017,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    110: {
                        6: {
                            v: 2021,
                            t: 2,
                        },
                        9: {
                            v: 'closed',
                            t: 1,
                        },
                    },
                    111: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    112: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    113: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'closed',
                            t: 1,
                        },
                    },
                    114: {
                        6: {
                            v: 2019,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    115: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    116: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    117: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    118: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    119: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    120: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    121: {
                        6: {
                            v: 2014,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    122: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    123: {
                        6: {
                            v: 2017,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    124: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    125: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'closed',
                            t: 1,
                        },
                    },
                    126: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    127: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    128: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    129: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    130: {
                        6: {
                            v: 2021,
                            t: 2,
                        },
                        9: {
                            v: 'open',
                            t: 1,
                        },
                    },
                    131: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    132: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    133: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    134: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    135: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    136: {
                        6: {
                            v: 2021,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    137: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    138: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    139: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    140: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    141: {
                        6: {
                            v: 2019,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    142: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    144: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    145: {
                        6: {
                            v: 2017,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    146: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    147: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    148: {
                        6: {
                            v: 2021,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    149: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    150: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    151: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    152: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    153: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    154: {
                        6: {
                            v: 2014,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    155: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    156: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    157: {
                        6: {
                            v: 2014,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    158: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    159: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    160: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    161: {
                        6: {
                            v: 2017,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    162: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    163: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    164: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    165: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    166: {
                        6: {
                            v: 2017,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    167: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    168: {
                        6: {
                            v: 2019,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    169: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    170: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    171: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    172: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    173: {
                        6: {
                            v: 2019,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    174: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    175: {
                        6: {
                            v: 2020,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    176: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    177: {
                        6: {
                            v: 2019,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    178: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    179: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    180: {
                        6: {
                            v: 2021,
                            t: 2,
                        },
                        9: {
                            v: 'Open',
                            t: 1,
                        },
                    },
                    181: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    182: {
                        6: {
                            v: 2016,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    183: {
                        6: {
                            v: 2018,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                    184: {
                        6: {
                            v: 2014,
                            t: 2,
                        },
                        9: {
                            v: 'Closed',
                            t: 1,
                        },
                    },
                },
            },
        },
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: [],
        styles: {},
    };
};

describe('Test inverted index cache', () => {
    let get: Injector['get'];
    let worksheet: Worksheet;
    let formulaEngine: FFormula;
    let commandService: ICommandService;
    let getCellValue: (row: number, column: number) => Nullable<CellValue>;

    beforeEach(async () => {
        const testBed = createFunctionTestBed(getFunctionsTestWorkbookData());

        get = testBed.get;
        worksheet = testBed.sheet.getSheetBySheetId(subUnitId) as Worksheet;
        formulaEngine = testBed.api.getFormula() as FFormula;

        commandService = get(ICommandService);

        commandService.registerCommand(SetFormulaCalculationStartMutation);
        commandService.registerCommand(SetFormulaCalculationStopMutation);
        commandService.registerCommand(SetFormulaCalculationResultMutation);
        commandService.registerCommand(SetFormulaCalculationNotificationMutation);
        commandService.registerCommand(SetArrayFormulaDataMutation);
        commandService.registerCommand(SetRangeValuesMutation);

        const functionService = get(IFunctionService);

        const formulaCurrentConfigService = get(IFormulaCurrentConfigService);

        const formulaRuntimeService = get(IFormulaRuntimeService);

        formulaCurrentConfigService.load({
            formulaData: {},
            arrayFormulaCellData: {},
            arrayFormulaRange: {},
            forceCalculate: false,
            dirtyRanges: [],
            dirtyNameMap: {},
            dirtyDefinedNameMap: {},
            dirtyUnitFeatureMap: {},
            dirtyUnitOtherFormulaMap: {},
            excludedCell: {},
            allUnitData: {
                [testBed.unitId]: testBed.sheetData,
            },
        });

        const sheetItem = testBed.sheetData[testBed.sheetId];

        formulaRuntimeService.setCurrent(
            0,
            0,
            sheetItem.rowCount,
            sheetItem.columnCount,
            testBed.sheetId,
            testBed.unitId
        );

        const functions = [
            ...functionMeta,
            ...functionStatistical,
        ]
            .map((registerObject) => {
                const Func = registerObject[0] as Ctor<BaseFunction>;
                const name = registerObject[1] as IFunctionNames;

                return new Func(name);
            });

        functionService.registerExecutors(
            ...functions
        );

        formulaEngine.executeCalculation();
        await formulaEngine.onCalculationEnd();

        getCellValue = (row: number, column: number) => {
            return worksheet.getCellRaw(row, column)?.v;
        };
    });

    describe('Test formula', () => {
        it('Multi formula test', () => {
            expect(getCellValue(4, 8)).toBe(2);
            expect(getCellValue(5, 8)).toBe(2);
        });
    });
});
