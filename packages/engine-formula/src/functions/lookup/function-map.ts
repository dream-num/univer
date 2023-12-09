import { FUNCTION_NAMES_LOOKUP } from './function-names';
import { Indirect } from './indirect/indirect';
import { Offset } from './offset/offset';

export const functionLookup = [
    [Indirect, FUNCTION_NAMES_LOOKUP.INDIRECT],
    [Offset, FUNCTION_NAMES_LOOKUP.OFFSET],
];
