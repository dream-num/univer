import { IArrayValueObject } from './Common';
import { compareToken } from './Token';

export function reverseCompareOperator(operator: compareToken): compareToken {
    let result: compareToken;
    switch (operator) {
        case compareToken.EQUALS:
            result = compareToken.NOT_EQUAL;
            break;
        case compareToken.GREATER_THAN:
            result = compareToken.LESS_THAN_OR_EQUAL;
            break;
        case compareToken.GREATER_THAN_OR_EQUAL:
            result = compareToken.LESS_THAN;
            break;
        case compareToken.LESS_THAN:
            result = compareToken.GREATER_THAN_OR_EQUAL;
            break;
        case compareToken.LESS_THAN_OR_EQUAL:
            result = compareToken.GREATER_THAN;
            break;
        case compareToken.NOT_EQUAL:
            result = compareToken.EQUALS;
            break;
    }
    return result;
}

export function fromObjectToString(array: IArrayValueObject) {
    return '';
}
