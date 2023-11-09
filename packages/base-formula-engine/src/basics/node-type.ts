import { PrefixNode } from '../ast-node/prefix-node';
import { ReferenceNode } from '../ast-node/reference-node';
import { SuffixNode } from '../ast-node/suffix-node';
import { UnionNode } from '../ast-node/union-node';

export type PreCalculateNodeType = ReferenceNode | UnionNode | PrefixNode | SuffixNode;
