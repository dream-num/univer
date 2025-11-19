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
import { functionLogical, functionLookup, functionMath, functionMeta, functionStatistical, IFormulaCurrentConfigService, IFormulaRuntimeService, IFunctionService, SetArrayFormulaDataMutation, SetFormulaCalculationNotificationMutation, SetFormulaCalculationResultMutation, SetFormulaCalculationStartMutation, SetFormulaCalculationStopMutation } from '@univerjs/engine-formula';
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
        styles: {
            R3: {
                n: {
                    pattern: 'YYYY-M-D',
                },
            },
        },
        sheets: {
            sheet1: {
                id: subUnitId,
                cellData: {
                    0: {
                        0: {
                            v: 'S/N',
                            t: 1,
                        },
                        1: {
                            v: 'Start 1',
                            t: 1,
                        },
                        2: {
                            v: 'Start 2',
                            t: 1,
                        },
                        3: {
                            v: 'D/U',
                            t: 1,
                        },
                        4: {
                            v: 'Outcome 1',
                            t: 1,
                        },
                        5: {
                            v: 'Outcome 2',
                            t: 1,
                        },
                    },
                    1: {
                        0: {
                            v: '1',
                            t: 2,
                        },
                        1: {
                            v: '43831',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43834',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'U',
                            t: 1,
                        },
                        4: {
                            f: '=IFERROR(AGGREGATE(15,6,B$2:B$2193/($D$2:$D$2193="U"),ROWS(E$2:E2)),"")',
                        },
                        5: {
                            f: '=IFERROR(AGGREGATE(15,6,C$2:C$2193/($D$2:$D$2193="U"),ROWS(F$2:F2)),"")',
                        },
                    },
                    2: {
                        0: {
                            v: '2',
                            t: 2,
                        },
                        1: {
                            v: '43832',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43834',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                        4: {
                            f: '=IFERROR(AGGREGATE(15,6,B$2:B$2193/($D$2:$D$2193="U"),ROWS(E$2:E3)),"")',
                        },
                        5: {
                            f: '=IFERROR(AGGREGATE(15,6,C$2:C$2193/($D$2:$D$2193="U"),ROWS(F$2:F3)),"")',
                        },
                    },
                    3: {
                        0: {
                            v: '3',
                            t: 2,
                        },
                        1: {
                            v: '43833',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43834',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                        4: {
                            f: '=IFERROR(AGGREGATE(15,6,B$2:B$2193/($D$2:$D$2193="U"),ROWS(E$2:E4)),"")',
                        },
                        5: {
                            f: '=IFERROR(AGGREGATE(15,6,C$2:C$2193/($D$2:$D$2193="U"),ROWS(F$2:F4)),"")',
                        },
                    },
                    4: {
                        0: {
                            v: '4',
                            t: 2,
                        },
                        1: {
                            v: '43834',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43834',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                        4: {
                            f: '=IFERROR(AGGREGATE(15,6,B$2:B$2193/($D$2:$D$2193="U"),ROWS(E$2:E5)),"")',
                        },
                        5: {
                            f: '=IFERROR(AGGREGATE(15,6,C$2:C$2193/($D$2:$D$2193="U"),ROWS(F$2:F5)),"")',
                        },
                    },
                    5: {
                        0: {
                            v: '5',
                            t: 2,
                        },
                        1: {
                            v: '43835',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43848',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'U',
                            t: 1,
                        },
                        4: {
                            f: '=IFERROR(AGGREGATE(15,6,B$2:B$2193/($D$2:$D$2193="U"),ROWS(E$2:E6)),"")',
                        },
                        5: {
                            f: '=IFERROR(AGGREGATE(15,6,C$2:C$2193/($D$2:$D$2193="U"),ROWS(F$2:F6)),"")',
                        },
                    },
                    6: {
                        0: {
                            v: '6',
                            t: 2,
                        },
                        1: {
                            v: '43836',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43848',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                        4: {
                            f: '=IFERROR(AGGREGATE(15,6,B$2:B$2193/($D$2:$D$2193="U"),ROWS(E$2:E7)),"")',
                        },
                        5: {
                            f: '=IFERROR(AGGREGATE(15,6,C$2:C$2193/($D$2:$D$2193="U"),ROWS(F$2:F7)),"")',
                        },
                    },
                    7: {
                        0: {
                            v: '7',
                            t: 2,
                        },
                        1: {
                            v: '43837',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43848',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                        4: {
                            f: '=IFERROR(AGGREGATE(15,6,B$2:B$2193/($D$2:$D$2193="U"),ROWS(E$2:E8)),"")',
                        },
                        5: {
                            f: '=IFERROR(AGGREGATE(15,6,C$2:C$2193/($D$2:$D$2193="U"),ROWS(F$2:F8)),"")',
                        },
                    },
                    8: {
                        0: {
                            v: '8',
                            t: 2,
                        },
                        1: {
                            v: '43838',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43848',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                        4: {
                            f: '=IFERROR(AGGREGATE(15,6,B$2:B$2193/($D$2:$D$2193="U"),ROWS(E$2:E9)),"")',
                        },
                        5: {
                            f: '=IFERROR(AGGREGATE(15,6,C$2:C$2193/($D$2:$D$2193="U"),ROWS(F$2:F9)),"")',
                        },
                    },
                    9: {
                        0: {
                            v: '9',
                            t: 2,
                        },
                        1: {
                            v: '43839',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43848',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                        4: {
                            f: '=IFERROR(AGGREGATE(15,6,B$2:B$2193/($D$2:$D$2193="U"),ROWS(E$2:E10)),"")',
                        },
                        5: {
                            f: '=IFERROR(AGGREGATE(15,6,C$2:C$2193/($D$2:$D$2193="U"),ROWS(F$2:F10)),"")',
                        },
                    },
                    10: {
                        0: {
                            v: '10',
                            t: 2,
                        },
                        1: {
                            v: '43840',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43848',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                        4: {
                            f: '=IFERROR(AGGREGATE(15,6,B$2:B$2193/($D$2:$D$2193="U"),ROWS(E$2:E11)),"")',
                        },
                        5: {
                            f: '=IFERROR(AGGREGATE(15,6,C$2:C$2193/($D$2:$D$2193="U"),ROWS(F$2:F11)),"")',
                        },
                    },
                    11: {
                        0: {
                            v: '11',
                            t: 2,
                        },
                        1: {
                            v: '43841',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43848',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                        4: {
                            f: '=IFERROR(AGGREGATE(15,6,B$2:B$2193/($D$2:$D$2193="U"),ROWS(E$2:E12)),"")',
                        },
                        5: {
                            f: '=IFERROR(AGGREGATE(15,6,C$2:C$2193/($D$2:$D$2193="U"),ROWS(F$2:F12)),"")',
                        },
                    },
                    12: {
                        0: {
                            v: '12',
                            t: 2,
                        },
                        1: {
                            v: '43842',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43848',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                        4: {
                            f: '=IFERROR(AGGREGATE(15,6,B$2:B$2193/($D$2:$D$2193="U"),ROWS(E$2:E13)),"")',
                        },
                        5: {
                            f: '=IFERROR(AGGREGATE(15,6,C$2:C$2193/($D$2:$D$2193="U"),ROWS(F$2:F13)),"")',
                        },
                    },
                    13: {
                        0: {
                            v: '13',
                            t: 2,
                        },
                        1: {
                            v: '43843',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43848',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                        4: {
                            f: '=IFERROR(AGGREGATE(15,6,B$2:B$2193/($D$2:$D$2193="U"),ROWS(E$2:E14)),"")',
                        },
                        5: {
                            f: '=IFERROR(AGGREGATE(15,6,C$2:C$2193/($D$2:$D$2193="U"),ROWS(F$2:F14)),"")',
                        },
                    },
                    14: {
                        0: {
                            v: '14',
                            t: 2,
                        },
                        1: {
                            v: '43844',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43848',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                        4: {
                            f: '=IFERROR(AGGREGATE(15,6,B$2:B$2193/($D$2:$D$2193="U"),ROWS(E$2:E15)),"")',
                        },
                        5: {
                            f: '=IFERROR(AGGREGATE(15,6,C$2:C$2193/($D$2:$D$2193="U"),ROWS(F$2:F15)),"")',
                        },
                    },
                    15: {
                        0: {
                            v: '15',
                            t: 2,
                        },
                        1: {
                            v: '43845',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43848',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    16: {
                        0: {
                            v: '16',
                            t: 2,
                        },
                        1: {
                            v: '43846',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43848',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    17: {
                        0: {
                            v: '17',
                            t: 2,
                        },
                        1: {
                            v: '43847',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43848',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    18: {
                        0: {
                            v: '18',
                            t: 2,
                        },
                        1: {
                            v: '43848',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43848',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    19: {
                        0: {
                            v: '19',
                            t: 2,
                        },
                        1: {
                            v: '43849',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43862',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'U',
                            t: 1,
                        },
                    },
                    20: {
                        0: {
                            v: '20',
                            t: 2,
                        },
                        1: {
                            v: '43850',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43862',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    21: {
                        0: {
                            v: '21',
                            t: 2,
                        },
                        1: {
                            v: '43851',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43862',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    22: {
                        0: {
                            v: '22',
                            t: 2,
                        },
                        1: {
                            v: '43852',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43862',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    23: {
                        0: {
                            v: '23',
                            t: 2,
                        },
                        1: {
                            v: '43853',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43862',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    24: {
                        0: {
                            v: '24',
                            t: 2,
                        },
                        1: {
                            v: '43854',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43862',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    25: {
                        0: {
                            v: '25',
                            t: 2,
                        },
                        1: {
                            v: '43855',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43862',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    26: {
                        0: {
                            v: '26',
                            t: 2,
                        },
                        1: {
                            v: '43856',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43862',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    27: {
                        0: {
                            v: '27',
                            t: 2,
                        },
                        1: {
                            v: '43857',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43862',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    28: {
                        0: {
                            v: '28',
                            t: 2,
                        },
                        1: {
                            v: '43858',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43862',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    29: {
                        0: {
                            v: '29',
                            t: 2,
                        },
                        1: {
                            v: '43859',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43862',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    30: {
                        0: {
                            v: '30',
                            t: 2,
                        },
                        1: {
                            v: '43860',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43862',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    31: {
                        0: {
                            v: '31',
                            t: 2,
                        },
                        1: {
                            v: '43861',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43862',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    32: {
                        0: {
                            v: '32',
                            t: 2,
                        },
                        1: {
                            v: '43862',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43862',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    33: {
                        0: {
                            v: '33',
                            t: 2,
                        },
                        1: {
                            v: '43863',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43876',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'U',
                            t: 1,
                        },
                    },
                    34: {
                        0: {
                            v: '34',
                            t: 2,
                        },
                        1: {
                            v: '43864',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43876',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    35: {
                        0: {
                            v: '35',
                            t: 2,
                        },
                        1: {
                            v: '43865',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43876',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    36: {
                        0: {
                            v: '36',
                            t: 2,
                        },
                        1: {
                            v: '43866',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43876',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    37: {
                        0: {
                            v: '37',
                            t: 2,
                        },
                        1: {
                            v: '43867',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43876',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    38: {
                        0: {
                            v: '38',
                            t: 2,
                        },
                        1: {
                            v: '43868',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43876',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    39: {
                        0: {
                            v: '39',
                            t: 2,
                        },
                        1: {
                            v: '43869',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43876',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    40: {
                        0: {
                            v: '40',
                            t: 2,
                        },
                        1: {
                            v: '43870',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43876',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    41: {
                        0: {
                            v: '41',
                            t: 2,
                        },
                        1: {
                            v: '43871',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43876',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    42: {
                        0: {
                            v: '42',
                            t: 2,
                        },
                        1: {
                            v: '43872',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43876',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    43: {
                        0: {
                            v: '43',
                            t: 2,
                        },
                        1: {
                            v: '43873',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43876',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    44: {
                        0: {
                            v: '44',
                            t: 2,
                        },
                        1: {
                            v: '43874',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43876',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    45: {
                        0: {
                            v: '45',
                            t: 2,
                        },
                        1: {
                            v: '43875',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43876',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    46: {
                        0: {
                            v: '46',
                            t: 2,
                        },
                        1: {
                            v: '43876',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43876',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    47: {
                        0: {
                            v: '47',
                            t: 2,
                        },
                        1: {
                            v: '43877',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43890',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'U',
                            t: 1,
                        },
                    },
                    48: {
                        0: {
                            v: '48',
                            t: 2,
                        },
                        1: {
                            v: '43878',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43890',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    49: {
                        0: {
                            v: '49',
                            t: 2,
                        },
                        1: {
                            v: '43879',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43890',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    50: {
                        0: {
                            v: '50',
                            t: 2,
                        },
                        1: {
                            v: '43880',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43890',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    51: {
                        0: {
                            v: '51',
                            t: 2,
                        },
                        1: {
                            v: '43881',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43890',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    52: {
                        0: {
                            v: '52',
                            t: 2,
                        },
                        1: {
                            v: '43882',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43890',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    53: {
                        0: {
                            v: '53',
                            t: 2,
                        },
                        1: {
                            v: '43883',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43890',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    54: {
                        0: {
                            v: '54',
                            t: 2,
                        },
                        1: {
                            v: '43884',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43890',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    55: {
                        0: {
                            v: '55',
                            t: 2,
                        },
                        1: {
                            v: '43885',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43890',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    56: {
                        0: {
                            v: '56',
                            t: 2,
                        },
                        1: {
                            v: '43886',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43890',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    57: {
                        0: {
                            v: '57',
                            t: 2,
                        },
                        1: {
                            v: '43887',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43890',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    58: {
                        0: {
                            v: '58',
                            t: 2,
                        },
                        1: {
                            v: '43888',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43890',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    59: {
                        0: {
                            v: '59',
                            t: 2,
                        },
                        1: {
                            v: '43889',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43890',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    60: {
                        0: {
                            v: '60',
                            t: 2,
                        },
                        1: {
                            v: '43890',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43890',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    61: {
                        0: {
                            v: '61',
                            t: 2,
                        },
                        1: {
                            v: '43891',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43904',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'U',
                            t: 1,
                        },
                    },
                    62: {
                        0: {
                            v: '62',
                            t: 2,
                        },
                        1: {
                            v: '43892',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43904',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    63: {
                        0: {
                            v: '63',
                            t: 2,
                        },
                        1: {
                            v: '43893',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43904',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    64: {
                        0: {
                            v: '64',
                            t: 2,
                        },
                        1: {
                            v: '43894',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43904',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    65: {
                        0: {
                            v: '65',
                            t: 2,
                        },
                        1: {
                            v: '43895',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43904',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    66: {
                        0: {
                            v: '66',
                            t: 2,
                        },
                        1: {
                            v: '43896',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43904',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    67: {
                        0: {
                            v: '67',
                            t: 2,
                        },
                        1: {
                            v: '43897',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43904',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    68: {
                        0: {
                            v: '68',
                            t: 2,
                        },
                        1: {
                            v: '43898',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43904',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    69: {
                        0: {
                            v: '69',
                            t: 2,
                        },
                        1: {
                            v: '43899',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43904',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    70: {
                        0: {
                            v: '70',
                            t: 2,
                        },
                        1: {
                            v: '43900',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43904',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    71: {
                        0: {
                            v: '71',
                            t: 2,
                        },
                        1: {
                            v: '43901',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43904',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    72: {
                        0: {
                            v: '72',
                            t: 2,
                        },
                        1: {
                            v: '43902',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43904',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    73: {
                        0: {
                            v: '73',
                            t: 2,
                        },
                        1: {
                            v: '43903',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43904',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    74: {
                        0: {
                            v: '74',
                            t: 2,
                        },
                        1: {
                            v: '43904',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43904',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    75: {
                        0: {
                            v: '75',
                            t: 2,
                        },
                        1: {
                            v: '43905',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43918',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'U',
                            t: 1,
                        },
                    },
                    76: {
                        0: {
                            v: '76',
                            t: 2,
                        },
                        1: {
                            v: '43906',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43918',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    77: {
                        0: {
                            v: '77',
                            t: 2,
                        },
                        1: {
                            v: '43907',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43918',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    78: {
                        0: {
                            v: '78',
                            t: 2,
                        },
                        1: {
                            v: '43908',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43918',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    79: {
                        0: {
                            v: '79',
                            t: 2,
                        },
                        1: {
                            v: '43909',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43918',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    80: {
                        0: {
                            v: '80',
                            t: 2,
                        },
                        1: {
                            v: '43910',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43918',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    81: {
                        0: {
                            v: '81',
                            t: 2,
                        },
                        1: {
                            v: '43911',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43918',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    82: {
                        0: {
                            v: '82',
                            t: 2,
                        },
                        1: {
                            v: '43912',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43918',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    83: {
                        0: {
                            v: '83',
                            t: 2,
                        },
                        1: {
                            v: '43913',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43918',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    84: {
                        0: {
                            v: '84',
                            t: 2,
                        },
                        1: {
                            v: '43914',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43918',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    85: {
                        0: {
                            v: '85',
                            t: 2,
                        },
                        1: {
                            v: '43915',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43918',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    86: {
                        0: {
                            v: '86',
                            t: 2,
                        },
                        1: {
                            v: '43916',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43918',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    87: {
                        0: {
                            v: '87',
                            t: 2,
                        },
                        1: {
                            v: '43917',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43918',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    88: {
                        0: {
                            v: '88',
                            t: 2,
                        },
                        1: {
                            v: '43918',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43918',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    89: {
                        0: {
                            v: '89',
                            t: 2,
                        },
                        1: {
                            v: '43919',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43932',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'U',
                            t: 1,
                        },
                    },
                    90: {
                        0: {
                            v: '90',
                            t: 2,
                        },
                        1: {
                            v: '43920',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43932',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    91: {
                        0: {
                            v: '91',
                            t: 2,
                        },
                        1: {
                            v: '43921',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43932',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    92: {
                        0: {
                            v: '92',
                            t: 2,
                        },
                        1: {
                            v: '43922',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43932',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    93: {
                        0: {
                            v: '93',
                            t: 2,
                        },
                        1: {
                            v: '43923',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43932',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    94: {
                        0: {
                            v: '94',
                            t: 2,
                        },
                        1: {
                            v: '43924',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43932',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    95: {
                        0: {
                            v: '95',
                            t: 2,
                        },
                        1: {
                            v: '43925',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43932',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    96: {
                        0: {
                            v: '96',
                            t: 2,
                        },
                        1: {
                            v: '43926',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43932',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    97: {
                        0: {
                            v: '97',
                            t: 2,
                        },
                        1: {
                            v: '43927',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43932',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    98: {
                        0: {
                            v: '98',
                            t: 2,
                        },
                        1: {
                            v: '43928',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43932',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    99: {
                        0: {
                            v: '99',
                            t: 2,
                        },
                        1: {
                            v: '43929',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43932',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    100: {
                        0: {
                            v: '100',
                            t: 2,
                        },
                        1: {
                            v: '43930',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43932',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    101: {
                        0: {
                            v: '101',
                            t: 2,
                        },
                        1: {
                            v: '43931',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43932',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    102: {
                        0: {
                            v: '102',
                            t: 2,
                        },
                        1: {
                            v: '43932',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43932',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    103: {
                        0: {
                            v: '103',
                            t: 2,
                        },
                        1: {
                            v: '43933',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43946',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'U',
                            t: 1,
                        },
                    },
                    104: {
                        0: {
                            v: '104',
                            t: 2,
                        },
                        1: {
                            v: '43934',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43946',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    105: {
                        0: {
                            v: '105',
                            t: 2,
                        },
                        1: {
                            v: '43935',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43946',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    106: {
                        0: {
                            v: '106',
                            t: 2,
                        },
                        1: {
                            v: '43936',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43946',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    107: {
                        0: {
                            v: '107',
                            t: 2,
                        },
                        1: {
                            v: '43937',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43946',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    108: {
                        0: {
                            v: '108',
                            t: 2,
                        },
                        1: {
                            v: '43938',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43946',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    109: {
                        0: {
                            v: '109',
                            t: 2,
                        },
                        1: {
                            v: '43939',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43946',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    110: {
                        0: {
                            v: '110',
                            t: 2,
                        },
                        1: {
                            v: '43940',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43946',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    111: {
                        0: {
                            v: '111',
                            t: 2,
                        },
                        1: {
                            v: '43941',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43946',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    112: {
                        0: {
                            v: '112',
                            t: 2,
                        },
                        1: {
                            v: '43942',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43946',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    113: {
                        0: {
                            v: '113',
                            t: 2,
                        },
                        1: {
                            v: '43943',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43946',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    114: {
                        0: {
                            v: '114',
                            t: 2,
                        },
                        1: {
                            v: '43944',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43946',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    115: {
                        0: {
                            v: '115',
                            t: 2,
                        },
                        1: {
                            v: '43945',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43946',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    116: {
                        0: {
                            v: '116',
                            t: 2,
                        },
                        1: {
                            v: '43946',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43946',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    117: {
                        0: {
                            v: '117',
                            t: 2,
                        },
                        1: {
                            v: '43947',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43960',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'U',
                            t: 1,
                        },
                    },
                    118: {
                        0: {
                            v: '118',
                            t: 2,
                        },
                        1: {
                            v: '43948',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43960',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    119: {
                        0: {
                            v: '119',
                            t: 2,
                        },
                        1: {
                            v: '43949',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43960',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    120: {
                        0: {
                            v: '120',
                            t: 2,
                        },
                        1: {
                            v: '43950',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43960',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    121: {
                        0: {
                            v: '121',
                            t: 2,
                        },
                        1: {
                            v: '43951',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43960',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    122: {
                        0: {
                            v: '122',
                            t: 2,
                        },
                        1: {
                            v: '43952',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43960',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    123: {
                        0: {
                            v: '123',
                            t: 2,
                        },
                        1: {
                            v: '43953',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43960',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    124: {
                        0: {
                            v: '124',
                            t: 2,
                        },
                        1: {
                            v: '43954',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43960',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    125: {
                        0: {
                            v: '125',
                            t: 2,
                        },
                        1: {
                            v: '43955',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43960',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    126: {
                        0: {
                            v: '126',
                            t: 2,
                        },
                        1: {
                            v: '43956',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43960',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    127: {
                        0: {
                            v: '127',
                            t: 2,
                        },
                        1: {
                            v: '43957',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43960',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    128: {
                        0: {
                            v: '128',
                            t: 2,
                        },
                        1: {
                            v: '43958',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43960',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    129: {
                        0: {
                            v: '129',
                            t: 2,
                        },
                        1: {
                            v: '43959',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43960',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    130: {
                        0: {
                            v: '130',
                            t: 2,
                        },
                        1: {
                            v: '43960',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43960',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    131: {
                        0: {
                            v: '131',
                            t: 2,
                        },
                        1: {
                            v: '43961',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43974',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'U',
                            t: 1,
                        },
                    },
                    132: {
                        0: {
                            v: '132',
                            t: 2,
                        },
                        1: {
                            v: '43962',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43974',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    133: {
                        0: {
                            v: '133',
                            t: 2,
                        },
                        1: {
                            v: '43963',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43974',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    134: {
                        0: {
                            v: '134',
                            t: 2,
                        },
                        1: {
                            v: '43964',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43974',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    135: {
                        0: {
                            v: '135',
                            t: 2,
                        },
                        1: {
                            v: '43965',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43974',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    136: {
                        0: {
                            v: '136',
                            t: 2,
                        },
                        1: {
                            v: '43966',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43974',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    137: {
                        0: {
                            v: '137',
                            t: 2,
                        },
                        1: {
                            v: '43967',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43974',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    138: {
                        0: {
                            v: '138',
                            t: 2,
                        },
                        1: {
                            v: '43968',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43974',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    139: {
                        0: {
                            v: '139',
                            t: 2,
                        },
                        1: {
                            v: '43969',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43974',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    140: {
                        0: {
                            v: '140',
                            t: 2,
                        },
                        1: {
                            v: '43970',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43974',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    141: {
                        0: {
                            v: '141',
                            t: 2,
                        },
                        1: {
                            v: '43971',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43974',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    142: {
                        0: {
                            v: '142',
                            t: 2,
                        },
                        1: {
                            v: '43972',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43974',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    143: {
                        0: {
                            v: '143',
                            t: 2,
                        },
                        1: {
                            v: '43973',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43974',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    144: {
                        0: {
                            v: '144',
                            t: 2,
                        },
                        1: {
                            v: '43974',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43974',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    145: {
                        0: {
                            v: '145',
                            t: 2,
                        },
                        1: {
                            v: '43975',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43988',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'U',
                            t: 1,
                        },
                    },
                    146: {
                        0: {
                            v: '146',
                            t: 2,
                        },
                        1: {
                            v: '43976',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43988',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    147: {
                        0: {
                            v: '147',
                            t: 2,
                        },
                        1: {
                            v: '43977',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43988',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    148: {
                        0: {
                            v: '148',
                            t: 2,
                        },
                        1: {
                            v: '43978',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43988',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    149: {
                        0: {
                            v: '149',
                            t: 2,
                        },
                        1: {
                            v: '43979',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43988',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    150: {
                        0: {
                            v: '150',
                            t: 2,
                        },
                        1: {
                            v: '43980',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43988',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    151: {
                        0: {
                            v: '151',
                            t: 2,
                        },
                        1: {
                            v: '43981',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43988',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    152: {
                        0: {
                            v: '152',
                            t: 2,
                        },
                        1: {
                            v: '43982',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43988',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    153: {
                        0: {
                            v: '153',
                            t: 2,
                        },
                        1: {
                            v: '43983',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43988',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    154: {
                        0: {
                            v: '154',
                            t: 2,
                        },
                        1: {
                            v: '43984',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43988',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    155: {
                        0: {
                            v: '155',
                            t: 2,
                        },
                        1: {
                            v: '43985',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43988',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    156: {
                        0: {
                            v: '156',
                            t: 2,
                        },
                        1: {
                            v: '43986',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43988',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    157: {
                        0: {
                            v: '157',
                            t: 2,
                        },
                        1: {
                            v: '43987',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43988',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                    158: {
                        0: {
                            v: '158',
                            t: 2,
                        },
                        1: {
                            v: '43988',
                            t: 2,
                            s: 'R3',
                        },
                        2: {
                            v: '43988',
                            t: 2,
                            s: 'R3',
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                    },
                },
            },
        },
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: [],
    };
};

describe('Test AGGREGATE formula 2', () => {
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
            ...functionMath,
            ...functionStatistical,
            ...functionLookup,
            ...functionLogical,
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
        it('Test IFERROR nested AGGREGATE,ROWS', () => {
            expect(getCellValue(1, 4)).toBe(43831);
            expect(getCellValue(1, 5)).toBe(43834);

            expect(getCellValue(2, 4)).toBe(43835);
            expect(getCellValue(2, 5)).toBe(43848);

            expect(getCellValue(3, 4)).toBe(43849);
            expect(getCellValue(3, 5)).toBe(43862);

            expect(getCellValue(4, 4)).toBe(43863);
            expect(getCellValue(4, 5)).toBe(43876);

            expect(getCellValue(5, 4)).toBe(43877);
            expect(getCellValue(5, 5)).toBe(43890);

            expect(getCellValue(6, 4)).toBe(43891);
            expect(getCellValue(6, 5)).toBe(43904);

            expect(getCellValue(7, 4)).toBe(43905);
            expect(getCellValue(7, 5)).toBe(43918);

            expect(getCellValue(8, 4)).toBe(43919);
            expect(getCellValue(8, 5)).toBe(43932);

            expect(getCellValue(9, 4)).toBe(43933);
            expect(getCellValue(9, 5)).toBe(43946);

            expect(getCellValue(10, 4)).toBe(43947);
            expect(getCellValue(10, 5)).toBe(43960);

            expect(getCellValue(11, 4)).toBe(43961);
            expect(getCellValue(11, 5)).toBe(43974);

            expect(getCellValue(12, 4)).toBe(43975);
            expect(getCellValue(12, 5)).toBe(43988);

            expect(getCellValue(13, 4)).toBe('');
            expect(getCellValue(13, 5)).toBe('');

            expect(getCellValue(14, 4)).toBe('');
            expect(getCellValue(14, 5)).toBe('');
        });
    });
});
