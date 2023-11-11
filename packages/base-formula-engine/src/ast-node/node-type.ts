export enum NodeType {
    REFERENCE = 'ReferenceNode',
    VALUE = 'ValueNode',
    OPERATOR = 'OperatorNode',
    FUNCTION = 'FunctionNode',
    LAMBDA = 'LambdaNode',
    LAMBDA_PARAMETER = 'LambdaNodeParameter',
    ERROR = 'ErrorNode',
    BASE = 'Base',
    ROOT = 'Root',
    UNION = 'UnionNode',
    PREFIX = 'PrefixNode',
    SUFFIX = 'SuffixNode',
    NULL = 'NullNode',
}

export const NODE_ORDER_MAP = new Map([
    [NodeType.REFERENCE, 7],
    [NodeType.VALUE, 9],
    [NodeType.OPERATOR, 8],
    [NodeType.FUNCTION, 6],
    [NodeType.LAMBDA, 1],
    [NodeType.LAMBDA_PARAMETER, 2],
    [NodeType.ROOT, 10],
    [NodeType.UNION, 3],
    [NodeType.PREFIX, 4],
    [NodeType.SUFFIX, 5],
]);
