import { LRUMap } from '@univer/core';
import { AstRootNode } from '../AstNode/AstRootNode';

export const CACHE_FORMULA_AST = new LRUMap<string, AstRootNode>(100000);
