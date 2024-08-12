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
import type { IBullet, ICustomRange, IDocumentData, ITextRun, ITextStyle } from '../../../types/interfaces';
import { CustomRangeType, DocumentFlavor } from '../../../types/interfaces';
import { BooleanNumber } from '../../../types/enum';
import { normalizeTextRuns } from '../../data-model/text-x/apply-utils/common';
import { generateRandomId, Tools } from '../../../shared';
import { DataStreamTreeTokenType, PresetListType } from '../../data-model';

function addParagraphToken(docData: Partial<IDocumentData>, bullet?: IBullet) {
    const body = docData.body!;

    body.paragraphs?.push({
        startIndex: body.dataStream.length,
        paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 },
        },
        bullet,
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

function addLinkToResource(docData: Partial<IDocumentData>, link: { id: string; payload: string }) {
    let resource = docData.resources?.find((r) => r.name === 'DOC_HYPER_LINK_PLUGIN');

    if (!resource) {
        resource = {
            id: 'DOC_HYPER_LINK_PLUGIN',
            name: 'DOC_HYPER_LINK_PLUGIN',
            data: '{"links":[]}',
        };
        docData.resources = [
            ...docData.resources ?? [],
            resource,
        ];
    }

    resource.data = JSON.stringify(
        {
            links: [
                ...JSON.parse(resource.data)?.links ?? [],
                link,
            ],
        }
    );
}

interface IListCache {
    token: (Tokens.List | Tokens.Generic);
    id: string;
    listItemCache: (Tokens.ListItem | Tokens.Generic)[];
}

export class MarkdownToDocumentConvertor {
    private _headingCache: (Tokens.Heading | Tokens.Generic)[] = [];
    private _listCache: IListCache[] = [];
    private _strongCache: (Tokens.Strong | Tokens.Generic)[] = [];
    private _linkCache: (Tokens.Link | Tokens.Generic)[] = [];

    get _listItemCache() {
        return this._listCache[this._listCache.length - 1].listItemCache;
    }

    constructor(private readonly _markdown: string) {}

    convert() {
        const tokens = marked.lexer(this._markdown, { async: false, gfm: true });

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
            resources: [{
                id: 'DOC_HYPER_LINK_PLUGIN',
                name: 'DOC_HYPER_LINK_PLUGIN',
                data: '{"links":[]}',
            }],
        };

        // console.log(tokens);

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
                    this._listCache.push({ token, id: generateRandomId(6), listItemCache: [] });

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
                    this._processString(token, docData);
                    break;
                }

                case 'link': {
                    this._linkCache.push(token);
                    if (token.tokens?.length) {
                        this._process(token.tokens, docData);
                    }
                    this._linkCache.pop();
                    break;
                }

                default: {
                    break;
                }
            }
        }
    }

    private _processString(token: Tokens.Strong | Tokens.Generic, docData: Partial<IDocumentData>) {
        this._strongCache.push(token);

        if (token.tokens?.length) {
            this._process(token.tokens, docData);
        }

        this._strongCache.pop();
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
                const list = this._listCache[this._listCache.length - 1];
                const parent = this._listItemCache[this._listItemCache.length - 1];
                const bullet: IBullet = {
                    listId: list.id,
                    listType: parent.task ? parent.checked ? PresetListType.CHECK_LIST_CHECKED : PresetListType.CHECK_LIST : list.token.ordered ? PresetListType.ORDER_LIST : PresetListType.BULLET_LIST,
                    nestingLevel: this._listItemCache.length - 1,
                };
                addParagraphToken(docData, bullet);
            }
        } else {
            let text = token.text.replaceAll('\n', ' ');
            if (this._linkCache.length) {
                text = `${DataStreamTreeTokenType.CUSTOM_RANGE_START}${text}${DataStreamTreeTokenType.CUSTOM_RANGE_END}`;
            }
            const body = docData.body!;
            const textRun = this._getTextRun(text, docData);

            if (this._linkCache.length) {
                const link = this._linkCache[this._linkCache.length - 1];
                const customRange: ICustomRange = {
                    rangeId: generateRandomId(6),
                    rangeType: CustomRangeType.HYPERLINK,
                    startIndex: body.dataStream.length,
                    endIndex: body.dataStream.length + text.length - 1,
                };
                body.customRanges = [
                    ...body.customRanges ?? [],
                    customRange,
                ];
                addLinkToResource(docData, { id: customRange.rangeId, payload: link.href });
            }

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
