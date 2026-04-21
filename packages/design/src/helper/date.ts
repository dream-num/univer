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

function pad(value: number, length = 2) {
    return String(value).padStart(length, '0');
}

export function formatDateWithPattern(value: Date | undefined, pattern: string) {
    const date = value ?? new Date();
    if (Number.isNaN(date.getTime())) {
        return 'Invalid Date';
    }

    const tokenMap: Record<string, string> = {
        YYYY: String(date.getFullYear()),
        MM: pad(date.getMonth() + 1),
        DD: pad(date.getDate()),
        HH: pad(date.getHours()),
        mm: pad(date.getMinutes()),
        ss: pad(date.getSeconds()),
    };

    return pattern.replace(/YYYY|MM|DD|HH|mm|ss/g, (token) => tokenMap[token] ?? token);
}
