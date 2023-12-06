import { Sumif } from './sumif/sumif';
import { Sumifs } from './sumifs/sumifs';

export enum FUNCTION_NAMES_MATH {
    SUMIF = 'SUMIF',
    SUMIFS = 'SUMIFS',
}

export const functionMath = [
    [Sumif, FUNCTION_NAMES_MATH.SUMIF],
    [Sumifs, FUNCTION_NAMES_MATH.SUMIFS],
];
