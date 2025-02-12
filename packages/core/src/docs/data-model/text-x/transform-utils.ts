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

/* eslint-disable no-param-reassign */

import type { Nullable } from '../../../shared';
import type { IRetainAction } from './action-types';
import { Tools, UpdateDocsAttributeType } from '../../../shared';
import { CustomDecorationType, type ICustomDecoration, type ICustomRange, type IDocumentBody, type IParagraph, type IParagraphStyle, type ITextRun, type ITextStyle } from '../../../types/interfaces';
import { normalizeTextRuns } from './apply-utils/common';

enum TextXTransformType {
    // The properties on the target are always retained, and the properties on the origin are ignored.
    COVER,
    // Only properties that do not exist on the origin object and that exist on the target are kept.
    COVER_ONLY_NOT_EXISTED,
}

// eslint-disable-next-line max-lines-per-function, complexity
function transformTextRuns(
    originTextRuns: ITextRun[] | undefined,
    targetTextRuns: ITextRun[] | undefined,
    originCoverType: UpdateDocsAttributeType,
    targetCoverType: UpdateDocsAttributeType,
    transformType: TextXTransformType
): ITextRun[] | undefined {
    if (originTextRuns == null || targetTextRuns == null) {
        return targetTextRuns;
    }

    if (originTextRuns.length === 0 || targetTextRuns.length === 0) {
        return [];
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

            if (originCoverType === UpdateDocsAttributeType.COVER && targetCoverType === UpdateDocsAttributeType.REPLACE && originStyle) {
                newTs = Object.assign({}, originStyle, newTs);
            }
        } else {
            newTs = { ...targetStyle };

            if (originCoverType === UpdateDocsAttributeType.REPLACE) {
                if (targetCoverType === UpdateDocsAttributeType.REPLACE) {
                    // If they are all REPLACE types, the highest priority is retained when transforming.
                    newTs = { ...originStyle };
                } else {
                    // If the target action is COVER and has a low priority, then the origin field should not be cover.
                    if (targetStyle && originStyle) {
                        const keys = Object.keys(targetStyle);

                        for (const key of keys) {
                            if (originStyle[key as keyof ITextStyle]) {
                                delete newTs[key as keyof ITextStyle];
                            }
                        }
                    }
                }
            } else {
                // If the origin is of type Cover and the target action is of type REPLACE
                // and has a low priority, then all fields in origin should be copied to the target
                if (targetCoverType === UpdateDocsAttributeType.REPLACE) {
                    if (originStyle) {
                        const keys = Object.keys(originStyle);

                        for (const key of keys) {
                            if (originStyle[key as keyof ITextStyle] !== undefined) {
                                newTs[key as keyof ITextStyle] = originStyle[key as keyof ITextStyle] as any;
                            }
                        }
                    }
                } else {
                    // If they are all of the Cover type, then the fields in the Origin need to be deleted.
                    if (originStyle) {
                        const keys = Object.keys(originStyle);

                        for (const key of keys) {
                            if (newTs[key as keyof ITextStyle] !== undefined) {
                                delete newTs[key as keyof ITextStyle];
                            }
                        }
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

    return normalizeTextRuns(newUpdateTextRuns, true);
}

function transformCustomRanges(
    originCustomRanges: ICustomRange[] | undefined,
    targetCustomRanges: ICustomRange[] | undefined,
    originCoverType: UpdateDocsAttributeType,
    targetCoverType: UpdateDocsAttributeType,
    transformType: TextXTransformType
): ICustomRange[] | undefined {
    if (originCustomRanges == null || targetCustomRanges == null) {
        return targetCustomRanges;
    }

    if (originCustomRanges.length === 0 || targetCustomRanges.length === 0) {
        return [];
    }

    if (originCustomRanges.length > 1 || targetCustomRanges.length > 1) {
        throw new Error('CustomRanges is only supported transform for length one now.');
    }

    const originCustomRange = originCustomRanges[0];
    const targetCustomRange = targetCustomRanges[0];

    if (originCoverType === UpdateDocsAttributeType.REPLACE) {
        return transformType === TextXTransformType.COVER_ONLY_NOT_EXISTED
            ? [Tools.deepClone(originCustomRange)]
            : [Tools.deepClone(targetCustomRange)];
    } else {
        if (targetCoverType === UpdateDocsAttributeType.REPLACE) {
            const customRange: ICustomRange = Tools.deepClone(targetCustomRange);
            if (transformType === TextXTransformType.COVER_ONLY_NOT_EXISTED) {
                Object.assign(customRange, Tools.deepClone(originCustomRange));
            }

            return [customRange];
        } else {
            const customRange: ICustomRange = Tools.deepClone(targetCustomRange);
            if (transformType === TextXTransformType.COVER_ONLY_NOT_EXISTED) {
                Object.assign(customRange, Tools.deepClone(originCustomRange));

                // Because customRange behavior like REPLACE.
                // const keys = Object.keys(originCustomRange);

                // for (const key of keys) {
                //     // Should not delete `startIndex` and `endIndex`.
                //     if (customRange[key as keyof ICustomRange] !== undefined) {
                //         delete customRange[key as keyof ICustomRange];
                //     }
                // }
            }

            return [customRange];
        }
    }
}

// At present, only the two properties of paragraphStyle and bullet are handled,
// paragraphStyle is treated separately, while bullet is treated as a whole because
// the properties in bullet are related

// eslint-disable-next-line complexity, max-lines-per-function
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
        paragraph.paragraphStyle = Tools.deepClone(targetParagraph.paragraphStyle);

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
                            if (originParagraph.paragraphStyle[key as keyof IParagraphStyle] !== undefined) {
                                paragraph.paragraphStyle[key as keyof IParagraphStyle] = originParagraph.paragraphStyle[key as keyof IParagraphStyle] as any;
                            }
                        }
                    } else {
                        const keys = Object.keys(originParagraph.paragraphStyle);

                        for (const key of keys) {
                            if (paragraph.paragraphStyle[key as keyof IParagraphStyle] === undefined) {
                                paragraph.paragraphStyle[key as keyof IParagraphStyle] = originParagraph.paragraphStyle[key as keyof IParagraphStyle] as any;
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
                    } else {
                        const keys = Object.keys(originParagraph.paragraphStyle);

                        for (const key of keys) {
                            if (paragraph.paragraphStyle[key as keyof IParagraphStyle] === undefined) {
                                paragraph.paragraphStyle[key as keyof IParagraphStyle] = originParagraph.paragraphStyle[key as keyof IParagraphStyle] as any;
                            }
                        }
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
            if (originCoverType === UpdateDocsAttributeType.REPLACE || targetCoverType === UpdateDocsAttributeType.REPLACE) {
                paragraph.bullet = transformType === TextXTransformType.COVER && targetParagraph.bullet
                    ? Tools.deepClone(targetParagraph.bullet)
                    : Tools.deepClone(originParagraph.bullet);
            } else {
                if (transformType === TextXTransformType.COVER && targetParagraph.bullet !== undefined) {
                    paragraph.bullet = Tools.deepClone(targetParagraph.bullet);
                }
            }
        }
    }

    return paragraph;
}

function transformCustomDecorations(
    originCustomDecorations: ICustomDecoration[] | undefined,
    targetCustomDecorations: ICustomDecoration[] | undefined
) {
    if (originCustomDecorations == null || targetCustomDecorations == null) {
        return targetCustomDecorations;
    }

    if (originCustomDecorations.length === 0 || targetCustomDecorations.length === 0) {
        return Tools.deepClone(targetCustomDecorations);
    }

    const customDecorations: ICustomDecoration[] = [];

    for (const decoration of targetCustomDecorations) {
        const { id, type } = decoration;

        let pushed = false;

        for (const originDecoration of originCustomDecorations) {
            if (originDecoration.id === id) {
                if (originDecoration.type === CustomDecorationType.DELETED || type === CustomDecorationType.DELETED) {
                    pushed = true;
                    customDecorations.push({
                        ...decoration,
                        type: CustomDecorationType.DELETED,
                    });
                }
                break;
            }
        }

        if (!pushed) {
            customDecorations.push(decoration);
        }
    }

    return customDecorations;
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

    const coverType = otherCoverType;

    const {
        textRuns: thisTextRuns,
        paragraphs: thisParagraphs = [],
        customRanges: thisCustomRanges,
        customDecorations: thisCustomDecorations,
    } = thisBody;
    const {
        textRuns: otherTextRuns,
        paragraphs: otherParagraphs = [],
        customRanges: otherCustomRanges,
        customDecorations: otherCustomDecorations,
    } = otherBody;

    const textRuns = transformTextRuns(
        thisTextRuns,
        otherTextRuns,
        thisCoverType,
        otherCoverType,
        priority ? TextXTransformType.COVER_ONLY_NOT_EXISTED : TextXTransformType.COVER
    );

    if (textRuns) {
        retBody.textRuns = textRuns;
    }

    const customRanges = transformCustomRanges(
        thisCustomRanges,
        otherCustomRanges,
        thisCoverType,
        otherCoverType,
        priority ? TextXTransformType.COVER_ONLY_NOT_EXISTED : TextXTransformType.COVER
    );

    if (customRanges) {
        retBody.customRanges = customRanges;
    }

    // Transform custom decorations.
    const customDecorations = transformCustomDecorations(
        thisCustomDecorations,
        otherCustomDecorations
    );

    if (customDecorations) {
        retBody.customDecorations = customDecorations;
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
