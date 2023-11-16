import { compareToken, matchToken, operatorToken, prefixToken, suffixToken } from './token';

export function isFormulaLexerToken(str: string) {
    return (
        Object.values(compareToken).includes(str as compareToken) ||
        Object.values(operatorToken).includes(str as operatorToken) ||
        Object.values(matchToken).includes(str as matchToken) ||
        Object.values(suffixToken).includes(str as suffixToken) ||
        Object.values(prefixToken).includes(str as prefixToken)
    );
}
