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

import type { ITextRange } from '../../../../sheets/typedef';
import type { ICustomTable, IParagraph, IParagraphStyle, ITextStyle } from '../../../../types/interfaces';
import type { DocumentDataModel } from '../../document-data-model';
import { MemoryCursor } from '../../../../common/memory-cursor';
import { Tools, UpdateDocsAttributeType } from '../../../../shared';
import { PRESET_LIST_TYPE, PresetListType } from '../../preset-list-type';
import { TextXActionType } from '../action-types';
import { TextX } from '../text-x';
import { getParagraphsInRanges } from './selection';

export interface ISwitchParagraphBulletParams {
    paragraphs: IParagraph[];
    listType: string;
    segmentId?: string;
    document: DocumentDataModel;
}

export const switchParagraphBullet = (params: ISwitchParagraphBulletParams) => {
    const { paragraphs: currentParagraphs, segmentId, document: docDataModel } = params;
    let listType = params.listType;
    const paragraphs = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()?.paragraphs ?? [];
    const isAlreadyList = currentParagraphs.every((paragraph) => paragraph.bullet?.listType.indexOf(listType) === 0);

    const ID_LENGTH = 6;

    let listId = Tools.generateRandomId(ID_LENGTH);

    if (currentParagraphs.length === 1) {
        const curIndex = paragraphs.indexOf(currentParagraphs[0]);
        const prevParagraph = paragraphs[curIndex - 1];
        const nextParagraph = paragraphs[curIndex + 1];

        if (prevParagraph && prevParagraph.bullet && prevParagraph.bullet.listType.indexOf(listType) === 0) {
            listId = prevParagraph.bullet.listId;
            if (listType !== PresetListType.CHECK_LIST) {
                listType = prevParagraph.bullet.listType;
            }
        } else if (nextParagraph && nextParagraph.bullet && nextParagraph.bullet.listType.indexOf(listType) === 0) {
            listId = nextParagraph.bullet.listId;
            if (listType !== PresetListType.CHECK_LIST) {
                listType = nextParagraph.bullet.listType;
            }
        }
    }

    const memoryCursor = new MemoryCursor();

    memoryCursor.reset();

    const textX = new TextX();

    for (const paragraph of currentParagraphs) {
        const { startIndex, paragraphStyle = {}, bullet } = paragraph;

        textX.push({
            t: TextXActionType.RETAIN,
            len: startIndex - memoryCursor.cursor,
        });

        textX.push({
            t: TextXActionType.RETAIN,
            len: 1,
            body: {
                dataStream: '',
                paragraphs: [
                    isAlreadyList
                        ? {
                            paragraphStyle,
                            startIndex: 0,
                        }
                        : {
                            startIndex: 0,
                            paragraphStyle: {
                                ...paragraphStyle,
                            },
                            bullet: {
                                nestingLevel: bullet?.nestingLevel ?? 0,
                                textStyle: {
                                    fs: 20,
                                },
                                listType,
                                listId,
                            },
                        },
                ],
            },
            coverType: UpdateDocsAttributeType.REPLACE,
        });

        memoryCursor.moveCursorTo(startIndex + 1);
    }

    return textX;
};

export interface IToggleChecklistParagraphParams {
    paragraphIndex: number;
    segmentId?: string;
    document: DocumentDataModel;
}

export const toggleChecklistParagraph = (params: IToggleChecklistParagraphParams) => {
    const { paragraphIndex, segmentId, document: docDataModel } = params;
    const paragraphs = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()?.paragraphs;
    if (paragraphs == null) {
        return false;
    }

    const currentParagraph = paragraphs.find((p) => p.startIndex === paragraphIndex);

    if (!currentParagraph?.bullet || currentParagraph.bullet.listType.indexOf(PresetListType.CHECK_LIST) === -1) {
        return false;
    }

    const memoryCursor = new MemoryCursor();
    memoryCursor.reset();

    const textX = new TextX();

    const { startIndex, paragraphStyle = {} } = currentParagraph;
    const listType = currentParagraph.bullet.listType === PresetListType.CHECK_LIST ?
        PresetListType.CHECK_LIST_CHECKED
        : PresetListType.CHECK_LIST;

    textX.push({
        t: TextXActionType.RETAIN,
        len: startIndex - memoryCursor.cursor,
    });

    textX.push({
        t: TextXActionType.RETAIN,
        len: 1,
        body: {
            dataStream: '',
            paragraphs: [
                {
                    ...currentParagraph,
                    paragraphStyle,
                    startIndex: 0,
                    bullet: {
                        ...currentParagraph.bullet,
                        listType,
                    },
                },
            ],
        },
        coverType: UpdateDocsAttributeType.REPLACE,
    });

    memoryCursor.moveCursorTo(startIndex + 1);

    return textX;
};

export interface ISetParagraphBulletParams {
    paragraphs: IParagraph[];
    listType: string;
    segmentId?: string;
    document: DocumentDataModel;
}

export const setParagraphBullet = (params: ISetParagraphBulletParams) => {
    const { paragraphs: currentParagraphs, listType, segmentId, document: docDataModel } = params;
    const paragraphs = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()?.paragraphs;

    if (paragraphs == null) {
        return false;
    }

    const ID_LENGTH = 6;
    const listId = Tools.generateRandomId(ID_LENGTH);

    const memoryCursor = new MemoryCursor();

    memoryCursor.reset();

    const textX = new TextX();

    for (const paragraph of currentParagraphs) {
        const { startIndex, paragraphStyle = {}, bullet } = paragraph;

        textX.push({
            t: TextXActionType.RETAIN,
            len: startIndex - memoryCursor.cursor,
        });

        textX.push({
            t: TextXActionType.RETAIN,
            len: 1,
            body: {
                dataStream: '',
                paragraphs: [
                    {
                        startIndex: 0,
                        paragraphStyle,
                        bullet: {
                            nestingLevel: bullet?.nestingLevel ?? 0,
                            textStyle: bullet?.listType === listType
                                ? bullet.textStyle
                                : {
                                    fs: 20,
                                },
                            listType,
                            listId,
                        },
                    },
                ],
            },
            coverType: UpdateDocsAttributeType.REPLACE,
        });

        memoryCursor.moveCursorTo(startIndex + 1);
    }

    return textX;
};

export interface IChangeParagraphBulletNestLevelParams {
    paragraphs: IParagraph[];
    segmentId?: string;
    document: DocumentDataModel;
    type: 1 | -1;
}

export function hasParagraphInTable(paragraph: IParagraph, tables: ICustomTable[]) {
    return tables.some((table) => paragraph.startIndex > table.startIndex && paragraph.startIndex < table.endIndex);
}

export const changeParagraphBulletNestLevel = (params: IChangeParagraphBulletNestLevelParams) => {
    const { paragraphs: currentParagraphs, document: docDataModel, type } = params;
    const memoryCursor = new MemoryCursor();

    memoryCursor.reset();

    const textX = new TextX();

    const customLists = docDataModel.getSnapshot().lists ?? {};
    const tables = docDataModel.getBody()?.tables ?? [];

    const lists = {
        ...PRESET_LIST_TYPE,
        ...customLists,
    };

    for (const paragraph of currentParagraphs) {
        const { startIndex, paragraphStyle = {}, bullet } = paragraph;
        const isInTable = hasParagraphInTable(paragraph, tables);

        textX.push({
            t: TextXActionType.RETAIN,
            len: startIndex - memoryCursor.cursor,
        });

        if (bullet) {
            const listType = bullet.listType as keyof typeof lists;
            let maxLevel = lists[listType].nestingLevel.length - 1;
            if (isInTable) {
                maxLevel = Math.min(maxLevel, 2);
            }

            textX.push({
                t: TextXActionType.RETAIN,
                len: 1,
                body: {
                    dataStream: '',
                    paragraphs: [
                        {
                            startIndex: 0,
                            paragraphStyle: {
                                ...paragraphStyle,
                            },
                            bullet: {
                                ...bullet,
                                nestingLevel: Math.max(Math.min(bullet.nestingLevel + type, maxLevel), 0),
                            },
                        },
                    ],
                },
                coverType: UpdateDocsAttributeType.REPLACE,
            });
        } else {
            // TODO: in this case, should set indent to paragraph
            textX.push({
                t: TextXActionType.RETAIN,
                len: 1,
            });
        }

        memoryCursor.moveCursorTo(startIndex + 1);
    }

    return textX;
};

export interface ISetParagraphStyleParams {
    textRanges: readonly ITextRange[];
    segmentId?: string;
    document: DocumentDataModel;
    style: IParagraphStyle;
    paragraphTextRun?: ITextStyle;
    cursor?: number;
    deleteLen?: number;
    textX?: TextX;
}

// eslint-disable-next-line max-lines-per-function
export const setParagraphStyle = (params: ISetParagraphStyleParams) => {
    const {
        textRanges,
        segmentId,
        document: docDataModel,
        style,
        paragraphTextRun,
        cursor,
        deleteLen,
        textX: _textX,
    } = params;
    const segment = docDataModel.getSelfOrHeaderFooterModel(segmentId);
    const paragraphs = segment.getBody()?.paragraphs ?? [];
    const dataStream = segment.getBody()?.dataStream ?? '';
    const currentParagraphs = getParagraphsInRanges(textRanges, paragraphs, dataStream);
    const memoryCursor = new MemoryCursor();
    if (cursor) {
        memoryCursor.moveCursorTo(cursor);
    }
    const textX = _textX ?? new TextX();
    currentParagraphs.sort((a, b) => a.startIndex - b.startIndex);
    const start = Math.max(0, currentParagraphs[0].paragraphStart - 1);

    if (start > memoryCursor.cursor) {
        textX.push({
            t: TextXActionType.RETAIN,
            len: start - memoryCursor.cursor,
        });
        memoryCursor.moveCursorTo(start);
    }

    if (deleteLen) {
        textX.push({
            t: TextXActionType.DELETE,
            len: deleteLen,
        });
    }

    for (const paragraph of currentParagraphs) {
        const { startIndex, paragraphStyle = {} } = paragraph;
        const len = startIndex - memoryCursor.cursor;
        textX.push({
            t: TextXActionType.RETAIN,
            len,
            ...paragraphTextRun
                ? {
                    body: {
                        dataStream: '',
                        textRuns: [{
                            ts: paragraphTextRun,
                            st: 0,
                            ed: len,
                        }],
                    },
                    coverType: UpdateDocsAttributeType.REPLACE,
                }
                : null,
        });

        textX.push({
            t: TextXActionType.RETAIN,
            len: 1,
            body: {
                dataStream: '',
                paragraphs: [
                    {
                        startIndex: 0,
                        paragraphStyle: {
                            ...paragraphStyle,
                            ...style,
                        },
                    },
                ],
            },
            coverType: UpdateDocsAttributeType.REPLACE,
        });

        memoryCursor.moveCursorTo(startIndex + 1);
    }

    return textX;
};
