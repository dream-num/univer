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

import type { RefObject } from 'react';
import { useEffect } from 'react';
import { useEvent } from './event';

export interface IUseClickOutSideOptions {
    handler: () => void;
}

export function useClickOutSide(ref: RefObject<HTMLElement>, opts: IUseClickOutSideOptions) {
    const handler = useEvent(opts.handler);

    useEffect(() => {
        const listener = (event: MouseEvent) => {
            if (ref.current && event.target && !ref.current.contains(event.target as Node)) {
                handler();
            }
        };

        document.addEventListener('mousedown', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
        };
    }, [handler, ref]);
}
