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

import type { IBusinessComponentProps } from '../components/interface';
import { useLayoutEffect, useRef } from 'react';

export function usePanelPattern(pattern: string, { onChange, onActionChange }: IBusinessComponentProps): void {
    const previousPatternRef = useRef(pattern);
    useLayoutEffect(() => {
        onActionChange(() => pattern);
        if (previousPatternRef.current !== pattern) {
            previousPatternRef.current = pattern;
            onChange(pattern);
        }
    }, [onActionChange, onChange, pattern]);
}
