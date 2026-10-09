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

import type { IMeasureTextCache } from './shaping-engine/font-cache';
import { LineBreaker } from './line-breaker';
import { BreakPointType } from './line-breaker/break';
import { FontCache } from './shaping-engine/font-cache';

export interface ILineInfo {
    text: string;
    width: number;
    height: number;
    baseline: number;
}

function getVisualTextWidth(textSize: IMeasureTextCache) {
    const actualRight = textSize.actualBoundingBoxRight ?? textSize.width;
    return Number.isFinite(actualRight) ? Math.max(textSize.width, actualRight) : textSize.width;
}

export class DocSimpleSkeleton {
    private _lineBreaker: LineBreaker;
    private _lines: ILineInfo[] = [];
    private _dirty = true;
    private _lastBreakLength = 0; // Cache for the last successful break length

    constructor(
        private _text: string,
        private _fontStyle: string,
        private _warp: boolean,
        private _width: number,
        private _height: number
    ) {
        this._lineBreaker = new LineBreaker(this._text);
    }

    calculate() {
        if (!this._dirty) {
            return this._lines;
        }
        this._dirty = false;
        this._lines = [];
        if (this._text.length === 0) {
            const textSize = FontCache.getMeasureText('A', this._fontStyle);
            this._lines.push({
                text: '',
                width: 0,
                height: textSize.fontBoundingBoxAscent + textSize.fontBoundingBoxDescent,
                baseline: textSize.fontBoundingBoxAscent,
            });
            return this._lines;
        }

        if (!this._warp) {
            const textSize = FontCache.getMeasureText(this._text, this._fontStyle);
            this._lines.push({
                text: this._text,
                width: getVisualTextWidth(textSize),
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

        let totalHeight = 0;
        while (true) {
            const breakPoint = this._lineBreaker.nextBreakPoint();
            if (!breakPoint) {
                break;
            }
            const { position, type } = breakPoint;
            const rawText = this._text.slice(lastPosition, position);
            const isMandatoryBreak = type === BreakPointType.Mandatory;
            const text = isMandatoryBreak ? rawText.replace(/[\r\n]+$/, '') : rawText; // Remove line breaks for mandatory breaks

            if (text.length > 0) {
                const textSize = FontCache.getMeasureText(text, this._fontStyle);
                const textWidth = getVisualTextWidth(textSize);

                // Check if adding this text would exceed the width
                if ((textWidth + currentLine.width) > this._width) {
                    if (textWidth > this._width) {
                        // Push current line if it has content
                        if (currentLine.text.length > 0) {
                            this._lines.push(currentLine);
                            totalHeight += currentLine.height;
                            if (totalHeight > this._height) {
                                break;
                            }
                            // Reset current line
                            currentLine = {
                                text: '',
                                width: 0,
                                height: 0,
                                baseline: 0,
                            };
                        }

                        // Character-based line breaking processing
                        let remainingText = text;
                        while (remainingText.length > 0) {
                            let charCount = 0;
                            let lineText = '';
                            let lineWidth = 0;

                            // Heuristic search starting from cached break length
                            let startGuess = Math.min(this._lastBreakLength, remainingText.length);
                            if (startGuess === 0) {
                                startGuess = Math.min(10, remainingText.length); // Default guess for first time
                            }

                            // First, try the cached length
                            let testText = remainingText.slice(0, startGuess);
                            let testSize = FontCache.getMeasureText(testText, this._fontStyle);

                            if (getVisualTextWidth(testSize) + currentLine.width <= this._width) {
                                // The guess fits, search forward for the maximum
                                charCount = startGuess;
                                for (let i = startGuess + 1; i <= remainingText.length; i++) {
                                    testText = remainingText.slice(0, i);
                                    testSize = FontCache.getMeasureText(testText, this._fontStyle);

                                    if (getVisualTextWidth(testSize) + currentLine.width <= this._width) {
                                        charCount = i;
                                    } else {
                                        break;
                                    }
                                }
                            } else {
                                // The guess is too big, search backward
                                charCount = 0;
                                for (let i = startGuess - 1; i >= 1; i--) {
                                    testText = remainingText.slice(0, i);
                                    testSize = FontCache.getMeasureText(testText, this._fontStyle);

                                    if (getVisualTextWidth(testSize) + currentLine.width <= this._width) {
                                        charCount = i;
                                        break;
                                    }
                                }
                            }

                            // Update the cache with the successful break length
                            if (charCount > 0) {
                                this._lastBreakLength = charCount;
                            }

                            if (charCount > 0) {
                                lineText = remainingText.slice(0, charCount);
                                const textSize = FontCache.getMeasureText(lineText, this._fontStyle);
                                lineWidth = getVisualTextWidth(textSize);
                            }

                            // If no character can fit, force add one character to avoid infinite loop
                            if (charCount === 0 && currentLine.text.length === 0) {
                                charCount = 1;
                                lineText = remainingText[0];
                                const charSize = FontCache.getMeasureText(lineText, this._fontStyle);
                                lineWidth = getVisualTextWidth(charSize);
                            }

                            if (charCount > 0) {
                                // Add to current line
                                currentLine.text += lineText;
                                currentLine.width += lineWidth;
                                const textSize = FontCache.getMeasureText(currentLine.text, this._fontStyle);
                                currentLine.height = textSize.fontBoundingBoxAscent + textSize.fontBoundingBoxDescent;
                                currentLine.baseline = textSize.fontBoundingBoxAscent;

                                // Remove processed characters
                                remainingText = remainingText.slice(charCount);

                                // If there's remaining text, need to wrap to next line
                                if (remainingText.length > 0) {
                                    this._lines.push(currentLine);
                                    totalHeight += currentLine.height;
                                    if (totalHeight > this._height) {
                                        break;
                                    }
                                    // Reset current line
                                    currentLine = {
                                        text: '',
                                        width: 0,
                                        height: 0,
                                        baseline: 0,
                                    };
                                }
                            } else {
                                // Cannot continue processing, exit loop
                                break;
                            }
                        }
                    } else {
                        if (currentLine.text.length > 0) {
                            // Push the current line first
                            this._lines.push(currentLine);
                            totalHeight += currentLine.height;
                            if (totalHeight > this._height) {
                                break;
                            }
                            // Reset current line and add the new text
                            currentLine = {
                                text,
                                width: textWidth,
                                height: textSize.fontBoundingBoxAscent + textSize.fontBoundingBoxDescent,
                                baseline: textSize.fontBoundingBoxAscent,
                            };
                        } else {
                            // If current line is empty, we have to add this text anyway (single word too long)
                            currentLine = {
                                text,
                                width: textWidth,
                                height: textSize.fontBoundingBoxAscent + textSize.fontBoundingBoxDescent,
                                baseline: textSize.fontBoundingBoxAscent,
                            };
                        }
                    }
                } else {
                    // Add text to current line
                    currentLine.text = currentLine.text + text;
                    currentLine.width = currentLine.width + textWidth;
                    currentLine.baseline = textSize.fontBoundingBoxAscent;
                    currentLine.height = textSize.fontBoundingBoxAscent + textSize.fontBoundingBoxDescent;
                }
            }

            // For excel, when cell text is wrapped, \n should be treated as mandatory line break, so we need to break the line here.
            if (isMandatoryBreak) {
                this._lines.push(currentLine);
                totalHeight += currentLine.height;

                if (totalHeight > this._height) {
                    break;
                }

                // Reset current line for the next line after mandatory break
                currentLine = {
                    text: '',
                    width: 0,
                    height: 0,
                    baseline: 0,
                };
            }

            lastPosition = position;
        }

        // Don't forget to add the last line if it has content
        if (currentLine.text.length > 0) {
            this._lines.push(currentLine);
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

    makeDirty() {
        this._dirty = true;
        this._lastBreakLength = 0; // Reset cache when content changes
    }
}
