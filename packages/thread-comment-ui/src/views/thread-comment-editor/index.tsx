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
import type { MentionProps } from '@univerjs/design';
import { Button, Mention, Mentions } from '@univerjs/design';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { useDependency } from '@wendellhu/redi/react-bindings';
import type { IDocumentBody } from '@univerjs/core';
import { LocaleService } from '@univerjs/core';
import { IThreadCommentMentionDataService } from '../../services/thread-comment-mention-data.service';
import styles from './index.module.less';
import { parseMentions, transformDocument2TextNodes, transformMention, transformTextNode2Text, transformTextNodes2Document } from './util';

export interface IThreadCommentEditorProps {
    id?: string;
    comment?: Pick<IThreadComment, 'attachments' | 'text' | 'mentions'>;
    onSave?: (comment: Pick<IThreadComment, 'attachments' | 'text'>) => void;
    onCancel?: () => void;
    autoFocus?: boolean;
}

export interface IThreadCommentEditorInstance {
    reply: (text: IDocumentBody) => void;
}

const defaultRenderSuggestion: MentionProps['renderSuggestion'] = (mention, search, highlightedDisplay, index, focused) => {
    const icon = (mention as any).raw?.icon;
    return (
        <div className={styles.threadCommentEditorSuggestion}>
            {icon ? <img className={styles.threadCommentEditorSuggestionIcon} src={icon} /> : null}
            <div>
                {mention.display ?? mention.id}
            </div>
        </div>
    );
};

export const ThreadCommentEditor = forwardRef<IThreadCommentEditorInstance, IThreadCommentEditorProps>((props, ref) => {
    const { comment, onSave, id, onCancel, autoFocus } = props;
    const mentionDataService = useDependency(IThreadCommentMentionDataService);
    const localeService = useDependency(LocaleService);
    const [localComment, setLocalComment] = useState({ ...comment });
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);

    useImperativeHandle(ref, () => ({
        reply(text) {
            setLocalComment({
                ...comment,
                text,
                attachments: [],
            });
            (inputRef.current as any)?.inputElement.focus();
        },
    }));

    return (
        <div className={styles.threadCommentEditor} onClick={(e) => e.preventDefault()}>
            <Mentions
                ref={inputRef}
                autoFocus={autoFocus}
                style={{ width: '100%' }}
                placeholder={localeService.t('threadCommentUI.editor.placeholder')}
                value={localComment?.text ? transformTextNode2Text(transformDocument2TextNodes(localComment.text)) : ''}
                onChange={(e) => {
                    const text = e.target.value;
                    if (!text) {
                        setLocalComment({ ...comment, text: undefined });
                    }
                    setLocalComment?.({ ...comment, text: transformTextNodes2Document(parseMentions(e.target.value)) });
                }}
                onFocus={() => {
                    setEditing(true);
                }}
            >
                <Mention
                    key={mentionDataService.trigger}
                    trigger={mentionDataService.trigger}
                    data={(query, callback) => mentionDataService.getMentions!(query)
                        .then((res) => res.map(transformMention)).then(callback) as any}
                    displayTransform={(id, label) => `@${label} `}
                    renderSuggestion={mentionDataService.renderSuggestion ?? defaultRenderSuggestion}
                />
            </Mentions>
            {editing
                ? (
                    <div className={styles.threadCommentEditorButtons}>
                        <Button
                            style={{ marginRight: 12 }}
                            onClick={() => {
                                onCancel?.();
                                setEditing(false);
                                setLocalComment({ text: undefined });
                            }}
                        >
                            {localeService.t('threadCommentUI.editor.cancel')}
                        </Button>
                        <Button
                            type="primary"
                            disabled={!localComment.text}
                            onClick={() => {
                                if (localComment.text) {
                                    onSave?.({
                                        ...localComment,
                                        text: localComment.text,
                                    });
                                    setEditing(false);
                                    setLocalComment({ text: undefined });
                                }
                            }}
                        >
                            {localeService.t(id ? 'threadCommentUI.editor.save' : 'threadCommentUI.editor.reply')}
                        </Button>
                    </div>
                )
                : null}
        </div>
    );
});
