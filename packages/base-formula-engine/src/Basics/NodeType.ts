import { PrefixNode } from '../AstNode/PrefixNode';
import { ReferenceNode } from '../AstNode/ReferenceNode';
import { SuffixNode } from '../AstNode/SuffixNode';
import { UnionNode } from '../AstNode/UnionNode';

export type PreCalculateNodeType = ReferenceNode | UnionNode | PrefixNode | SuffixNode;
