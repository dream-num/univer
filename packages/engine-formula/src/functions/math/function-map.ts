import { FUNCTION_NAMES_MATH } from './function-names';
import { Power } from './power/power';
import { Sum } from './sum/sum';
import { Sumif } from './sumif/sumif';
import { Sumifs } from './sumifs/sumifs';

export const functionMath = [
    [Sum, FUNCTION_NAMES_MATH.SUM],
    [Sumif, FUNCTION_NAMES_MATH.SUMIF],
    [Sumifs, FUNCTION_NAMES_MATH.SUMIFS],
    [Power, FUNCTION_NAMES_MATH.POWER],
];
