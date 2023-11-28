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

/**
 * Deserialize Sequence to text.
 * @param newSequenceNodes
 * @returns
 */
export function generateStringWithSequence(newSequenceNodes: Array<string | ISequenceNode>) {
    let sequenceString = '';
    for (const node of newSequenceNodes) {
        if (typeof node === 'string') {
            sequenceString += node;
        } else {
            sequenceString += node.token;
        }
    }
    return sequenceString;
}
