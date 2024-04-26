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

import type { IThreadComment } from '@univerjs/thread-comment';
import { Button, Textarea } from '@univerjs/design';
import React from 'react';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { LocaleService } from '@univerjs/core';
import styles from './index.module.less';


export interface IThreadCommentEditorProps {
    id?: string;
    comment?: Pick<IThreadComment, 'attachments' | 'text'>;
    onChange?: (comment: Pick<IThreadComment, 'attachments' | 'text'>) => void;
}

export const ThreadCommentEditor = (props: IThreadCommentEditorProps) => {
    const { comment, onChange, id } = props;
    const localeService = useDependency(LocaleService);

    return (
        <div className={styles.threadCommentEditor}>
            <Textarea
                placeholder={localeService.t('threadCommentUI.editor.placeholder')}
                value={comment?.text}
                onChange={(text) => {
                    onChange?.({ ...comment, text });
                }}
                autoSize={{
                    minRows: 1,
                    maxRows: 3,
                }}
            />
            <div>
                <Button>
                    {localeService.t('threadCommentUI.editor.cancel')}
                </Button>
                <Button>
                    {localeService.t(id ? 'threadCommentUI.editor.save' : 'threadCommentUI.editor.reply')}
                </Button>
            </div>
        </div>
    );
};
