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

const expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
const regex = new RegExp(expression);

export function isLegalLink(link: string) {
    if (link.startsWith('http://localhost:3002') || link.startsWith('localhost:3002')) {
        return true;
    }
    return Boolean(link.match(regex));
}

export function hasProtocol(urlString: string) {
    const pattern = /^[a-zA-Z]+:\/\//;
    return pattern.test(urlString);
}

export function isEmail(url: string) {
    const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return pattern.test(url);
}

export function serializeUrl(url: string) {
    if (isLegalLink(url)) {
        return hasProtocol(url) ? url : isEmail(url) ? `mailto://${url}` : `http://${url}`;
    }

    return url;
}
