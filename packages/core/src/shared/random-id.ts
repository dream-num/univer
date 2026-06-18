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

const URL_SAFE_ALPHABET = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

type GetRandomValues = (array: Uint8Array) => Uint8Array;

function getRandomValues(): GetRandomValues | undefined {
    const cryptoSource =
        typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function'
            ? crypto
            : typeof self !== 'undefined' && self.crypto && typeof self.crypto.getRandomValues === 'function'
                ? self.crypto
                : typeof window !== 'undefined' && window.crypto && typeof window.crypto.getRandomValues === 'function'
                    ? window.crypto
                    : undefined;

    return cryptoSource?.getRandomValues.bind(cryptoSource) as GetRandomValues | undefined;
}

function createIdByMathRandom(size: number, alphabet: string): string {
    let id = '';
    for (let i = 0; i < size; i++) {
        id += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return id;
}

function createIdByCrypto(size: number, alphabet: string, getCryptoRandomValues: GetRandomValues): string {
    const safeByteCutoff = 256 - (256 % alphabet.length);
    const step = Math.ceil((1.6 * 256 * size) / safeByteCutoff);
    let id = '';

    while (id.length < size) {
        const bytes = getCryptoRandomValues(new Uint8Array(step));
        for (let i = 0; i < step && id.length < size; i++) {
            const byte = bytes[i];
            if (byte < safeByteCutoff) {
                id += alphabet[byte % alphabet.length];
            }
        }
    }

    return id;
}

export function createRandomId(size: number = 21, alphabet: string = URL_SAFE_ALPHABET): string {
    if (!size) {
        return '';
    }

    const getCryptoRandomValues = getRandomValues();
    if (!getCryptoRandomValues) {
        return createIdByMathRandom(size, alphabet);
    }

    return createIdByCrypto(size, alphabet, getCryptoRandomValues);
}

export function generateRandomId(n: number = 21, alphabet?: string): string {
    return createRandomId(n, alphabet);
}
