/**
 * Copyright 2023-present DreamNum Inc.
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

import type { Token, Tokens } from 'marked';
import { marked } from 'marked';
import { DocumentFlavor, type IDocumentData, type ITextRun, type ITextStyle } from '../../../types/interfaces';
import { BooleanNumber } from '../../../types/enum';
import { normalizeTextRuns } from '../../data-model/text-x/apply-utils/common';

function addParagraphToken(docData: Partial<IDocumentData>) {
    const body = docData.body!;

    body.paragraphs?.push({
        startIndex: body.dataStream.length,
        paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 },
        },
    });

    body.dataStream += '\r';
}

function addSectionBreakToken(docData: Partial<IDocumentData>) {
    const body = docData.body!;

    body.sectionBreaks?.push({
        startIndex: body.dataStream.length,
    });

    body.dataStream += '\n';
}

export class MarkdownToDocumentConvertor {
    private _headingCache: (Tokens.Heading | Tokens.Generic)[] = [];
    private _listCache: (Tokens.ListItem | Tokens.Generic)[] = [];
    private _listItemCache: (Tokens.ListItem | Tokens.Generic)[] = [];
    private _strongCache: (Tokens.Strong | Tokens.Generic)[] = [];

    constructor(private readonly _markdown: string) {}

    convert() {
        const tokens = marked.lexer(this._markdown, { async: false });

        const docData: IDocumentData = {
            id: '',
            drawingsOrder: [],
            drawings: {},
            tableSource: {},
            footers: {},
            headers: {},
            lists: {},
            body: {
                dataStream: '',
                textRuns: [],
                tables: [],
                customBlocks: [],
                paragraphs: [],
                sectionBreaks: [],
            },
            documentStyle: {
                pageSize: {
                    width: 595 / 0.75,
                    height: 842 / 0.75,
                },
                marginTop: 50,
                marginBottom: 50,
                marginRight: 40,
                marginLeft: 40,
                documentFlavor: DocumentFlavor.TRADITIONAL,
                renderConfig: {
                    vertexAngle: 0,
                    centerAngle: 0,
                },
            },
            settings: {},

        };

        this._process(tokens, docData);

        docData.body!.textRuns = normalizeTextRuns(docData.body?.textRuns ?? []);

        addSectionBreakToken(docData);

        return docData;
    }

    private _process(tokens: Token[], docData: Partial<IDocumentData>) {
        for (const token of tokens) {
            switch (token.type) {
                case 'heading': {
                    this._processHeading(token, docData);
                    break;
                }

                case 'paragraph': {
                    this._processParagraph(token, docData);
                    break;
                }

                case 'space': {
                    this._processSpace(docData);
                    break;
                }

                case 'list': {
                    this._listCache.push(token);

                    if (token.items?.length) {
                        this._process(token.items, docData);
                    }

                    this._listCache.pop();
                    break;
                }

                case 'list_item': {
                    this._listItemCache.push(token);

                    if (token.tokens?.length) {
                        this._process(token.tokens, docData);
                    }

                    this._listItemCache.pop();

                    break;
                }

                case 'text': {
                    this._processText(token, docData);
                    break;
                }

                case 'strong': {
                    this._strongCache.push(token);

                    if (token.tokens?.length) {
                        this._process(token.tokens, docData);
                    }

                    this._strongCache.pop();
                    break;
                }

                default: {
                    break;
                }
            }
        }
    }

    private _processHeading(token: Tokens.Heading | Tokens.Generic, docData: Partial<IDocumentData>) {
        this._headingCache.push(token);
        if (token.tokens?.length) {
            this._process(token.tokens, docData);
        }
        this._headingCache.pop();

        addParagraphToken(docData);
    }

    private _processParagraph(token: Tokens.Paragraph | Tokens.Generic, docData: Partial<IDocumentData>) {
        if (token.tokens?.length) {
            this._process(token.tokens, docData);
        }

        addParagraphToken(docData);
    }

    private _processSpace(docData: Partial<IDocumentData>) {
        addParagraphToken(docData);
    }

    private _processText(token: Tokens.Text | Tokens.Generic | Tokens.Tag, docData: Partial<IDocumentData>) {
        if ((token as Tokens.Text | Tokens.Generic).tokens?.length) {
            this._process((token as Tokens.Text | Tokens.Generic).tokens!, docData);

            // add paragraph token if text token is the child of list item.
            if (this._listItemCache.length) {
                addParagraphToken(docData);
            }
        } else {
            const text = token.text;
            const body = docData.body!;
            const textRun = this._getTextRun(text, docData);

            body.dataStream += text;
            body.textRuns!.push(textRun);
        }
    }

    private _getTextRun(text: string, docData: Partial<IDocumentData>): ITextRun {
        const body = docData.body!;
        const st = body.dataStream.length;
        const ed = st + text.length;

        const ts: ITextStyle = {};

        if (this._headingCache.length) {
            const heading = this._headingCache[this._headingCache.length - 1];
            const { depth } = heading;

            ts.fs = 16 + (6 - depth) * 3;
            // Set heading bold to true.
            ts.bl = BooleanNumber.TRUE;
        }

        if (this._strongCache.length) {
            ts.bl = BooleanNumber.TRUE;
        }

        return {
            st,
            ed,
            ts,
        };
    }
}
