/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { LexerNode } from '../lexer-node';

import { AbsoluteRefType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { ErrorType } from '../../../basics/error-type';
import { LexerTreeBuilder } from '../lexer-tree-builder';

describe('lexer nodeMaker test', () => {
    const lexerTreeBuilder = new LexerTreeBuilder();

    describe('lexer', () => {
        it('lambda simple1', () => {
            const node = lexerTreeBuilder.treeBuilder(
                '=lambda(x,y, x*y*x)(sum(1,(1+2)*3),2)+1-max(100,200)'
            ) as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual(
                '{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"lambda","st":0,"ed":5,"children":[{"token":"L_1","st":14,"ed":16,"children":[{"token":"P_1","st":15,"ed":17,"children":[{"token":"sum","st":19,"ed":21,"children":[{"token":"P_1","st":19,"ed":21,"children":["1"]},{"token":"P_1","st":21,"ed":23,"children":["1","2","+","3","*"]}]}]},{"token":"P_1","st":30,"ed":32,"children":["2"]}]},{"token":"P_1","st":3,"ed":5,"children":["x"]},{"token":"P_1","st":5,"ed":7,"children":["y"]},{"token":"P_1","st":7,"ed":9,"children":["x","y","*","x","*"]}]},"1","+",{"token":"max","st":39,"ed":41,"children":[{"token":"P_1","st":39,"ed":41,"children":["100"]},{"token":"P_1","st":43,"ed":45,"children":["200"]}]},"-"]}'
            );
        });

        it('lambda mixed2', () => {
            const node = lexerTreeBuilder.treeBuilder(
                '=(-(1+2)--@A1:B2 + 5)/2 + -sum(indirect(A5):B10# + B6# + A1:offset(C5, 1, 1)  ,  100) + {1,2,3;4,5,6;7,8,10} + lambda(x,y,z, x*y*z)(sum(1,(1+2)*3),2,lambda(x,y, @offset(A1:B0,x#*y#))(1,2):C20) + sum((1+2%)*30%, 1+2)%'
            ) as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual(
                '{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"-","st":1,"ed":1,"children":[{"token":"P_1","st":-1,"ed":1,"children":["1","2","+"]}]},{"token":"-","st":-1,"ed":-1,"children":[{"token":"@","st":-1,"ed":-1,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"A1","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B2 ","st":-1,"ed":-1,"children":[]}]}]}]}]},"-","5","+","2 ","/",{"token":"-sum","st":25,"ed":28,"children":[{"token":"P_1","st":26,"ed":28,"children":[{"token":"#","st":-1,"ed":-1,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"indirect","st":30,"ed":37,"children":[{"token":"P_1","st":35,"ed":37,"children":["A5"]}]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B10","st":-1,"ed":-1,"children":[]}]}]}]},{"token":"#","st":-1,"ed":-1,"children":["B6"]},"+",{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"A1","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"offset","st":59,"ed":64,"children":[{"token":"P_1","st":62,"ed":64,"children":["C5"]},{"token":"P_1","st":65,"ed":67,"children":["1"]},{"token":"P_1","st":68,"ed":70,"children":["1"]}]}]}]},"+"]},{"token":"P_1","st":74,"ed":76,"children":["100"]}]},"+","{1,2,3;4,5,6;7,8,10}","+",{"token":"lambda","st":110,"ed":115,"children":[{"token":"L_1","st":126,"ed":128,"children":[{"token":"P_1","st":127,"ed":129,"children":[{"token":"sum","st":131,"ed":133,"children":[{"token":"P_1","st":131,"ed":133,"children":["1"]},{"token":"P_1","st":133,"ed":135,"children":["1","2","+","3","*"]}]}]},{"token":"P_1","st":142,"ed":144,"children":["2"]},{"token":"P_1","st":144,"ed":146,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"lambda","st":148,"ed":153,"children":[{"token":"L_1","st":177,"ed":179,"children":[{"token":"P_1","st":178,"ed":180,"children":["1"]},{"token":"P_1","st":180,"ed":182,"children":["2"]}]},{"token":"P_1","st":151,"ed":153,"children":["x"]},{"token":"P_1","st":153,"ed":155,"children":["y"]},{"token":"P_1","st":155,"ed":157,"children":[{"token":"@offset","st":160,"ed":166,"children":[{"token":"P_1","st":164,"ed":166,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"A1","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B0","st":-1,"ed":-1,"children":[]}]}]}]},{"token":"P_1","st":170,"ed":172,"children":[{"token":"#","st":-1,"ed":-1,"children":["x"]},{"token":"#","st":-1,"ed":-1,"children":["y"]},"*"]}]}]}]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"C20","st":-1,"ed":-1,"children":[]}]}]}]}]},{"token":"P_1","st":113,"ed":115,"children":["x"]},{"token":"P_1","st":115,"ed":117,"children":["y"]},{"token":"P_1","st":117,"ed":119,"children":["z"]},{"token":"P_1","st":119,"ed":121,"children":["x","y","*","z","*"]}]},"+",{"token":"%","st":-1,"ed":-1,"children":[{"token":"sum","st":194,"ed":196,"children":[{"token":"P_1","st":194,"ed":196,"children":["1",{"token":"%","st":-1,"ed":-1,"children":["2"]},"+",{"token":"%","st":-1,"ed":-1,"children":["30"]},"*"]},{"token":"P_1","st":205,"ed":207,"children":["1","2","+"]}]}]},"+"]}'
            );
        });

        it('normal', () => {
            const node = lexerTreeBuilder.treeBuilder(
                '=(sum(max(B1:C10,10)*5-100,((1+1)*2+5)/2,10)+count(B1:C10,10*5-100))*5-100'
            ) as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual(
                '{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"sum","st":1,"ed":3,"children":[{"token":"P_1","st":1,"ed":3,"children":[{"token":"max","st":5,"ed":7,"children":[{"token":"P_1","st":5,"ed":7,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B1","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"C10","st":-1,"ed":-1,"children":[]}]}]}]},{"token":"P_1","st":12,"ed":14,"children":["10"]}]},"5","*","100","-"]},{"token":"P_1","st":22,"ed":24,"children":["1","1","+","2","*","5","+","2","/"]},{"token":"P_1","st":36,"ed":38,"children":["10"]}]},{"token":"count","st":44,"ed":48,"children":[{"token":"P_1","st":46,"ed":48,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B1","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"C10","st":-1,"ed":-1,"children":[]}]}]}]},{"token":"P_1","st":53,"ed":55,"children":["10","5","*","100","-"]}]},"+","5","*","100","-"]}'
            );
        });

        it('normal2', () => {
            const node = lexerTreeBuilder.treeBuilder(
                '=(sum(max(B1:C10,10)*5-100,((1+1)*2+5)/2,10, lambda(x,y, x*y*x)(sum(1,(1+2)*3),2))+lambda(x,y, x*y*x)(sum(1,(1+2)*3),2)+count(B1:C10,10*5-100))*5-100'
            ) as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual(
                '{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"sum","st":1,"ed":3,"children":[{"token":"P_1","st":1,"ed":3,"children":[{"token":"max","st":5,"ed":7,"children":[{"token":"P_1","st":5,"ed":7,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B1","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"C10","st":-1,"ed":-1,"children":[]}]}]}]},{"token":"P_1","st":12,"ed":14,"children":["10"]}]},"5","*","100","-"]},{"token":"P_1","st":22,"ed":24,"children":["1","1","+","2","*","5","+","2","/"]},{"token":"P_1","st":36,"ed":38,"children":["10"]},{"token":"P_1","st":39,"ed":41,"children":[{"token":"lambda","st":44,"ed":49,"children":[{"token":"L_1","st":58,"ed":60,"children":[{"token":"P_1","st":59,"ed":61,"children":[{"token":"sum","st":63,"ed":65,"children":[{"token":"P_1","st":63,"ed":65,"children":["1"]},{"token":"P_1","st":65,"ed":67,"children":["1","2","+","3","*"]}]}]},{"token":"P_1","st":74,"ed":76,"children":["2"]}]},{"token":"P_1","st":47,"ed":49,"children":["x"]},{"token":"P_1","st":49,"ed":51,"children":["y"]},{"token":"P_1","st":51,"ed":53,"children":["x","y","*","x","*"]}]}]}]},{"token":"lambda","st":82,"ed":87,"children":[{"token":"L_1","st":96,"ed":98,"children":[{"token":"P_1","st":97,"ed":99,"children":[{"token":"sum","st":101,"ed":103,"children":[{"token":"P_1","st":101,"ed":103,"children":["1"]},{"token":"P_1","st":103,"ed":105,"children":["1","2","+","3","*"]}]}]},{"token":"P_1","st":112,"ed":114,"children":["2"]}]},{"token":"P_1","st":85,"ed":87,"children":["x"]},{"token":"P_1","st":87,"ed":89,"children":["y"]},{"token":"P_1","st":89,"ed":91,"children":["x","y","*","x","*"]}]},"+",{"token":"count","st":119,"ed":123,"children":[{"token":"P_1","st":121,"ed":123,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B1","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"C10","st":-1,"ed":-1,"children":[]}]}]}]},{"token":"P_1","st":128,"ed":130,"children":["10","5","*","100","-"]}]},"+","5","*","100","-"]}'
            );
        });

        it('let', () => {
            const node = lexerTreeBuilder.treeBuilder('=let(x,5,y,4,sum(x,y)+x)') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual(
                '{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"let","st":0,"ed":2,"children":[{"token":"P_1","st":0,"ed":2,"children":["x"]},{"token":"P_1","st":2,"ed":4,"children":["5"]},{"token":"P_1","st":4,"ed":6,"children":["y"]},{"token":"P_1","st":6,"ed":8,"children":["4"]},{"token":"P_1","st":8,"ed":10,"children":[{"token":"sum","st":12,"ed":14,"children":[{"token":"P_1","st":12,"ed":14,"children":["x"]},{"token":"P_1","st":14,"ed":16,"children":["y"]}]},"x","+"]}]}]}'
            );
        });

        it('REDUCE', () => {
            const node = lexerTreeBuilder.treeBuilder('=REDUCE(1, A1:C2, LAMBDA(a,b,a+b^2))') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual(
                '{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"REDUCE","st":0,"ed":5,"children":[{"token":"P_1","st":3,"ed":5,"children":["1"]},{"token":"P_1","st":5,"ed":7,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"A1","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"C2","st":-1,"ed":-1,"children":[]}]}]}]},{"token":"P_1","st":12,"ed":14,"children":[{"token":"LAMBDA","st":17,"ed":22,"children":[{"token":"P_1","st":20,"ed":22,"children":["a"]},{"token":"P_1","st":22,"ed":24,"children":["b"]},{"token":"P_1","st":24,"ed":26,"children":["a","b","2","^","+"]}]}]}]}]}'
            );
        });

        it('missing default arguments', () => {
            const node = lexerTreeBuilder.treeBuilder('=SUM(, A1:B1)') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual(
                '{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"SUM","st":0,"ed":2,"children":[{"token":"P_1","st":0,"ed":2,"children":[]},{"token":"P_1","st":1,"ed":3,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"A1","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B1","st":-1,"ed":-1,"children":[]}]}]}]}]}]}'
            );
        });

        it('negative and percentage', () => {
            const node = lexerTreeBuilder.treeBuilder('=0.1 -- 0.2%') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual(
                '{"token":"R_1","st":-1,"ed":-1,"children":["0.1 ",{"token":"%","st":-1,"ed":-1,"children":["- 0.2"]},"-"]}'
            );
        });

        it('negative and percentage2', () => {
            const node = lexerTreeBuilder.treeBuilder('=1+(3*4=4)*5+1') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual(
                '{"token":"R_1","st":-1,"ed":-1,"children":["1","3","4","*","4","=","5","*","+","1","+"]}'
            );
        });

        it('prefixToken', () => {
            const node = lexerTreeBuilder.treeBuilder('=  -@A4:B5') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual(
                '{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"-","st":-1,"ed":-1,"children":[{"token":"@","st":-1,"ed":-1,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"A4","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B5","st":-1,"ed":-1,"children":[]}]}]}]}]}]}'
            );
        });

        it('table', () => {
            const node = lexerTreeBuilder.treeBuilder('=SUM(Table3[[#All],[Column1]:[Column2]])') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual(
                '{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"SUM","st":0,"ed":2,"children":[{"token":"P_1","st":0,"ed":2,"children":["Table3[[#All],[Column1]:[Column2]]"]}]}]}'
            );
        });

        it('import range', () => {
            const node = lexerTreeBuilder.treeBuilder('=[asdfasdfasdf]\'sheet-1\'!A3:B10') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual(
                '{"token":"R_1","st":-1,"ed":-1,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"[asdfasdfasdf]\'sheet-1\'!A3","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B10","st":-1,"ed":-1,"children":[]}]}]}]}'
            );
        });

        it('nodeMaker performance', () => {
            const start = performance.now();

            for (let i = 0; i < 1000; i++) {
                lexerTreeBuilder.nodeMakerTest(
                    '=(-(1+2)--@A1:B2 + 5)/2 + -sum(indirect(A5):B10# + B6# + A1:offset(C5, 1, 1)  ,  100) + {1,2,3;4,5,6;7,8,10} + lambda(x,y,z, x*y*z)(sum(1,(1+2)*3),2,lambda(x,y, @offset(A1:B0,x#*y#))(1,2):C20) + sum((1+2%)*30%, 1+2)%'
                );
            }
            const end = performance.now();
            const elapsed = end - start; // 毫秒数

            // eslint-disable-next-line no-console
            console.log(`Elapsed time: ${elapsed} ms`);

            expect(elapsed).toBeGreaterThan(0);
        });

        it('error include function test', () => {
            const node = lexerTreeBuilder.treeBuilder('=sum(#REF! + 5 , #REF!)') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual(
                '{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"sum","st":0,"ed":2,"children":[{"token":"P_1","st":0,"ed":2,"children":["#REF!","5 ","+"]},{"token":"P_1","st":11,"ed":13,"children":["#REF!"]}]}]}'
            );
        });

        it('minus test', () => {
            const node = lexerTreeBuilder.treeBuilder('=2-1-1-1-1') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual('{"token":"R_1","st":-1,"ed":-1,"children":["2","1","-","1","-","1","-","1","-"]}');
        });

        it('minus test complex', () => {
            const node = lexerTreeBuilder.treeBuilder('= ( 2019-09-09 ) ') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual('{"token":"R_1","st":-1,"ed":-1,"children":["2019","09","-","09 ","-"]}');
        });

        it('sheet range', () => {
            const node = lexerTreeBuilder.treeBuilder('=SUM(SUM(Sheet5:Sheet6!A1:B10) + 100, 1)') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual('{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"SUM","st":0,"ed":2,"children":[{"token":"P_1","st":0,"ed":2,"children":[{"token":"SUM","st":4,"ed":6,"children":[{"token":"P_1","st":4,"ed":6,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"Sheet5","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"Sheet6!A1","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B10","st":-1,"ed":-1,"children":[]}]}]}]}]}]}]},"100","+"]},{"token":"P_1","st":32,"ed":34,"children":["1"]}]}]}');
        });

        it('minus ref', () => {
            const node = lexerTreeBuilder.treeBuilder('= 1--A1 ') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual('{"token":"R_1","st":-1,"ed":-1,"children":["1","-A1 ","-"]}');
        });

        it('negative ref', () => {
            const node = lexerTreeBuilder.treeBuilder('= ------A1 ') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual('{"token":"R_1","st":-1,"ed":-1,"children":["0","-","-","-","-","-A1 ","-"]}');
        });

        it('scientific notation', () => {
            const node = lexerTreeBuilder.treeBuilder('=3e+1+1') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual('{"token":"R_1","st":-1,"ed":-1,"children":["3e+1","1","+"]}');
        });

        it('parentheses and arithmetic', () => {
            const node = lexerTreeBuilder.treeBuilder('=-(+2)+2', false) as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual('{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"-","st":0,"ed":0,"children":[{"token":"P_1","st":-2,"ed":0,"children":["+","2"]}]},"+","2"]}');
        });

        it('ref:ref parser', () => {
            const node = lexerTreeBuilder.treeBuilder('=SUM(A6:B6:C6:D7,1,1,2)') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual('{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"SUM","st":0,"ed":2,"children":[{"token":"P_1","st":0,"ed":2,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"A6","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B6","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"C6","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"D7","st":-1,"ed":-1,"children":[]}]}]}]}]}]}]}]},{"token":"P_1","st":12,"ed":14,"children":["1"]},{"token":"P_1","st":14,"ed":16,"children":["1"]},{"token":"P_1","st":16,"ed":18,"children":["2"]}]}]}');
        });

        it('cube parser', () => {
            const node = lexerTreeBuilder.treeBuilder('=INDEX((A6:B6,C6:D7),1,1,2)') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual('{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"INDEX","st":0,"ed":4,"children":[{"token":"P_1","st":2,"ed":4,"children":[{"token":"CUBE","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"A6","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B6","st":-1,"ed":-1,"children":[]}]}]}]},{"token":"P_1","st":9,"ed":11,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"C6","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"D7","st":-1,"ed":-1,"children":[]}]}]}]}]}]},{"token":"P_1","st":16,"ed":18,"children":["1"]},{"token":"P_1","st":18,"ed":20,"children":["1"]},{"token":"P_1","st":20,"ed":22,"children":["2"]}]}]}');
        });

        it('no parameter function', () => {
            const node = lexerTreeBuilder.treeBuilder('=TODAY()') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual('{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"TODAY","st":0,"ed":4,"children":[]}]}');
        });

        it('no parameter function with bracket', () => {
            const node = lexerTreeBuilder.treeBuilder('=(TODAY())') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual('{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"TODAY","st":1,"ed":5,"children":[]}]}');
        });

        it('array parameter number', () => {
            const node = lexerTreeBuilder.treeBuilder('={-700000,120000,150000,180000,210000,260000}') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual('{"token":"R_1","st":-1,"ed":-1,"children":["{-700000,120000,150000,180000,210000,260000}"]}');
        });

        it('array parameter string', () => {
            const node = lexerTreeBuilder.treeBuilder('={"2007/1/1", "2008/1/1"}') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual('{"token":"R_1","st":-1,"ed":-1,"children":["{\\"2007/1/1\\", \\"2008/1/1\\"}"]}');
        });

        it('error as parameter', () => {
            const node = lexerTreeBuilder.treeBuilder('=sum(#NUM! + #VALUE!) + #SPILL! - (#CALC!)') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual('{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"sum","st":0,"ed":2,"children":[{"token":"P_1","st":0,"ed":2,"children":["#NUM!","#VALUE!","+"]}]},"#SPILL!","+","#CALC!","-"]}');
        });

        it('error type lexer function', () => {
            const node = lexerTreeBuilder.treeBuilder('=ERROR.TYPE(#DIV/0!)/ERROR.TYPE(#N/A)') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual('{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"ERROR.TYPE","st":0,"ed":9,"children":[{"token":"P_1","st":7,"ed":9,"children":["#DIV/0!"]}]},{"token":"ERROR.TYPE","st":20,"ed":29,"children":[{"token":"P_1","st":27,"ed":29,"children":["#N/A"]}]},"/"]}');
        });

        it('array error lexer text', () => {
            const node = lexerTreeBuilder.treeBuilder('=RANK({1,2,121,#NAME?},A1:F1,0)') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual('{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"RANK","st":0,"ed":3,"children":[{"token":"P_1","st":1,"ed":3,"children":["{1,2,121,#NAME?}"]},{"token":"P_1","st":18,"ed":20,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"A1","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"F1","st":-1,"ed":-1,"children":[]}]}]}]},{"token":"P_1","st":24,"ed":26,"children":["0"]}]}]}');
        });

        it('double minus for function', () => {
            const node = lexerTreeBuilder.treeBuilder('=SUM(--1*2)--A1-1') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual('{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"SUM","st":0,"ed":2,"children":[{"token":"P_1","st":0,"ed":2,"children":["0","-1","2","*","-"]}]},"-A1","-","1","-"]}');
        });

        it('double minus for formula Outside of Functions', () => {
            const node = lexerTreeBuilder.treeBuilder('=--1*2') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual('{"token":"R_1","st":-1,"ed":-1,"children":["0","-1","2","*","-"]}');
        });

        it('one minus for formula', () => {
            const node = lexerTreeBuilder.treeBuilder('=   -A1') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual('{"token":"R_1","st":-1,"ed":-1,"children":["-A1"]}');
        });

        it('operator with concatenate test', () => {
            const node = lexerTreeBuilder.treeBuilder('="a"&1+2') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual('{"token":"R_1","st":-1,"ed":-1,"children":["\\"a\\"","1","2","+","&"]}');
        });

        it('test lexer ref with at and minus', () => {
            const node = lexerTreeBuilder.treeBuilder('= --@A1:B10') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual('{"token":"R_1","st":-1,"ed":-1,"children":["0",{"token":"-","st":-1,"ed":-1,"children":[{"token":"@","st":-1,"ed":-1,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"A1","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B10","st":-1,"ed":-1,"children":[]}]}]}]}]},"-"]}');
        });

        it('test lexer ref with at and minus and plus', () => {
            const node = lexerTreeBuilder.treeBuilder('= --+@A1:B10') as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual('{"token":"R_1","st":-1,"ed":-1,"children":["0",{"token":"-","st":-1,"ed":-1,"children":[{"token":"@","st":-1,"ed":-1,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"A1","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B10","st":-1,"ed":-1,"children":[]}]}]}]}]},"-"]}');
        });
    });

    describe('check error', () => {
        it('plus token error', () => {
            const node = lexerTreeBuilder.treeBuilder('=-(2)+*9') as LexerNode;
            expect(node).toStrictEqual(ErrorType.VALUE);
        });

        it('blank in bracket', () => {
            const node = lexerTreeBuilder.treeBuilder('=()+9') as LexerNode;
            expect(node).toStrictEqual(ErrorType.VALUE);
        });

        it('plus null value', () => {
            const node = lexerTreeBuilder.treeBuilder('=1+(1*)') as LexerNode;
            expect(node).toStrictEqual(ErrorType.VALUE);
        });

        it('open bracket number', () => {
            const node = lexerTreeBuilder.treeBuilder('=(1+3)9') as LexerNode;
            expect(node).toStrictEqual(ErrorType.VALUE);
        });

        it('Error for spell check!', () => {
            const node = lexerTreeBuilder.treeBuilder('=PI()0.1') as LexerNode;
            expect(node).toStrictEqual(ErrorType.VALUE);
        });

        it('Sum error for spell check!', () => {
            const node = lexerTreeBuilder.treeBuilder('=sum(PI()0.1)') as LexerNode;
            expect(node).toStrictEqual(ErrorType.VALUE);
        });

        it('Braces together error!', () => {
            const node = lexerTreeBuilder.treeBuilder('=sum({}{})') as LexerNode;
            expect(node).toStrictEqual(ErrorType.VALUE);
        });

        it('Zero braces together error!', () => {
            const node = lexerTreeBuilder.treeBuilder('=sum({0}{0})') as LexerNode;
            expect(node).toStrictEqual(ErrorType.VALUE);
        });

        it('Lack braces error!', () => {
            const node = lexerTreeBuilder.treeBuilder('=sum((1)') as LexerNode;
            expect(node).toStrictEqual(ErrorType.VALUE);
        });
    });

    describe('checkIfAddBracket', () => {
        it('blank function bracket', () => {
            expect(lexerTreeBuilder.checkIfAddBracket('=sum(')).toStrictEqual(1);
        });

        it('normal function bracket', () => {
            expect(lexerTreeBuilder.checkIfAddBracket('=sum(A1:B10')).toStrictEqual(1);
        });

        it('lambda function bracket', () => {
            expect(lexerTreeBuilder.checkIfAddBracket('=lambda(x,y,x*y)(1,2')).toStrictEqual(1);
        });

        it('nest function bracket', () => {
            expect(lexerTreeBuilder.checkIfAddBracket('=sum(sum(sum(sum(A1:B2')).toStrictEqual(4);
        });

        it('nest blank function bracket', () => {
            expect(lexerTreeBuilder.checkIfAddBracket('=sum(sum(sum(sum(')).toStrictEqual(4);
        });

        // it('nest one function bracket', () => {
        //     expect(lexerTreeBuilder.checkIfAddBracket('=sum((1)')).toStrictEqual(1);
        // });
    });

    describe('sequenceNodesBuilder', () => {
        it('workbook ref build', () => {
            expect(lexerTreeBuilder.sequenceNodesBuilder('=[workbook-01]工作表11!G14:M20')).toStrictEqual([
                {
                    endIndex: 25,
                    nodeType: 4,
                    startIndex: 0,
                    token: '[workbook-01]工作表11!G14:M20',
                },
            ]);
        });

        it('special workbook ref build', () => {
            expect(lexerTreeBuilder.sequenceNodesBuilder('=\'[workbook-01]工作表11\'!G14:M20,\'[workbook-01]工作表11\'!K27:N32')).toStrictEqual([
                {
                    endIndex: 27,
                    nodeType: 4,
                    startIndex: 0,
                    token: "'[workbook-01]工作表11'!G14:M20",
                },
                ',',
                {
                    endIndex: 56,
                    nodeType: 4,
                    startIndex: 29,
                    token: "'[workbook-01]工作表11'!K27:N32",
                },
            ]);
        });

        it('cube', () => {
            expect(lexerTreeBuilder.sequenceNodesBuilder('=INDEX((A6:B6,C6:D7),1,1,2)')).toStrictEqual([
                {
                    endIndex: 4,
                    nodeType: 3,
                    startIndex: 0,
                    token: 'INDEX',
                },
                '(',
                '(',
                {
                    endIndex: 11,
                    nodeType: 4,
                    startIndex: 7,
                    token: 'A6:B6',
                },
                ',',
                {
                    endIndex: 17,
                    nodeType: 4,
                    startIndex: 13,
                    token: 'C6:D7',
                },
                ')',
                ',',
                {
                    endIndex: 20,
                    nodeType: 1,
                    startIndex: 20,
                    token: '1',
                },
                ',',
                {
                    endIndex: 22,
                    nodeType: 1,
                    startIndex: 22,
                    token: '1',
                },
                ',',
                {
                    endIndex: 24,
                    nodeType: 1,
                    startIndex: 24,
                    token: '2',
                },
                ')',
            ]);
        });

        it('No Parameter Function', () => {
            expect(lexerTreeBuilder.sequenceNodesBuilder('=today()+today()+column()')).toStrictEqual([
                {
                    endIndex: 4,
                    nodeType: 3,
                    startIndex: 0,
                    token: 'today',
                },
                '(',
                ')',
                '+',
                {
                    endIndex: 12,
                    nodeType: 3,
                    startIndex: 8,
                    token: 'today',
                },
                '(',
                ')',
                '+',
                {
                    endIndex: 21,
                    nodeType: 3,
                    startIndex: 16,
                    token: 'column',
                },
                '(',
                ')',
            ]);
        });

        it('No Parameter Today', () => {
            expect(lexerTreeBuilder.sequenceNodesBuilder('=IF(TODAY()>1,"TRUE", "FALSE")')).toStrictEqual([
                {
                    endIndex: 1,
                    nodeType: 3,
                    startIndex: 0,
                    token: 'IF',
                },
                '(',
                {
                    endIndex: 7,
                    nodeType: 3,
                    startIndex: 3,
                    token: 'TODAY',
                },
                '(',
                ')',
                '>',
                {
                    endIndex: 11,
                    nodeType: 1,
                    startIndex: 11,
                    token: '1',
                },
                ',',
                {
                    endIndex: 18,
                    nodeType: 2,
                    startIndex: 13,
                    token: '"TRUE"',
                },
                ',',
                ' ',
                {
                    endIndex: 27,
                    nodeType: 2,
                    startIndex: 21,
                    token: '"FALSE"',
                },
                ')',
            ]);
        });

        it('Great than or equal', () => {
            expect(lexerTreeBuilder.sequenceNodesBuilder('=A1:B10>=100')).toStrictEqual([
                {
                    endIndex: 5,
                    nodeType: 4,
                    startIndex: 0,
                    token: 'A1:B10',
                },
                '>',
                '=',
                {
                    endIndex: 10,
                    nodeType: 1,
                    startIndex: 8,
                    token: '100',
                },
            ]);
        });

        it('Array format for sequence', () => {
            expect(lexerTreeBuilder.sequenceNodesBuilder('={"2007/1/1", "2008/1/1"}')).toStrictEqual([{
                endIndex: 23,
                nodeType: 5,
                startIndex: 0,
                token: '{"2007/1/1", "2008/1/1"}',
            }]);
        });

        it('Array bracket double for sequence', () => {
            expect(lexerTreeBuilder.sequenceNodesBuilder('=-(A31:A38="AAA")-  (A31:A38="AAA")')).toStrictEqual(
                [
                    '-',
                    '(',
                    {
                        endIndex: 8,
                        nodeType: 4,
                        startIndex: 2,
                        token: 'A31:A38',
                    },
                    '=',
                    {
                        endIndex: 14,
                        nodeType: 2,
                        startIndex: 10,
                        token: '"AAA"',
                    },
                    ')',
                    '-',
                    ' ',
                    ' ',
                    '(',
                    {
                        endIndex: 26,
                        nodeType: 4,
                        startIndex: 20,
                        token: 'A31:A38',
                    },
                    '=',
                    {
                        endIndex: 32,
                        nodeType: 2,
                        startIndex: 28,
                        token: '"AAA"',
                    },
                    ')',
                ]
            );
        });

        it('multi blank to minus formula', () => {
            expect(lexerTreeBuilder.sequenceNodesBuilder('=      -A1')).toStrictEqual(
                [
                    ' ',
                    ' ',
                    ' ',
                    ' ',
                    ' ',
                    ' ',
                    {
                        endIndex: 6,
                        nodeType: 0,
                        startIndex: 6,
                        token: '-',
                    },
                    {
                        endIndex: 8,
                        nodeType: 4,

                        startIndex: 7,
                        token: 'A1',
                    },
                ]
            );
        });

        it('one minus sequences error', () => {
            expect(lexerTreeBuilder.sequenceNodesBuilder('=-\r\n')).toStrictEqual(
                [
                    {
                        endIndex: 1,
                        nodeType: 3,
                        startIndex: 0,
                        token: '- ',
                    },
                ]
            );
        });

        it('test tow minus for range ref', () => {
            expect(lexerTreeBuilder.sequenceNodesBuilder('=  --A1:A10')).toStrictEqual(
                [
                    ' ',
                    ' ',
                    '-',
                    {
                        endIndex: 3,
                        nodeType: 0,
                        startIndex: 3,
                        token: '-',
                    },
                    {
                        endIndex: 9,
                        nodeType: 4,
                        startIndex: 4,
                        token: 'A1:A10',
                    },
                ]
            );
        });

        it('test sequence ref with at and minus', () => {
            expect(lexerTreeBuilder.sequenceNodesBuilder('=  --@A1:A10')).toStrictEqual(
                [
                    ' ',
                    ' ',
                    '-',
                    {
                        endIndex: 4,
                        nodeType: 0,
                        startIndex: 3,
                        token: '-@',
                    },
                    {
                        endIndex: 10,
                        nodeType: 4,
                        startIndex: 5,
                        token: 'A1:A10',
                    },
                ]
            );
        });
    });

    describe('convertRefersToAbsolute', () => {
        it('Formula All', () => {
            const result = lexerTreeBuilder.convertRefersToAbsolute('=sum(A1:B1,A1:B1,A1:B1,A1:B1)', AbsoluteRefType.ALL, AbsoluteRefType.ALL);
            expect(result).toStrictEqual('=sum($A$1:$B$1,$A$1:$B$1,$A$1:$B$1,$A$1:$B$1)');
        });

        it('Range All', () => {
            const result = lexerTreeBuilder.convertRefersToAbsolute('A1:B1,A1:B1,A1:B1,A1:B1', AbsoluteRefType.ALL, AbsoluteRefType.ALL);
            expect(result).toStrictEqual('$A$1:$B$1,$A$1:$B$1,$A$1:$B$1,$A$1:$B$1');
        });

        it('Formula Column', () => {
            const result = lexerTreeBuilder.convertRefersToAbsolute('=sum(A1:B1,A1:B1,A1:B1,A1:B1)', AbsoluteRefType.COLUMN, AbsoluteRefType.COLUMN);
            expect(result).toStrictEqual('=sum($A1:$B1,$A1:$B1,$A1:$B1,$A1:$B1)');
        });

        it('Range Column', () => {
            const result = lexerTreeBuilder.convertRefersToAbsolute('A1:B1,A1:B1,A1:B1,A1:B1', AbsoluteRefType.COLUMN, AbsoluteRefType.COLUMN);
            expect(result).toStrictEqual('$A1:$B1,$A1:$B1,$A1:$B1,$A1:$B1');
        });

        it('Formula Row', () => {
            const result = lexerTreeBuilder.convertRefersToAbsolute('=sum(A1:B1,A1:B1,A1:B1,A1:B1)', AbsoluteRefType.ROW, AbsoluteRefType.ROW);
            expect(result).toStrictEqual('=sum(A$1:B$1,A$1:B$1,A$1:B$1,A$1:B$1)');
        });

        it('Range Row', () => {
            const result = lexerTreeBuilder.convertRefersToAbsolute('A1:B1,A1:B1,A1:B1,A1:B1', AbsoluteRefType.ROW, AbsoluteRefType.ROW);
            expect(result).toStrictEqual('A$1:B$1,A$1:B$1,A$1:B$1,A$1:B$1');
        });

        it('Complex Formula', () => {
            const result = lexerTreeBuilder.convertRefersToAbsolute('=SUM(A1:B10) + LAMBDA(x, y, x*y*x)(A1:B10, A10) + MAX(A1:B10,SUM(A2))', AbsoluteRefType.ALL, AbsoluteRefType.ALL);
            expect(result).toStrictEqual('=SUM($A$1:$B$10) + LAMBDA(x, y, x*y*x)($A$1:$B$10, $A$10) + MAX($A$1:$B$10,SUM($A$2))');
        });

        it('manually set current sheet name', () => {
            let result = lexerTreeBuilder.convertRefersToAbsolute('=A1:B2', AbsoluteRefType.ALL, AbsoluteRefType.ALL, 'Sheet1');
            expect(result).toStrictEqual('=Sheet1!$A$1:$B$2');
            result = lexerTreeBuilder.convertRefersToAbsolute('=A1:B2,C1:D2,F3:G5', AbsoluteRefType.ALL, AbsoluteRefType.ALL, 'Sheet1');
            expect(result).toStrictEqual('=Sheet1!$A$1:$B$2,Sheet1!$C$1:$D$2,Sheet1!$F$3:$G$5');
        });
    });

    describe('moveFormulaRefOffset', () => {
        it('move all', () => {
            const result = lexerTreeBuilder.moveFormulaRefOffset('=sum(A1:B1)', 1, 1, false);
            expect(result).toStrictEqual('=sum(B2:C2)');
        });

        it('move not first column', () => {
            const result = lexerTreeBuilder.moveFormulaRefOffset('=sum($A1:B1)', 1, 1, false);
            expect(result).toStrictEqual('=sum($A2:C2)');
        });

        it('move not first row', () => {
            const result = lexerTreeBuilder.moveFormulaRefOffset('=sum(A$1:$B1)', 1, 1, false);
            expect(result).toStrictEqual('=sum(B$1:$B2)');
        });

        it('move only column', () => {
            const result = lexerTreeBuilder.moveFormulaRefOffset('=sum(A:B)', 1, 1, false);
            expect(result).toStrictEqual('=sum(B:C)');
        });

        it('move only column absolute end', () => {
            const result = lexerTreeBuilder.moveFormulaRefOffset('=sum(A:$B)', 1, 1, false);
            expect(result).toStrictEqual('=sum(B:$B)');
        });

        it('move only column absolute all', () => {
            const result = lexerTreeBuilder.moveFormulaRefOffset('=sum($A:$B)', 1, 1, false);
            expect(result).toStrictEqual('=sum($A:$B)');
        });

        it('move only row absolute end', () => {
            const result = lexerTreeBuilder.moveFormulaRefOffset('=sum(1:$3)', 1, 1, false);
            expect(result).toStrictEqual('=sum(2:$3)');
        });

        it('move only row absolute all', () => {
            const result = lexerTreeBuilder.moveFormulaRefOffset('=sum($1:$3)', 1, 1, false);
            expect(result).toStrictEqual('=sum($1:$3)');
        });

        it('move omit absolute all', () => {
            const result = lexerTreeBuilder.moveFormulaRefOffset('=sum($A$1:$B$3)', 1, 1, true);
            expect(result).toStrictEqual('=sum($B$2:$C$4)');
        });

        it('move omit absolute column', () => {
            const result = lexerTreeBuilder.moveFormulaRefOffset('=sum(A$1:B$3)', 1, 1, true);
            expect(result).toStrictEqual('=sum(B$2:C$4)');
        });

        it('sheet name quote', () => {
            let result = lexerTreeBuilder.moveFormulaRefOffset("= 'dv-test'!F26", 0, 1, true);
            expect(result).toStrictEqual("= 'dv-test'!F27");

            result = lexerTreeBuilder.moveFormulaRefOffset("=SUM( 'dv-test'!F26)", 0, 1, true);
            expect(result).toStrictEqual("=SUM( 'dv-test'!F27)");

            result = lexerTreeBuilder.moveFormulaRefOffset("=SUM( 'dv-test'!F26)", 0, -1, true);
            expect(result).toStrictEqual("=SUM( 'dv-test'!F25)");

            result = lexerTreeBuilder.moveFormulaRefOffset("=SUM( 'dv-test'!F26)", 1, 0, true);
            expect(result).toStrictEqual("=SUM( 'dv-test'!G26)");

            result = lexerTreeBuilder.moveFormulaRefOffset("=SUM( 'dv-test'!F26)", -1, 0, true);
            expect(result).toStrictEqual("=SUM( 'dv-test'!E26)");
        });
    });

    describe('bad cases from users', () => {
        it('univer-pro #4120', () => {
            // The space before [workbook4] will lead to error.
            const node = lexerTreeBuilder.treeBuilder("'[workbook1]Sheet 01'!A5* [workbook4]aaa!A5") as LexerNode;
            expect(node.serialize()).toStrictEqual(
                { token: 'R_1', st: -1, ed: -1, children: [
                    "'[workbook1]Sheet 01'!A5",
                    '[workbook4]aaa!A5',
                    '*',
                ] }
            );
        });
    });
});
