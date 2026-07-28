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

import type { IDisposable, IDocumentBody } from '@univerjs/core';
import { Disposable, toDisposable } from '@univerjs/core';
import { Subject } from 'rxjs';

export interface IDocTextReplacement {
    endOffset: number;
    replaceable?: boolean;
    startOffset: number;
    text: string;
}

export interface IDocTextResolver {
    resolve(unitId: string, body: IDocumentBody): readonly IDocTextReplacement[];
}

export interface IResolvedDocTextCharacter {
    endOffset: number;
    replaceable: boolean;
    startOffset: number;
}

export interface IResolvedDocText {
    characters: readonly IResolvedDocTextCharacter[];
    text: string;
}

/**
 * Builds a consumer-facing text projection while retaining a mapping back to
 * the native document offsets.
 *
 * Consumers such as find/replace can search the projected text and then use
 * `characters` to focus the native object that supplied a matching character.
 * Resolvers must return half-open, non-overlapping replacements.
 */
export class DocTextResolverService extends Disposable {
    private readonly _resolvers = new Set<IDocTextResolver>();
    private readonly _textChanged$ = new Subject<string>();

    readonly textChanged$ = this._textChanged$.asObservable();

    register(resolver: IDocTextResolver): IDisposable {
        this._resolvers.add(resolver);
        return toDisposable(() => this._resolvers.delete(resolver));
    }

    notifyTextChanged(unitId: string): void {
        this._textChanged$.next(unitId);
    }

    resolve(unitId: string, body: IDocumentBody): IResolvedDocText {
        const replacements = this._collectReplacements(unitId, body);
        const characters: IResolvedDocTextCharacter[] = [];
        let text = '';
        let sourceOffset = 0;

        for (const replacement of replacements) {
            const sourceText = body.dataStream.slice(sourceOffset, replacement.startOffset);
            text += sourceText;
            for (let index = sourceOffset; index < replacement.startOffset; index += 1) {
                characters.push({
                    startOffset: index,
                    endOffset: index + 1,
                    replaceable: true,
                });
            }

            text += replacement.text;
            for (let index = 0; index < replacement.text.length; index += 1) {
                characters.push({
                    startOffset: replacement.startOffset,
                    endOffset: replacement.endOffset,
                    replaceable: replacement.replaceable ?? false,
                });
            }
            sourceOffset = replacement.endOffset;
        }

        text += body.dataStream.slice(sourceOffset);
        for (let index = sourceOffset; index < body.dataStream.length; index += 1) {
            characters.push({
                startOffset: index,
                endOffset: index + 1,
                replaceable: true,
            });
        }

        return { characters, text };
    }

    private _collectReplacements(
        unitId: string,
        body: IDocumentBody
    ): IDocTextReplacement[] {
        const candidates = [...this._resolvers]
            .flatMap((resolver) => resolver.resolve(unitId, body))
            .filter((replacement) =>
                Number.isInteger(replacement.startOffset) &&
                Number.isInteger(replacement.endOffset) &&
                replacement.startOffset >= 0 &&
                replacement.endOffset > replacement.startOffset &&
                replacement.endOffset <= body.dataStream.length
            )
            .sort((left, right) =>
                left.startOffset - right.startOffset ||
                right.endOffset - left.endOffset
            );
        const replacements: IDocTextReplacement[] = [];
        let previousEnd = -1;
        for (const candidate of candidates) {
            if (candidate.startOffset < previousEnd) {
                continue;
            }
            replacements.push(candidate);
            previousEnd = candidate.endOffset;
        }
        return replacements;
    }

    override dispose(): void {
        this._textChanged$.complete();
        super.dispose();
    }
}
