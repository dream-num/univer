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

import type { ITextRange } from '@univerjs/core';
import type { IRichTextEditingMutationParams, ISetTextSelectionsOperationParams } from '@univerjs/docs';
import { debounce, generateRandomId, ICommandService, LocaleService } from '@univerjs/core';
import { RichTextEditingMutation, SetTextSelectionsOperation } from '@univerjs/docs';
import { useDependency, useObservable } from '@univerjs/ui';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DocParagraphSettingCommand } from '../../commands/commands/doc-paragraph-setting.command';
import { ParagraphSetting } from './Setting';

const isRangesEqual = (oldRanges: ITextRange[], ranges: ITextRange[]) => {
    return ranges.length === oldRanges.length && oldRanges.some((oldRange) =>
        ranges.some((range) =>
            range.startOffset === oldRange.startOffset && range.endOffset === oldRange.endOffset));
};

export function ParagraphSettingIndex() {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const currentLocale = useObservable(localeService.currentLocale$);

    const [key, keySet] = useState('');
    const debounceReset = useMemo(() => {
        return debounce(() => keySet(generateRandomId(4)), 300);
    }, []);

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
                const trigger = params.trigger;
                if (trigger !== DocParagraphSettingCommand.id) {
                    debounceReset();
                }
            }
        });
        return () => dispose.dispose();
    }, [debounceReset]);

    useEffect(() => {
        keySet(generateRandomId(4));
    }, [currentLocale]);

    useEffect(() => () => debounceReset.cancel(), [debounceReset]);

    return <ParagraphSetting key={key} />;
}
