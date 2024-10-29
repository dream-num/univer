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

/* eslint-disable no-param-reassign */

import type { Nullable } from '../../../shared';
import type { ICustomRange, IDocumentBody, IParagraph, IParagraphStyle, ITextRun, ITextStyle } from '../../../types/interfaces';
import type { IRetainAction } from './action-types';
import { Tools, UpdateDocsAttributeType } from '../../../shared';
import { normalizeTextRuns } from './apply-utils/common';

enum TextXTransformType {
    // The properties on the target are always retained, and the properties on the origin are ignored.
    COVER,
    // Only properties that do not exist on the origin object and that exist on the target are kept.
    COVER_ONLY_NOT_EXISTED,
}

// eslint-disable-next-line max-lines-per-function, complexity
function transformTextRuns(
    originTextRuns: ITextRun[],
    targetTextRuns: ITextRun[],
    transformType: TextXTransformType
) {
    if (originTextRuns.length === 0) {
        return targetTextRuns;
    }

    targetTextRuns = Tools.deepClone(targetTextRuns);
    originTextRuns = Tools.deepClone(originTextRuns);

    const newUpdateTextRuns: ITextRun[] = [];
    const updateLength = targetTextRuns.length;
    const removeLength = originTextRuns.length;
    let updateIndex = 0;
    let removeIndex = 0;
    let pending: Nullable<ITextRun> = null;

    function pushPendingAndReturnStatus() {
        if (pending) {
            newUpdateTextRuns.push(pending);
            pending = null;
            return true;
        }

        return false;
    }

    while (updateIndex < updateLength && removeIndex < removeLength) {
        const { st: updateSt, ed: updateEd, ts: targetStyle } = targetTextRuns[updateIndex];
        const { st: removeSt, ed: removeEd, ts: originStyle, sId } = originTextRuns[removeIndex];
        let newTs: ITextStyle = {};

        if (transformType === TextXTransformType.COVER) {
            newTs = { ...targetStyle };
        } else {
            newTs = { ...targetStyle };

            if (originStyle) {
                const keys = Object.keys(originStyle);

                for (const key of keys) {
                    if (newTs[key as keyof ITextStyle]) {
                        delete newTs[key as keyof ITextStyle];
                    }
                }
            }
        }

        if (updateEd < removeSt) {
            if (!pushPendingAndReturnStatus()) {
                newUpdateTextRuns.push(targetTextRuns[updateIndex]);
            }

            updateIndex++;
        } else if (removeEd < updateSt) {
            if (!pushPendingAndReturnStatus()) {
                newUpdateTextRuns.push(originTextRuns[removeIndex]);
            }

            removeIndex++;
        } else {
            const newTextRun = {
                st: Math.min(updateSt, removeSt),
                ed: Math.max(updateSt, removeSt),
                ts: updateSt < removeSt ? { ...targetStyle } : { ...originStyle },
                sId: updateSt < removeSt ? undefined : sId,
            };
            if (newTextRun.ed > newTextRun.st) {
                newUpdateTextRuns.push();
            }

            newUpdateTextRuns.push({
                st: Math.max(updateSt, removeSt),
                ed: Math.min(updateEd, removeEd),
                ts: newTs,
                sId,
            });

            if (updateEd < removeEd) {
                updateIndex++;
                originTextRuns[removeIndex].st = updateEd;
                if (originTextRuns[removeIndex].st === originTextRuns[removeIndex].ed) {
                    removeIndex++;
                }
            } else {
                removeIndex++;
                targetTextRuns[updateIndex].st = removeEd;
                if (targetTextRuns[updateIndex].st === targetTextRuns[updateIndex].ed) {
                    updateIndex++;
                }
            }

            const pendingTextRun = {
                st: Math.min(updateEd, removeEd),
                ed: Math.max(updateEd, removeEd),
                ts: updateEd < removeEd ? { ...originStyle } : { ...targetStyle },
                sId: updateEd < removeEd ? sId : undefined,
            };

            pending = pendingTextRun.ed > pendingTextRun.st ? pendingTextRun : null;
        }
    }

    pushPendingAndReturnStatus();

    // If the last textRun is also disjoint, then the last textRun needs to be pushed in `newUpdateTextRun`
    const tempTopTextRun = newUpdateTextRuns[newUpdateTextRuns.length - 1];
    const updateLastTextRun = targetTextRuns[updateLength - 1];
    const removeLastTextRun = originTextRuns[removeLength - 1];

    if (tempTopTextRun.ed !== Math.max(updateLastTextRun.ed, removeLastTextRun.ed)) {
        if (updateLastTextRun.ed > removeLastTextRun.ed) {
            newUpdateTextRuns.push(updateLastTextRun);
        } else {
            newUpdateTextRuns.push(removeLastTextRun);
        }
    }

    return normalizeTextRuns(newUpdateTextRuns);
}

function transformCustomRanges(
    originCustomRanges: ICustomRange[],
    targetCustomRanges: ICustomRange[],
    transformType: TextXTransformType,
    coverType: UpdateDocsAttributeType = UpdateDocsAttributeType.COVER
): ICustomRange[] {
    if (originCustomRanges.length === 0) {
        return Tools.deepClone(targetCustomRanges);
    }

    if (coverType === UpdateDocsAttributeType.REPLACE) {
        return transformType === TextXTransformType.COVER_ONLY_NOT_EXISTED
            ? Tools.deepClone(originCustomRanges)
            : Tools.deepClone(targetCustomRanges);
    } else {
        throw new Error('CustomRanges is only supported in replace mode.');
    }
}

// At present, only the two properties of paragraphStyle and bullet are handled,
// paragraphStyle is treated separately, while bullet is treated as a whole because
// the properties in bullet are related

// eslint-disable-next-line complexity
function transformParagraph(
    originParagraph: IParagraph,
    targetParagraph: IParagraph,
    originCoverType: UpdateDocsAttributeType,
    targetCoverType: UpdateDocsAttributeType,
    transformType: TextXTransformType
): IParagraph {
    const paragraph: IParagraph = {
        startIndex: targetParagraph.startIndex,
    };

    if (targetParagraph.paragraphStyle) {
        paragraph.paragraphStyle = {
            ...targetParagraph.paragraphStyle,
        };

        if (originParagraph.paragraphStyle) {
            if (originCoverType === UpdateDocsAttributeType.REPLACE) {
                if (targetCoverType === UpdateDocsAttributeType.REPLACE) {
                    if (transformType === TextXTransformType.COVER_ONLY_NOT_EXISTED) {
                        paragraph.paragraphStyle = {
                            ...originParagraph.paragraphStyle,
                        };
                    }
                } else {
                    if (transformType === TextXTransformType.COVER_ONLY_NOT_EXISTED) {
                        const keys = Object.keys(originParagraph.paragraphStyle);

                        for (const key of keys) {
                            if (paragraph.paragraphStyle[key as keyof IParagraphStyle]) {
                                delete paragraph.paragraphStyle[key as keyof IParagraphStyle];
                            }
                        }
                    }
                }
            } else {
                if (targetCoverType === UpdateDocsAttributeType.REPLACE) {
                    if (transformType === TextXTransformType.COVER_ONLY_NOT_EXISTED) {
                        const keys = Object.keys(originParagraph.paragraphStyle);

                        for (const key of keys) {
                            if (originParagraph.paragraphStyle[key as keyof IParagraphStyle] !== undefined) {
                                paragraph.paragraphStyle[key as keyof IParagraphStyle] = originParagraph.paragraphStyle[key as keyof IParagraphStyle] as any;
                            }
                        }
                    }
                } else {
                    if (transformType === TextXTransformType.COVER_ONLY_NOT_EXISTED) {
                        const keys = Object.keys(originParagraph.paragraphStyle);

                        for (const key of keys) {
                            if (paragraph.paragraphStyle![key as keyof IParagraphStyle]) {
                                delete paragraph.paragraphStyle![key as keyof IParagraphStyle];
                            }
                        }
                    }
                }
            }
        }
    }

    if (originCoverType === UpdateDocsAttributeType.REPLACE && targetCoverType === UpdateDocsAttributeType.REPLACE) {
        paragraph.bullet = transformType === TextXTransformType.COVER_ONLY_NOT_EXISTED
            ? Tools.deepClone(originParagraph.bullet)
            : Tools.deepClone(targetParagraph.bullet);
    } else {
        if (originParagraph.bullet === undefined) {
            paragraph.bullet = Tools.deepClone(targetParagraph.bullet);
        } else {
            paragraph.bullet = transformType === TextXTransformType.COVER && targetParagraph.bullet
                ? Tools.deepClone(targetParagraph.bullet)
                : Tools.deepClone(originParagraph.bullet);
        }
    }

    return paragraph;
}

interface ITransformBodyResult {
    body: IDocumentBody;
    coverType: UpdateDocsAttributeType;
}

// eslint-disable-next-line max-lines-per-function, complexity
export function transformBody(
    thisAction: IRetainAction,
    otherAction: IRetainAction,
    priority: boolean = false
): ITransformBodyResult {
    const { body: thisBody, coverType: thisCoverType = UpdateDocsAttributeType.COVER } = thisAction;
    const { body: otherBody, coverType: otherCoverType = UpdateDocsAttributeType.COVER } = otherAction;

    if (thisBody == null || thisBody.dataStream !== '' || otherBody == null || otherBody.dataStream !== '') {
        throw new Error('Data stream is not supported in retain transform.');
    }

    const retBody: IDocumentBody = {
        dataStream: '',
    };

    const coverType = thisCoverType === UpdateDocsAttributeType.REPLACE || otherCoverType === UpdateDocsAttributeType.REPLACE
        ? UpdateDocsAttributeType.REPLACE
        : UpdateDocsAttributeType.COVER;

    const { textRuns: thisTextRuns = [], paragraphs: thisParagraphs = [], customRanges: thisCustomRanges = [] } = thisBody;
    const { textRuns: otherTextRuns = [], paragraphs: otherParagraphs = [], customRanges: otherCustomRanges = [] } = otherBody;

    let textRuns: ITextRun[] = [];
    if (priority) {
        textRuns = transformTextRuns(thisTextRuns, otherTextRuns, TextXTransformType.COVER_ONLY_NOT_EXISTED);
    } else {
        textRuns = transformTextRuns(thisTextRuns, otherTextRuns, TextXTransformType.COVER);
    }
    if (textRuns.length) {
        retBody.textRuns = textRuns;
    }

    let customRanges: ICustomRange[] = [];
    if (priority) {
        customRanges = transformCustomRanges(thisCustomRanges, otherCustomRanges, TextXTransformType.COVER_ONLY_NOT_EXISTED, thisCoverType);
    } else {
        customRanges = transformCustomRanges(thisCustomRanges, otherCustomRanges, TextXTransformType.COVER, thisCoverType);
    }

    if (customRanges.length) {
        retBody.customRanges = customRanges;
    }

    const paragraphs: IParagraph[] = [];

    let thisIndex = 0;
    let otherIndex = 0;

    while (thisIndex < thisParagraphs.length && otherIndex < otherParagraphs.length) {
        const thisParagraph = thisParagraphs[thisIndex];
        const otherParagraph = otherParagraphs[otherIndex];

        const { startIndex: thisStart } = thisParagraph;
        const { startIndex: otherStart } = otherParagraph;

        if (thisStart === otherStart) {
            let paragraph: IParagraph = {
                startIndex: thisStart,
            };

            if (priority) {
                paragraph = transformParagraph(
                    thisParagraph,
                    otherParagraph,
                    thisCoverType,
                    otherCoverType,
                    TextXTransformType.COVER_ONLY_NOT_EXISTED
                );
            } else {
                paragraph = transformParagraph(
                    thisParagraph,
                    otherParagraph,
                    thisCoverType,
                    otherCoverType,
                    TextXTransformType.COVER
                );
            }

            paragraphs.push(paragraph);
            thisIndex++;
            otherIndex++;
        } else if (thisStart < otherStart) {
            // paragraphs.push(Tools.deepClone(thisParagraph));
            thisIndex++;
        } else {
            paragraphs.push(Tools.deepClone(otherParagraph));
            otherIndex++;
        }
    }

    if (otherIndex < otherParagraphs.length) {
        paragraphs.push(...otherParagraphs.slice(otherIndex));
    }

    if (paragraphs.length) {
        retBody.paragraphs = paragraphs;
    }

    return {
        coverType,
        body: retBody,
    };
}
