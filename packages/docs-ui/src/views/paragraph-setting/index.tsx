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

import type { ITextRange } from '@univerjs/core';
import { generateRandomId, ICommandService, LocaleService, useDependency, useObservable } from '@univerjs/core';
import React, { useEffect, useRef, useState } from 'react';
import type { IRichTextEditingMutationParams, ISetTextSelectionsOperationParams } from '@univerjs/docs';
import { RichTextEditingMutation, SetTextSelectionsOperation } from '@univerjs/docs';
import { DocParagraphSettingCommand } from '../../commands/commands/doc-paragraph-setting.command';
import { ParagraphSetting } from './Setting';

const isRangesEqual = (oldRanges: ITextRange[], ranges: ITextRange[]) => {
    return ranges.length === oldRanges.length && oldRanges.some((oldRange) =>
        ranges.some((range) =>
            range.startOffset === oldRange.startOffset && range.endOffset === oldRange.endOffset));
};

const isRangesIntersection = (oldRanges: ITextRange[], ranges: ITextRange[]) => {
    return oldRanges.some((oldRange) => {
        return ranges.some((range) => {
            const { startOffset: activeStart, endOffset: activeEnd } = oldRange;
            const { startOffset: compareStart, endOffset: compareEnd } = range;

            if (activeStart == null || activeEnd == null || compareStart == null || compareEnd == null) {
                return false;
            }

            return activeStart <= compareEnd && activeEnd >= compareStart;
        });
    });
};
export function ParagraphSettingIndex() {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const currentLocale = useObservable(localeService.currentLocale$);

    const [key, keySet] = useState('');

    const rangeRef = useRef<ITextRange[]>([]);
    useEffect(() => {
        const dispose = commandService.onCommandExecuted((info) => {
            if (SetTextSelectionsOperation.id === info.id) {
                const ranges = (info.params as ISetTextSelectionsOperationParams).ranges;
                if (!isRangesEqual(ranges, rangeRef.current)) {
                    keySet(generateRandomId(4));
                }
                rangeRef.current = ranges;
            }
            if (RichTextEditingMutation.id === info.id) {
                const params = info.params as IRichTextEditingMutationParams;
                const ranges = params.textRanges ?? [];
                const trigger = params.trigger;
                if (trigger !== DocParagraphSettingCommand.id && isRangesIntersection(ranges, rangeRef.current)) {
                    keySet(generateRandomId(4));
                }
            }
        });
        return () => dispose.dispose();
    }, []);

    useEffect(() => {
        keySet(generateRandomId(4));
    }, [currentLocale]);

    return <ParagraphSetting key={key} />;
}
