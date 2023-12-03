import { compareToken, matchToken, operatorToken, prefixToken, suffixToken } from './token';

export const FORMULA_LEXER_TOKENS = [
    ...Object.values(compareToken),
    ...Object.values(operatorToken),
    ...Object.values(matchToken),
    ...Object.values(suffixToken),
    ...Object.values(prefixToken),
];

export function isFormulaLexerToken(str: string) {
    return FORMULA_LEXER_TOKENS.includes(str as compareToken);
}

export function includeFormulaLexerToken(str: string) {
    for (const token of FORMULA_LEXER_TOKENS) {
        if (str.indexOf(token) > -1) {
            return true;
        }
    }

    return false;
}

export function normalizeSheetName(sheetName: string) {
    if (sheetName[0] === "'" && sheetName[sheetName.length - 1] === "'") {
        return sheetName.substring(1, sheetName.length - 1);
    }
    return sheetName;
}
