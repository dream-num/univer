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

import type { Editor } from '@univerjs/docs-ui';
import type { INode } from './useFormulaToken';
import { useEffect, useRef } from 'react';
import { sequenceNodeToText } from '../utils/sequenceNodeToText';

export const useEmitChange = (sequenceNodes: INode[], onChange: (v: string) => void, editor?: Editor) => {
    const isNeedEmit = useRef(false);

    useEffect(() => {
        if (editor) {
            const d = editor.input$.subscribe(() => {
                isNeedEmit.current = true;
            });
            return () => {
                d.unsubscribe();
            };
        }
    }, [editor]);

    useEffect(() => {
        if (isNeedEmit.current && sequenceNodes) {
            isNeedEmit.current = false;
            const result = sequenceNodeToText(sequenceNodes);
            onChange(result);
        }
    }, [sequenceNodes]);

    const needEmit = () => isNeedEmit.current = true;

    return needEmit;
};
