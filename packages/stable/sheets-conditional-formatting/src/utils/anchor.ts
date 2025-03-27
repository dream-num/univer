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

export interface IAnchor {
    id: string;
    type: 'before' | 'after' | 'self';
}

export const findIndexByAnchor = <T = unknown[]>(anchor: IAnchor, ruleList: T[], get: (v: T) => string): number | null => {
    if (!ruleList) {
        return null;
    }
    const anchorIndex = ruleList.findIndex((rule) => get(rule) === anchor.id);
    if (anchorIndex < 0) {
        return null;
    }
    switch (anchor.type) {
        case 'after': {
            return anchorIndex + 1;
        }
        case 'before': {
            return anchorIndex - 1;
        }
        case 'self': {
            return anchorIndex;
        }
    }
};
/**
 * This function has side effects that modify the ruleList
 * @param {IAnchor} start
 * @param {IAnchor} end
 * @param {ReturnType<ConditionalFormattingRuleModel['getSubunitRules']>} ruleList
 * @return {*}
 */
export const moveByAnchor = <T = unknown[]>(start: IAnchor, end: IAnchor, ruleList: T[], get: (v: T) => string) => {
    if (!ruleList) {
        return null;
    }
    const startIndex = findIndexByAnchor(start, ruleList, get);
    let endIndex = findIndexByAnchor(end, ruleList, get);

    if (startIndex === null || endIndex === null || startIndex === endIndex) {
        return;
    }
    const rule = ruleList.splice(startIndex, 1)[0];

    if (startIndex < endIndex) {
        endIndex = findIndexByAnchor(end, ruleList, get)!;
    }

    switch (end.type) {
        case 'before': {
            ruleList.splice(endIndex + 1, 0, rule);
            break;
        }
        case 'self':
        case 'after': {
            ruleList.splice(endIndex, 0, rule);
            break;
        }
    }
};

/**
 * Only [after,after] and [after,before] can support symmetric operations
 */
export const transformSupportSymmetryAnchor = <T = unknown[]>(start: IAnchor, end: IAnchor, ruleList: T[], get: (v: T) => string): [IAnchor, IAnchor] | null => {
    if (start.type === 'after' && ['after', 'before'].includes(end.type)) {
        return [start, end];
    }
    const _start = { ...start };
    const _end = { ...end };
    if (_start.type !== 'after') {
        const index = findIndexByAnchor(_start, ruleList, get);
        if (index === null) {
            return null;
        }
        if (index - 1 < 0) {
            const nextItem = ruleList[index + 1];
            if (!nextItem) {
                return null;
            } else {
                _start.id = get(nextItem);
                _start.type = 'before';
            }
        } else {
            const id = get(ruleList[index - 1]);
            _start.id = id;
            _start.type = 'after';
        }
    }
    if (!['after', 'before'].includes(_end.type)) {
        const index = findIndexByAnchor(_end, ruleList, get);
        if (index === null) {
            return null;
        }
        if (index === 0) {
            _end.type = 'before';
        } else if (index - 1 >= 0) {
            const id = get(ruleList[index - 1]);
            _end.id = id;
            _end.type = 'after';
        } else if (index + 1 <= ruleList.length - 1) {
            const id = get(ruleList[index + 1]);
            _end.id = id;
            _end.type = 'before';
        } else {
            return null;
        }
    }
    if (_start.id === _end.id && _start.type === _end.type) {
        return null;
    }
    return [_start, _end];
};
export const anchorUndoFactory = (start: IAnchor, end: IAnchor): [IAnchor, IAnchor] | null => {
    if (['after', 'before'].includes(end.type)) {
        if (start.type === 'after') {
            return [end, start];
        } else if (start.type === 'before') {
            return [end, { ...start, type: 'self' }];
        }
    }
    return null;
};

export const isAnchorEqual = (anchor1: IAnchor, anchor2: IAnchor) => {
    return anchor1.id === anchor2.id && anchor1.type === anchor2.type;
};
