import { LexerNode } from '../analysis/lexer-node';

export enum sequenceNodeType {
    NORMAL,
    NUMBER,
    STRING,
    FUNCTION,
    REFERENCE,
    ARRAY,
}

export interface ISequenceNode {
    nodeType: sequenceNodeType;
    token: string;
    startIndex: number;
    endIndex: number;
}

export interface ISequenceArray {
    segment: string;
    currentString: string;
    cur: number;
    currentLexerNode: LexerNode;
}
