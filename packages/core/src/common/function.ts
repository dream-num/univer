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

export function throttle<T extends (...args: any[]) => any>(fn: T, wait: number = 16): T {
    let lastTime = 0;
    let timer: number | null = null;

    return function throttled(this: any, ...args: any[]) {
        const now = Date.now();
        if (now - lastTime < wait) {
            if (timer) {
                clearTimeout(timer);
            }

            timer = setTimeout(() => {
                lastTime = now;
                fn.apply(this, args);
            }, wait) as unknown as number;
        } else {
            lastTime = now;
            fn.apply(this, args);
        }
    } as unknown as T;
}
