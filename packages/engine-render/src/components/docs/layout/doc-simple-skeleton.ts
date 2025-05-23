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

import { LineBreaker } from './line-breaker';
import { FontCache } from './shaping-engine/font-cache';

export interface ILineInfo {
    text: string;
    width: number;
    height: number;
    baseline: number;
}

export class DocSimpleSkeleton {
    private _lineBreaker: LineBreaker;
    private _lines: ILineInfo[] = [];

    constructor(
        private _text: string,
        private _fontStyle: string,
        private _warp: boolean,
        private _width: number
    ) {
        this._lineBreaker = new LineBreaker(this._text);
    }

    calculate() {
        this._lines = [];
        if (!this._warp) {
            const textSize = FontCache.getMeasureText(this._text, this._fontStyle);
            this._lines.push({
                text: this._text,
                width: textSize.width,
                height: textSize.fontBoundingBoxAscent + textSize.fontBoundingBoxDescent,
                baseline: textSize.fontBoundingBoxAscent,
            });
            return this._lines;
        }

        let lastPosition = 0;
        let currentLine: ILineInfo = {
            text: '',
            width: 0,
            height: 0,
            baseline: 0,
        };

        while (true) {
            const breakPoint = this._lineBreaker.nextBreakPoint();
            if (!breakPoint) {
                break;
            }
            const { position } = breakPoint;
            const text = this._text.slice(lastPosition, position);
            const textSize = FontCache.getMeasureText(text, this._fontStyle);

            // Check if adding this text would exceed the width
            if ((textSize.width + currentLine.width) > this._width) {
                if (currentLine.text.length > 0) {
                    // Push the current line first
                    this._lines.push({ ...currentLine });

                    // Reset current line and add the new text
                    currentLine = {
                        text,
                        width: textSize.width,
                        height: textSize.fontBoundingBoxAscent + textSize.fontBoundingBoxDescent,
                        baseline: textSize.fontBoundingBoxAscent,
                    };
                } else {
                    // If current line is empty, we have to add this text anyway (single word too long)
                    currentLine = {
                        text,
                        width: textSize.width,
                        height: textSize.fontBoundingBoxAscent + textSize.fontBoundingBoxDescent,
                        baseline: textSize.fontBoundingBoxAscent,
                    };
                }
            } else {
                // Add text to current line
                currentLine.text = currentLine.text + text;
                currentLine.width = currentLine.width + textSize.width;
                currentLine.baseline = textSize.fontBoundingBoxAscent;
                currentLine.height = textSize.fontBoundingBoxAscent + textSize.fontBoundingBoxDescent;
            }

            lastPosition = position;
        }

        // Don't forget to add the last line if it has content
        if (currentLine.text.length > 0) {
            this._lines.push({ ...currentLine });
        }

        return this._lines;
    }

    getLines() {
        return this._lines;
    }

    getTotalHeight() {
        return this._lines.reduce((acc, line) => acc + line.height, 0);
    }

    getTotalWidth() {
        return this._lines.reduce((acc, line) => Math.max(acc, line.width), 0);
    }
}
