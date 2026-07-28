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

import type { DocumentDataModel, ITextRange, Nullable } from '@univerjs/core';
import type { DocSkeletonManagerService } from '@univerjs/docs';
import type { Documents, ITextSelectionStyle } from '@univerjs/engine-render';
import type { IFindMatch, IFindMoveParams, IFindQuery, IReplaceAllResult } from '@univerjs/find-replace';
import type { IDocsReplaceCommandParams } from '../commands/commands/docs-replace.command';
import {
    ColorKit,
    fromCallback,
    ICommandService,
    Inject,
    ThemeService,
    toDisposable,
} from '@univerjs/core';
import {
    DocSelectionManagerService,
    DocTextResolverService,
    RichTextEditingMutation,
} from '@univerjs/docs';
import { DocBackScrollRenderController, getTextRangeFromCharIndex } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { FindModel } from '@univerjs/find-replace';
import { debounceTime, filter, merge, Subject } from 'rxjs';
import { DocsReplaceCommand } from '../commands/commands/docs-replace.command';
import { findDocRanges } from '../controllers/utils';

export const DOCS_FIND_REPLACE_PROVIDER = 'docs-find-replace-provider';

export interface IDocFindMatch extends IFindMatch<ITextRange> {
    provider: typeof DOCS_FIND_REPLACE_PROVIDER;
    range: ITextRange;
    replaceable: boolean;
}

export class DocsFindModel extends FindModel {
    private readonly _matchesUpdate$ = new Subject<IDocFindMatch[]>();
    override readonly matchesUpdate$ = this._matchesUpdate$.asObservable();
    private readonly _activelyChangingMatch$ = new Subject<IDocFindMatch>();
    override readonly activelyChangingMatch$ = this._activelyChangingMatch$.asObservable();
    private _matches: IDocFindMatch[] = [];
    private _position = -1;
    private _query: Nullable<IFindQuery> = null;
    private _highlights: Array<{ dispose(): void }> = [];

    override readonly unitId: string;

    constructor(
        private readonly _doc: DocumentDataModel,
        private readonly _skeletonManager: DocSkeletonManagerService,
        @Inject(DocSelectionManagerService) private readonly _selectionManager: DocSelectionManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @Inject(DocTextResolverService)
        private readonly _textResolverService: DocTextResolverService
    ) {
        super();
        this.unitId = _doc.getUnitId();

        this.disposeWithMe(toDisposable(merge(
            fromCallback(this._commandService.onCommandExecuted.bind(this._commandService))
                .pipe(filter(([command]) => command.id === RichTextEditingMutation.id &&
                    getUnitId(command.params) === this.unitId)),
            this._textResolverService.textChanged$
                .pipe(filter((unitId) => unitId === this.unitId))
        )
            .pipe(
                debounceTime(220)
            )
            .subscribe(() => this._scan(true))));
        this.disposeWithMe(toDisposable(this._skeletonManager.currentSkeleton$.subscribe(() => this._refreshHighlights())));
    }

    get currentMatch(): Nullable<IDocFindMatch> {
        return this._position < 0 ? null : this._matches[this._position] ?? null;
    }

    override dispose(): void {
        super.dispose();
        this._disposeHighlights();
        this._matchesUpdate$.complete();
        this._activelyChangingMatch$.complete();
    }

    override getMatches(): IDocFindMatch[] {
        return this._matches;
    }

    start(query: IFindQuery): void {
        this._query = query;
        this._position = -1;
        this._scan(false);
    }

    override moveToNextMatch(params?: IFindMoveParams): IDocFindMatch | null {
        if (!this._matches.length) return null;
        if (params?.stayIfOnMatch && this.currentMatch) {
            return this._activate(this._position, params.noFocus);
        }

        let index: number;
        if (params?.ignoreSelection) {
            index = 0;
        } else if (this._position >= 0) {
            index = this._position + 1;
        } else {
            const selection = this._selectionManager.getActiveTextRange();
            const selectedMatch = params?.stayIfOnMatch ? this._selectionMatchIndex() : -1;
            index = selectedMatch >= 0
                ? selectedMatch
                : this._matches.findIndex((match) => match.range.startOffset >= (selection?.endOffset ?? 0));
        }

        if (index < 0 || index >= this._matches.length) index = params?.loop ? 0 : -1;
        if (index < 0) {
            this._position = -1;
            this._refreshHighlights();
            return null;
        }
        return this._activate(index, params?.noFocus);
    }

    override moveToPreviousMatch(params?: IFindMoveParams): IDocFindMatch | null {
        if (!this._matches.length) return null;
        if (params?.stayIfOnMatch && this.currentMatch) {
            return this._activate(this._position, params.noFocus);
        }

        let index: number;
        if (params?.ignoreSelection) {
            index = this._matches.length - 1;
        } else if (this._position >= 0) {
            index = this._position - 1;
        } else {
            const selection = this._selectionManager.getActiveTextRange();
            const selectedMatch = params?.stayIfOnMatch ? this._selectionMatchIndex() : -1;
            index = selectedMatch >= 0
                ? selectedMatch
                : this._matches.findLastIndex((match) => match.range.endOffset <= (selection?.startOffset ?? 0));
        }

        if (index < 0) index = params?.loop ? this._matches.length - 1 : -1;
        if (index < 0) {
            this._position = -1;
            this._refreshHighlights();
            return null;
        }
        return this._activate(index, params?.noFocus);
    }

    override async replace(replaceString: string): Promise<boolean> {
        const current = this.currentMatch;
        if (!current?.replaceable || !this._query) return false;
        const result = await this._commandService.executeCommand<IDocsReplaceCommandParams, IReplaceAllResult>(DocsReplaceCommand.id, {
            unitId: this.unitId,
            query: this._query,
            replaceString,
            range: current.range,
        });
        return result?.success === 1;
    }

    override async replaceAll(replaceString: string): Promise<IReplaceAllResult> {
        if (!this._query) return { success: 0, failure: 0 };
        return await this._commandService.executeCommand<IDocsReplaceCommandParams, IReplaceAllResult>(DocsReplaceCommand.id, {
            unitId: this.unitId,
            query: this._query,
            replaceString,
        }) ?? { success: 0, failure: this._matches.length };
    }

    override focusSelection(): void {
        if (this.currentMatch) this._focusMatch(this.currentMatch);
    }

    private _scan(emit: boolean): void {
        if (!this._query) return;
        const body = this._doc.getBody();
        if (!body) {
            this._matches = [];
            this._position = -1;
            this._disposeHighlights();
            if (emit) this._matchesUpdate$.next([]);
            return;
        }

        const previousStart = this.currentMatch?.range.startOffset;
        this._matches = findDocRanges(
            body,
            this._query,
            !!this._doc.getSnapshot().disabled,
            this._textResolverService.resolve(this.unitId, body)
        )
            .map((range) => ({
                provider: DOCS_FIND_REPLACE_PROVIDER,
                unitId: this.unitId,
                range: { ...range, collapsed: false },
                replaceable: range.replaceable,
            }));
        this._position = previousStart == null
            ? -1
            : this._matches.findIndex((match) => match.range.startOffset >= previousStart);
        this._refreshHighlights();
        if (emit) this._matchesUpdate$.next(this._matches);
    }

    private _selectionMatchIndex(): number {
        const selection = this._selectionManager.getActiveTextRange();
        if (!selection) return -1;
        return this._matches.findIndex((match) =>
            match.range.startOffset <= selection.startOffset && match.range.endOffset >= selection.endOffset
        );
    }

    private _activate(index: number, noFocus = false): IDocFindMatch | null {
        const match = this._matches[index];
        if (!match) return null;
        this._position = index;
        if (!noFocus) this._focusMatch(match);
        else this._refreshHighlights();
        return match;
    }

    private _focusMatch(match: IDocFindMatch): void {
        this._selectionManager.replaceDocRanges([match.range], {
            unitId: this.unitId,
            subUnitId: this.unitId,
        }, true, { shouldFocus: false });
        this._renderManagerService.getRenderUnitById(this.unitId)
            ?.with(DocBackScrollRenderController)
            .scrollToRange(match.range);
        this._activelyChangingMatch$.next(match);
        this._refreshHighlights();
    }

    private _refreshHighlights(): void {
        this._disposeHighlights();
        const render = this._renderManagerService.getRenderUnitById(this.unitId);
        const skeleton = this._skeletonManager.getSkeleton();
        const document = render?.mainComponent as Nullable<Documents>;
        if (!render || !skeleton || !document) return;

        const color = this._themeService.getColorFromTheme('yellow.400');
        const passiveStyle: ITextSelectionStyle = {
            strokeWidth: 0,
            stroke: 'rgba(0,0,0,0)',
            strokeActive: 'rgba(0,0,0,0)',
            fill: new ColorKit(color).setAlpha(0.3).toRgbString(),
        };
        const activeStyle: ITextSelectionStyle = {
            ...passiveStyle,
            fill: new ColorKit(color).setAlpha(0.65).toRgbString(),
        };

        this._matches.forEach((match, index) => {
            const range = getTextRangeFromCharIndex(
                match.range.startOffset,
                match.range.endOffset,
                render.scene,
                document,
                skeleton,
                index === this._position ? activeStyle : passiveStyle,
                '',
                -1
            );
            if (range) this._highlights.push(range);
        });
    }

    private _disposeHighlights(): void {
        this._highlights.forEach((highlight) => highlight.dispose());
        this._highlights = [];
    }
}

function getUnitId(params: unknown): string | undefined {
    return params != null &&
        typeof params === 'object' &&
        'unitId' in params &&
        typeof params.unitId === 'string'
        ? params.unitId
        : undefined;
}
