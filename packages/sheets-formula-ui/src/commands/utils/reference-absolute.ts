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

import type { ISequenceNode, LexerTreeBuilder } from '@univerjs/engine-formula';
import { AbsoluteRefType, RANGE_TYPE } from '@univerjs/core';
import {
    deserializeRangeWithSheetWithCache,
    generateStringWithSequence,
    getAbsoluteRefTypeWithSingleString,
    handleRefStringInfo,
    sequenceNodeType,
    serializeRangeToRefString,
} from '@univerjs/engine-formula';

const CELL_REFERENCE_REGEX = /^\$?[A-Za-z]+\$?\d+$/;

export interface IReferenceAbsoluteResult {
    formulaText: string;
    cursorOffset: number;
}

interface IToggleReferenceTokenResult {
    token: string;
    referenceTarget: 'start' | 'end' | 'both';
    previousSeparatorOffset: number | null;
    nextSeparatorOffset: number | null;
}

export function toggleReferenceAbsoluteAtCursor(
    lexerTreeBuilder: LexerTreeBuilder,
    formulaText: string,
    cursorOffset: number
): IReferenceAbsoluteResult | null {
    if (!formulaText.startsWith('=') || formulaText.length <= 1) {
        return null;
    }

    const sequenceNodes = lexerTreeBuilder.sequenceNodesBuilder(formulaText);
    if (!sequenceNodes?.length) {
        return null;
    }

    const normalizedCursorOffset = Math.min(Math.max(cursorOffset, 0), formulaText.length);
    const relativeCursorOffset = normalizedCursorOffset - 1;
    if (relativeCursorOffset < 0) {
        return null;
    }

    const matchedReference = sequenceNodes.find((node) => {
        if (typeof node === 'string' || node.nodeType !== sequenceNodeType.REFERENCE) {
            return false;
        }

        return relativeCursorOffset >= node.startIndex && relativeCursorOffset <= node.endIndex + 1;
    });

    if (!matchedReference || typeof matchedReference === 'string') {
        return null;
    }

    const nextReferenceState = _toggleReferenceToken(matchedReference, relativeCursorOffset - matchedReference.startIndex);
    if (nextReferenceState == null || nextReferenceState.token === matchedReference.token) {
        return null;
    }

    const nextSequenceNodes = sequenceNodes.map((node) => {
        if (node !== matchedReference) {
            return node;
        }

        return {
            ...node,
            token: nextReferenceState.token,
            endIndex: node.startIndex + nextReferenceState.token.length - 1,
        };
    });

    const nextFormulaText = `=${generateStringWithSequence(nextSequenceNodes)}`;
    const nextCursorOffset = _translateCursorOffset(
        normalizedCursorOffset,
        matchedReference.startIndex + 1,
        matchedReference.endIndex + 2,
        nextReferenceState.token.length,
        nextReferenceState
    );

    return {
        formulaText: nextFormulaText,
        cursorOffset: nextCursorOffset,
    };
}

function _toggleReferenceToken(referenceNode: ISequenceNode, offsetInToken: number): IToggleReferenceTokenResult | null {
    const sequenceGrid = deserializeRangeWithSheetWithCache(referenceNode.token);
    if (sequenceGrid == null) {
        return null;
    }

    const { range } = sequenceGrid;

    if (range.rangeType === RANGE_TYPE.ROW || range.rangeType === RANGE_TYPE.COLUMN) {
        const newToken = serializeRangeToRefString({
            ...sequenceGrid,
            range: {
                ...range,
                startAbsoluteRefType: range.startAbsoluteRefType === AbsoluteRefType.NONE ? AbsoluteRefType.ALL : AbsoluteRefType.NONE,
                endAbsoluteRefType: range.endAbsoluteRefType === AbsoluteRefType.NONE ? AbsoluteRefType.ALL : AbsoluteRefType.NONE,
            },
        });

        return {
            token: newToken,
            referenceTarget: 'both',
            previousSeparatorOffset: null,
            nextSeparatorOffset: null,
        };
    }

    const { refBody } = handleRefStringInfo(referenceNode.token);
    const referenceParts = refBody.split(':');
    const previousSeparatorOffset = referenceParts.length === 2 ? referenceNode.token.indexOf(':') : null;

    if (referenceParts.some((part) => !CELL_REFERENCE_REGEX.test(part))) {
        return null;
    }

    const isRangeReference = referenceParts.length === 2;
    const referenceTarget = !isRangeReference
        ? 'start'
        : _getRangeReferenceTarget(referenceNode.token, refBody, offsetInToken);

    const nextRange = {
        ...range,
    };

    if (referenceTarget === 'start' || referenceTarget === 'both') {
        const nextAbsoluteRefType = _getNextAbsoluteRefType(getAbsoluteRefTypeWithSingleString(referenceParts[0]));
        nextRange.startAbsoluteRefType = nextAbsoluteRefType;
        if (!isRangeReference) {
            nextRange.endAbsoluteRefType = nextAbsoluteRefType;
        }
    }

    if (referenceTarget === 'end' || referenceTarget === 'both') {
        nextRange.endAbsoluteRefType = _getNextAbsoluteRefType(getAbsoluteRefTypeWithSingleString(referenceParts[1]));
    }

    const token = serializeRangeToRefString({
        ...sequenceGrid,
        range: nextRange,
    });

    return {
        token,
        referenceTarget,
        previousSeparatorOffset,
        nextSeparatorOffset: referenceParts.length === 2 ? token.indexOf(':') : null,
    };
}

function _getRangeReferenceTarget(
    token: string,
    refBody: string,
    offsetInToken: number
): 'start' | 'end' | 'both' {
    const prefixLength = token.length - refBody.length;
    const separatorOffset = prefixLength + refBody.indexOf(':');

    if (offsetInToken === separatorOffset || offsetInToken === separatorOffset + 1) {
        return 'both';
    }

    return offsetInToken < separatorOffset ? 'start' : 'end';
}

function _getNextAbsoluteRefType(absoluteRefType: AbsoluteRefType): AbsoluteRefType {
    switch (absoluteRefType) {
        case AbsoluteRefType.NONE:
            return AbsoluteRefType.ALL;
        case AbsoluteRefType.ALL:
            return AbsoluteRefType.ROW;
        case AbsoluteRefType.ROW:
            return AbsoluteRefType.COLUMN;
        case AbsoluteRefType.COLUMN:
        default:
            return AbsoluteRefType.NONE;
    }
}

function _translateCursorOffset(
    cursorOffset: number,
    replaceStartOffset: number,
    replaceEndOffsetExclusive: number,
    nextLength: number,
    toggleResult: IToggleReferenceTokenResult
): number {
    if (
        toggleResult.referenceTarget === 'both' &&
        toggleResult.previousSeparatorOffset != null &&
        toggleResult.nextSeparatorOffset != null
    ) {
        const previousColonOffset = replaceStartOffset + toggleResult.previousSeparatorOffset;
        const nextColonOffset = replaceStartOffset + toggleResult.nextSeparatorOffset;

        if (cursorOffset === previousColonOffset) {
            return nextColonOffset;
        }

        if (cursorOffset === previousColonOffset + 1) {
            return nextColonOffset + 1;
        }
    }

    if (cursorOffset <= replaceStartOffset) {
        return cursorOffset;
    }

    const previousLength = replaceEndOffsetExclusive - replaceStartOffset;
    const lengthDiff = nextLength - previousLength;

    if (cursorOffset >= replaceEndOffsetExclusive) {
        return cursorOffset + lengthDiff;
    }

    const offsetInsideReference = cursorOffset - replaceStartOffset;
    return replaceStartOffset + Math.min(offsetInsideReference, nextLength);
}
