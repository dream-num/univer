import type { PrefixNode } from '../ast-node/prefix-node';
import type { ReferenceNode } from '../ast-node/reference-node';
import type { SuffixNode } from '../ast-node/suffix-node';
import type { UnionNode } from '../ast-node/union-node';

export type PreCalculateNodeType = ReferenceNode | UnionNode | PrefixNode | SuffixNode;
