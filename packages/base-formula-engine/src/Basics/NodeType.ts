import { ReferenceNode } from '../AstNode/ReferenceNode';
import { UnionNode } from '../AstNode/UnionNode';
import { PrefixNode } from '../AstNode/PrefixNode';
import { SuffixNode } from '../AstNode/SuffixNode';

export type PreCalculateNodeType = ReferenceNode | UnionNode | PrefixNode | SuffixNode;
