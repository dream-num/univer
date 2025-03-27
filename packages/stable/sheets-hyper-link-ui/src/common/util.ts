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

import { Tools } from '@univerjs/core';

export function isLegalLink(link: string) {
    return Tools.isLegalUrl(link);
}

export function hasProtocol(urlString: string) {
    const pattern = /^[a-zA-Z]+:\/\//;
    return pattern.test(urlString);
}

export function isEmail(url: string) {
    const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return pattern.test(url);
}

export function serializeUrl(urlStr: string) {
    if (isLegalLink(urlStr)) {
        const transformedUrl = hasProtocol(urlStr) ? urlStr : isEmail(urlStr) ? `mailto://${urlStr}` : `http://${urlStr}`;

        let url: URL;
        try {
            url = new URL(transformedUrl);
        } catch {
            return urlStr;
        }

        if (
            url.hostname === location.hostname &&
            url.port === location.port &&
            url.protocol === location.protocol &&
            url.pathname === location.pathname &&
            url.hash &&
            !url.search
        ) {
            return url.hash;
        }

        return transformedUrl;
    }

    return urlStr;
}
