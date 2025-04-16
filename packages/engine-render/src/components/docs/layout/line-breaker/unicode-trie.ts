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

import { swap32LE } from './swap';
import inflate from './tiny-inflate';

// Shift size for getting the index-1 table offset.
const SHIFT_1 = 6 + 5;

// Shift size for getting the index-2 table offset.
const SHIFT_2 = 5;

// Difference between the two shift sizes,
// for getting an index-1 offset from an index-2 offset. 6=11-5
const SHIFT_1_2 = SHIFT_1 - SHIFT_2;

// Number of index-1 entries for the BMP. 32=0x20
// This part of the index-1 table is omitted from the serialized form.
const OMITTED_BMP_INDEX_1_LENGTH = 0x10000 >> SHIFT_1;

// Number of entries in an index-2 block. 64=0x40
const INDEX_2_BLOCK_LENGTH = 1 << SHIFT_1_2;

// Mask for getting the lower bits for the in-index-2-block offset. */
const INDEX_2_MASK = INDEX_2_BLOCK_LENGTH - 1;

// Shift size for shifting left the index array values.
// Increases possible data size with 16-bit index values at the cost
// of compactability.
// This requires data blocks to be aligned by DATA_GRANULARITY.
const INDEX_SHIFT = 2;

// Number of entries in a data block. 32=0x20
const DATA_BLOCK_LENGTH = 1 << SHIFT_2;

// Mask for getting the lower bits for the in-data-block offset.
const DATA_MASK = DATA_BLOCK_LENGTH - 1;

// The part of the index-2 table for U+D800..U+DBFF stores values for
// lead surrogate code _units_ not code _points_.
// Values for lead surrogate code _points_ are indexed with this portion of the table.
// Length=32=0x20=0x400>>SHIFT_2. (There are 1024=0x400 lead surrogates.)
const LSCP_INDEX_2_OFFSET = 0x10000 >> SHIFT_2;
const LSCP_INDEX_2_LENGTH = 0x400 >> SHIFT_2;

// Count the lengths of both BMP pieces. 2080=0x820
const INDEX_2_BMP_LENGTH = LSCP_INDEX_2_OFFSET + LSCP_INDEX_2_LENGTH;

// The 2-byte UTF-8 version of the index-2 table follows at offset 2080=0x820.
// Length 32=0x20 for lead bytes C0..DF, regardless of SHIFT_2.
const UTF8_2B_INDEX_2_OFFSET = INDEX_2_BMP_LENGTH;
const UTF8_2B_INDEX_2_LENGTH = 0x800 >> 6; // U+0800 is the first code point after 2-byte UTF-8

// The index-1 table, only used for supplementary code points, at offset 2112=0x840.
// Variable length, for code points up to highStart, where the last single-value range starts.
// Maximum length 512=0x200=0x100000>>SHIFT_1.
// (For 0x100000 supplementary code points U+10000..U+10ffff.)
//
// The part of the index-2 table for supplementary code points starts
// after this index-1 table.
//
// Both the index-1 table and the following part of the index-2 table
// are omitted completely if there is only BMP data.
const INDEX_1_OFFSET = UTF8_2B_INDEX_2_OFFSET + UTF8_2B_INDEX_2_LENGTH;

// The alignment size of a data block. Also the granularity for compaction.
const DATA_GRANULARITY = 1 << INDEX_SHIFT;

export default class UnicodeTrie {
    highStart: number;
    errorValue: number;
    data: Uint32Array;

    constructor(data: any) {
        const isBuffer = typeof data.readUInt32BE === 'function' && typeof data.slice === 'function';

        if (isBuffer || data instanceof Uint8Array) {
            // read binary format
            let uncompressedLength;
            if (isBuffer) {
                this.highStart = data.readUInt32LE(0);
                this.errorValue = data.readUInt32LE(4);
                uncompressedLength = data.readUInt32LE(8);
                data = data.slice(12);
            } else {
                const view = new DataView(data.buffer);
                this.highStart = view.getUint32(0, true);
                this.errorValue = view.getUint32(4, true);
                uncompressedLength = view.getUint32(8, true);
                data = data.subarray(12);
            }

            // double inflate the actual trie data
            data = inflate(data, new Uint8Array(uncompressedLength));
            data = inflate(data, new Uint8Array(uncompressedLength));

            // swap bytes from little-endian
            swap32LE(data);

            this.data = new Uint32Array(data.buffer);
        } else {
            // pre-parsed data
            ({ data: this.data, highStart: this.highStart, errorValue: this.errorValue } = data);
        }
    }

    get(codePoint: number) {
        let index;
        if (codePoint < 0 || codePoint > 0x10FFFF) {
            return this.errorValue;
        }

        if (codePoint < 0xD800 || (codePoint > 0xDBFF && codePoint <= 0xFFFF)) {
            // Ordinary BMP code point, excluding leading surrogates.
            // BMP uses a single level lookup.  BMP index starts at offset 0 in the index.
            // data is stored in the index array itself.
            index = (this.data[codePoint >> SHIFT_2] << INDEX_SHIFT) + (codePoint & DATA_MASK);
            return this.data[index];
        }

        if (codePoint <= 0xFFFF) {
            // Lead Surrogate Code Point.  A Separate index section is stored for
            // lead surrogate code units and code points.
            //   The main index has the code unit data.
            //   For this function, we need the code point data.
            index =
                (this.data[LSCP_INDEX_2_OFFSET + ((codePoint - 0xD800) >> SHIFT_2)] << INDEX_SHIFT) +
                (codePoint & DATA_MASK);
            return this.data[index];
        }

        if (codePoint < this.highStart) {
            // Supplemental code point, use two-level lookup.
            index = this.data[INDEX_1_OFFSET - OMITTED_BMP_INDEX_1_LENGTH + (codePoint >> SHIFT_1)];
            index = this.data[index + ((codePoint >> SHIFT_2) & INDEX_2_MASK)];
            index = (index << INDEX_SHIFT) + (codePoint & DATA_MASK);
            return this.data[index];
        }

        return this.data[this.data.length - DATA_GRANULARITY];
    }
}
