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

import type { ICellData, Nullable } from '@univerjs/core';
import { DEFAULT_EMPTY_DOCUMENT_VALUE } from '@univerjs/core';

const expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
const regex = new RegExp(expression);

export function isLegalLink(link: string) {
    if (!Number.isNaN(+link)) {
        return false;
    }

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

export function serializeUrl(urlStr: string) {
    if (isLegalLink(urlStr)) {
        const transformedUrl = hasProtocol(urlStr) ? urlStr : isEmail(urlStr) ? `mailto://${urlStr}` : `http://${urlStr}`;

        const url = new URL(transformedUrl);
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
    }

    return urlStr;
}

export function getCellValueOrigin(cell: Nullable<ICellData>) {
    if (cell === null) {
        return '';
    }

    if (cell?.p) {
        const body = cell?.p.body;

        if (body == null) {
            return '';
        }

        const data = body.dataStream;
        const lastString = data.substring(data.length - 2, data.length);
        const newDataStream = lastString === DEFAULT_EMPTY_DOCUMENT_VALUE ? data.substring(0, data.length - 2) : data;

        return newDataStream;
    }

    return cell?.v;
}
