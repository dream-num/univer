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

import type { Editor } from '@univerjs/docs-ui';
import type { IFunctionInfo } from '@univerjs/engine-formula';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { IDescriptionService } from '@univerjs/sheets-formula';
import { useDependency } from '@univerjs/ui';
import { useEffect, useRef, useState } from 'react';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs';
import { useStateRef } from './use-state-ref';

export const useFormulaDescribe = (isNeed: boolean, formulaText: string, editor?: Editor) => {
    const descriptionService = useDependency(IDescriptionService);
    const lexerTreeBuilder = useDependency(LexerTreeBuilder);

    const [functionInfo, setFunctionInfo] = useState<IFunctionInfo | undefined>();
    const [paramIndex, setParamIndex] = useState<number>(-1);
    const [isShow, setIsShow] = useState(true);
    const isShowRef = useStateRef(isShow);

    const formulaTextRef = useRef(formulaText);
    formulaTextRef.current = formulaText;
    const reset = () => {
        setFunctionInfo(undefined);
        setParamIndex(-1);
        setIsShow(false);
    };

    useEffect(() => {
        if (editor && isNeed) {
            const d = editor.selectionChange$.pipe(debounceTime(50)).subscribe((e) => {
                if (e.textRanges.length === 1) {
                    const [range] = e.textRanges;
                    if (range.collapsed && isShowRef.current) {
                        // 为什么减1,因为nodes是不包含初始 ‘=’ 字符的,但是 selection 会包含 '='
                        const res = lexerTreeBuilder.getFunctionAndParameter(`${formulaTextRef.current}A`, range.startOffset - 1);
                        if (res) {
                            const { functionName, paramIndex } = res;
                            const info = descriptionService.getFunctionInfo(functionName);
                            setFunctionInfo(info);
                            setParamIndex(paramIndex);
                            return;
                        }
                    }
                }
                setFunctionInfo(undefined);
                setParamIndex(-1);
            });
            const d2 = editor.selectionChange$.pipe(
                filter((e) => e.isEditing),
                filter((e) => e.textRanges.length === 1),
                map((e) => e.textRanges[0].startOffset),
                distinctUntilChanged()
            ).subscribe(() => {
                setIsShow(true);
            });
            return () => {
                d.unsubscribe();
                d2.unsubscribe();
            };
        }
    }, [editor, isNeed]);

    useEffect(() => {
        if (!isNeed) {
            reset();
        }
    }, [isNeed]);

    return {
        functionInfo,
        paramIndex,
        reset,
    };
};
