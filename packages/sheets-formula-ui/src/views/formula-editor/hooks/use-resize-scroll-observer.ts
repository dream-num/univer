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

import { useEffect } from 'react';

type Callback = () => void;

export const useResizeScrollObserver = (callback: Callback, delay: number = 100): void => {
    useEffect(() => {
        let throttleTimeout: number | null = null;

        const throttledCallback = () => {
            if (throttleTimeout === null) {
                throttleTimeout = window.setTimeout(() => {
                    callback();
                    throttleTimeout = null;
                }, delay);
            }
        };

        window.addEventListener('scroll', throttledCallback);
        window.addEventListener('resize', throttledCallback);

        return () => {
            if (throttleTimeout !== null) {
                clearTimeout(throttleTimeout);
            }
            window.removeEventListener('scroll', throttledCallback);
            window.removeEventListener('resize', throttledCallback);
        };
    }, [callback, delay]);
};

export default useResizeScrollObserver;
