import { IFunctionInfo } from '@univerjs/base-formula-engine';

import { FUNCTION_LIST_ARRAY } from './array';
import { FUNCTION_LIST_COMPATIBILITY } from './compatibility';
import { FUNCTION_LIST_CUBE } from './cube';
import { FUNCTION_LIST_DATABASE } from './database';
import { FUNCTION_LIST_DATE } from './date';
import { FUNCTION_LIST_ENGINEERING } from './engineering';
import { FUNCTION_LIST_FINANCIAL } from './financial';
import { FUNCTION_LIST_INFORMATION } from './information';
import { FUNCTION_LIST_LOGICAL } from './logical';
import { FUNCTION_LIST_LOOKUP } from './lookup';
import { FUNCTION_LIST_MATH } from './math';
import { FUNCTION_LIST_STATISTICAL } from './statistical';
import { FUNCTION_LIST_TEXT } from './text';
import { FUNCTION_LIST_UNIVER } from './univer';
import { FUNCTION_LIST_WEB } from './web';

export const FUNCTION_LIST: IFunctionInfo[] = [
    ...FUNCTION_LIST_FINANCIAL,
    ...FUNCTION_LIST_DATE,
    ...FUNCTION_LIST_MATH,
    ...FUNCTION_LIST_STATISTICAL,
    ...FUNCTION_LIST_LOOKUP,
    ...FUNCTION_LIST_DATABASE,
    ...FUNCTION_LIST_TEXT,
    ...FUNCTION_LIST_LOGICAL,
    ...FUNCTION_LIST_INFORMATION,
    ...FUNCTION_LIST_ENGINEERING,
    ...FUNCTION_LIST_CUBE,
    ...FUNCTION_LIST_COMPATIBILITY,
    ...FUNCTION_LIST_WEB,
    ...FUNCTION_LIST_ARRAY,
    ...FUNCTION_LIST_UNIVER,
];
