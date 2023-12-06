import { DEFAULT_TOKEN_TYPE_LAMBDA_OMIT_PARAMETER, DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER } from '../../basics/token-type';
import { LexerNode } from '../analysis/lexer-node';

export function isFirstChildParameter(lexerNode: LexerNode | string) {
    if (!(lexerNode instanceof LexerNode)) {
        return false;
    }
    return lexerNode.getToken() === DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER;
}

export function isChildRunTimeParameter(lexerNode: LexerNode | string) {
    if (!(lexerNode instanceof LexerNode)) {
        return false;
    }
    return lexerNode.getToken() === DEFAULT_TOKEN_TYPE_LAMBDA_OMIT_PARAMETER;
}
