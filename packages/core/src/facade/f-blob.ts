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

import type { Nullable } from '../shared';
import { Inject, Injector } from '@wendellhu/redi';
import { FBase } from './f-base';

export interface IFBlobSource {
    /**
     * Return the data inside this object as a blob.
     */
    getBlob(): FBlob;

    /**
     * Return the data inside this object as a blob converted to the specified content type.
     * @param contentType the content type refer to https://developer.mozilla.org/en-US/docs/Web/HTTP/MIME_types/Common_types
     */
    getAs(contentType: string): FBlob;
}

export class FBlob extends FBase {
    constructor(
        private _blob: Nullable<Blob>,
        @Inject(Injector) protected readonly _injector: Injector
    ) {
        super();
    }

    /**
     * Returns a copy of this blob.
     * @returns a new blob by copying the current blob
     * @example
     * ```ts
     * const blob = univerAPI.newBlob(blob);
     * const newBlob = blob.copyBlob();
     * console.log(newBlob);
     * ```
     */
    copyBlob() {
        return this._injector.createInstance(FBlob, this._blob);
    }

    /**
     * Return the data inside this object as a blob converted to the specified content type.
     * @param contentType the content type refer to https://developer.mozilla.org/en-US/docs/Web/HTTP/MIME_types/Common_types
     * @returns a new blob by converting the current blob to the specified content type
     * @example
     * ```ts
     * const blob = univerAPI.newBlob(blob);
     * const newBlob = blob.getBlob();
     * ```
     */
    getAs(contentType: string) {
        const newBlob = this.copyBlob();
        newBlob.setContentType(contentType);
        return newBlob;
    }

    /**
     * Get the blob as a string.
     * @returns
     * @example
     * ```ts
     * const blob = univerAPI.newBlob(blob);
     * const newBlob = blob.getDataAsString();
     * console.log(newBlob);
     * ```
     */
    getDataAsString(): Promise<string>;
    /**
     * Get the blob as a string.
     * @param charset the charset
     * @returns the blob content as a string
     * @example
     * ```ts
     * const blob = univerAPI.newBlob(blob);
     * const newBlob = blob.getDataAsString('iso-8859-1');
     * console.log(newBlob);
     * ```
     */
    getDataAsString(charset?: string): Promise<string>;
    getDataAsString(charset?: string): Promise<string> {
        if (this._blob === null) {
            return Promise.resolve('');
        }

        if (charset === undefined) {
            return this._blob!.text();
        }
        return new Promise((resolve, reject) => {
            this._blob!.arrayBuffer().then((arrayBuffer) => {
                const text = new TextDecoder(charset).decode(arrayBuffer); // 解码为字符串
                resolve(text);
            }).catch((error) => {
                reject(new Error(`Failed to read Blob as ArrayBuffer: ${error.message}`));
            });
        });
    }

    /**
     * Gets the data stored in this blob.
     * @returns the blob content as a byte array
     * @example
     * ```ts
     * const blob = univerAPI.newBlob(blob);
     * const newBlob = blob.getBytes();
     * console.log(newBlob);
     * ```
     */
    getBytes(): Promise<Uint8Array> {
        if (!this._blob) {
            return Promise.reject(new Error('Blob is undefined or null.'));
        }
        return this._blob.arrayBuffer().then((buffer) => new Uint8Array(buffer));
    }

    /**
     * Sets the data stored in this blob.
     * @param bytes a byte array
     * @returns the blob object
     * @example
     * ```ts
     * const blob = univerAPI.newBlob();
     * const bytes = new Uint8Array(10);
     * blob.setBytes(bytes);
     * ```
     */
    setBytes(bytes: Uint8Array): FBlob {
        this._blob = new Blob([bytes]);
        return this;
    }

    /**
     * Sets the data stored in this blob.
     * @param data blob data string
     * @returns the blob object
     * @example
     * ```ts
     * const blob = univerAPI.newBlob();
     * blob.setDataFromString('Hello, World!');
     * ```
     */
    setDataFromString(data: string): FBlob;
    /**
     * Sets the data stored in this blob.
     * @param data a string
     * @param contentType the content type refer to https://developer.mozilla.org/en-US/docs/Web/HTTP/MIME_types/Common_types
     * @returns the blob object
     * @example
     * ```ts
     * const blob = univerAPI.newBlob();
     * blob.setDataFromString('Hello, World!', 'text/plain');
     * ```
     */
    setDataFromString(data: string, contentType?: string): FBlob;
    setDataFromString(data: string, contentType?: string): FBlob {
        const contentTypeVal = contentType ?? 'text/plain';
        const blob = new Blob([data], { type: contentTypeVal });
        this._blob = blob;
        return this;
    }

    /**
     * Gets the content type of the data stored in this blob.
     * @returns the content type
     * @example
     * ```ts
     * const blob = univerAPI.newBlob(blob);
     * const newBlob = blob.getContentType();
     * console.log(newBlob);
     * ```
     */
    getContentType() {
        return this._blob?.type;
    }

    /**
     * Sets the content type of the data stored in this blob.
     * @param contentType the content type refer to https://developer.mozilla.org/en-US/docs/Web/HTTP/MIME_types/Common_types
     * @returns the blob object
     * @example
     * ```ts
     * const blob = univerAPI.newBlob(blob);
     * const newBlob = blob.setContentType('text/plain');
     * console.log(newBlob);
     * ```
     */
    setContentType(contentType: string): FBlob {
        this._blob = this._blob?.slice(0, this._blob.size, contentType);
        return this;
    }
}
