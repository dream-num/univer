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

import type { ISelectProps } from '@univerjs/design';
import type { IThreadComment } from '@univerjs/thread-comment';
import type { LocaleKey } from '../../locale/types';
import type { IThreadCommentPanelProps } from '../ThreadCommentPanel';
import { ICommandService, LocaleService } from '@univerjs/core';
import { Button, clsx, MobileActionRowGroup, resetButtonClassName } from '@univerjs/design';
import { IncreaseIcon, MoreLeftIcon } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';
import { SetActiveCommentOperation } from '../../commands/operations/comment.operations';
import { ThreadCommentPanel } from '../ThreadCommentPanel';
import { MobileThreadCommentTree } from './MobileThreadCommentTree';

function MobileCommentFilter({ value, options = [], onChange }: ISelectProps) {
    return (
        <div
            className="
              univer-flex univer-gap-1 univer-overflow-x-auto univer-rounded-xl univer-bg-gray-100 univer-p-1
              dark:!univer-bg-gray-800
            "
        >
            {options.flatMap((option) => option.options ?? [option]).map((option) => (
                <button
                    key={option.value}
                    type="button"
                    aria-pressed={option.value === value}
                    className={clsx(resetButtonClassName, `
                      univer-h-10 univer-shrink-0 univer-rounded-lg univer-px-3 univer-text-sm univer-text-gray-700
                      active:univer-scale-95
                      dark:!univer-text-gray-200
                    `, option.value === value && `
                      univer-bg-gray-0 univer-font-medium univer-text-primary-600 univer-shadow-sm
                      dark:!univer-bg-gray-700 dark:!univer-text-primary-300
                    `)}
                    onClick={() => option.value != null && onChange?.(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}

function MobileCommentHeader({ comment: activeComment, displayRef }: { comment: IThreadComment; displayRef?: string }) {
    const localeService = useDependency(LocaleService);
    const commandService = useDependency(ICommandService);
    return (
        <div
            className="
              univer-mt-2 univer-flex univer-min-h-12 univer-items-center univer-gap-2 univer-border-0 univer-border-b
              univer-border-solid univer-border-gray-200 univer-pb-2
              dark:!univer-border-gray-700
            "
        >
            <button
                type="button"
                aria-label={localeService.t<LocaleKey>('thread-comment-ui.mobile.back')}
                className={`
                  ${resetButtonClassName}
                  univer-flex univer-size-12 univer-shrink-0 univer-items-center univer-justify-center univer-rounded-xl
                  univer-text-2xl univer-text-gray-700
                  active:univer-bg-gray-100
                  dark:!univer-text-gray-200
                  dark:active:!univer-bg-gray-700
                `}
                onClick={() => commandService.executeCommand(SetActiveCommentOperation.id)}
            >
                <MoreLeftIcon />
            </button>
            <div className="univer-min-w-0 univer-flex-1">
                <div
                    className="
                      univer-truncate univer-text-base univer-font-semibold univer-text-gray-900
                      dark:!univer-text-gray-0
                    "
                >
                    {localeService.t<LocaleKey>('thread-comment-ui.panel.title')}
                </div>
                {activeComment.ref && (
                    <div
                        className="
                          univer-truncate univer-text-xs univer-text-gray-500
                          dark:!univer-text-gray-400
                        "
                    >
                        {displayRef ?? activeComment.ref}
                    </div>
                )}
            </div>
        </div>
    );
}

function MobileAddComment({ onAdd }: { onAdd: () => void }) {
    const localeService = useDependency(LocaleService);
    return (
        <MobileActionRowGroup className="univer-mt-3">
            <Button className="univer-w-full" onClick={onAdd}>
                <IncreaseIcon className="univer-mr-1.5" />
                {localeService.t<LocaleKey>('thread-comment-ui.panel.addComment')}
            </Button>
        </MobileActionRowGroup>
    );
}

export function MobileThreadCommentPanel(props: IThreadCommentPanelProps) {
    return (
        <ThreadCommentPanel
            {...props}
            ActionRowComponent={MobileActionRowGroup}
            SelectComponent={MobileCommentFilter}
            ThreadCommentTreeComponent={MobileThreadCommentTree}
            DetailHeaderComponent={MobileCommentHeader}
            AddCommentComponent={MobileAddComment}
            filterClassName="univer-mt-3 univer-flex univer-flex-col univer-gap-2"
        />
    );
}
