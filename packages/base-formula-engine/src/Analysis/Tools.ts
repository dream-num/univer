import { Nullable } from '@univerjs/core';

import { AstRootNode } from '../AstNode/AstRootNode';
import { FormulaASTCache } from '../AstNode/CacheLRU';
import { LexerTreeMaker } from './Lexer';
import { AstTreeMaker } from './Parser';

export function generateAstNode(formulaString: string) {
    let astNode: Nullable<AstRootNode> = FormulaASTCache.get(formulaString);

    if (astNode) {
        return astNode;
    }

    const lexerTreeMaker = new LexerTreeMaker(formulaString);
    const lexerNode = lexerTreeMaker.treeMaker();
    lexerTreeMaker.suffixExpressionHandler(lexerNode); // suffix Express, 1+(3*4=4)*5+1 convert to 134*4=5*1++

    const astTreeMaker = AstTreeMaker.create();

    astNode = astTreeMaker.parse(lexerNode);

    if (astNode == null) {
        throw new Error('astNode is null');
    }

    FormulaASTCache.set(formulaString, astNode);

    return astNode;
}
