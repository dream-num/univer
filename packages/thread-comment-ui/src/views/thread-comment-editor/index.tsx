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

import type { IThreadComment, TextNode } from '@univerjs/thread-comment';
import { Button, Mentions } from '@univerjs/design';
import React, { useState } from 'react';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { LocaleService } from '@univerjs/core';
import styles from './index.module.less';


export interface IThreadCommentEditorProps {
    id?: string;
    comment?: Pick<IThreadComment, 'attachments' | 'text' | 'mentions'>;
    onSave?: (comment: Pick<IThreadComment, 'attachments' | 'text'>) => void;
    onCancel?: () => void;
    autoFocus?: boolean;
}

const parseMentions = (text: string): TextNode[] => {
    const regex = /@\[(.*?)\]\((\d+)\)|(\d+)/g;
    let match;
    let lastIndex = 0;
    const result: TextNode[] = [];

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
        // Add the text between two user mentions or before the first user mention
            result.push({
                type: 'text',
                content: text.substring(lastIndex, match.index),
            });
        }

        if (match[1] && match[2]) {
        // User mention found
            result.push({

                type: 'user',
                content: {
                    id: match[2],
                    label: match[1],
                },
            });
        } else if (match[3]) {
        // Text (numbers) found
            result.push({
                type: 'text',
                content: match[3],
            });
        }
        lastIndex = regex.lastIndex;
    }

    // Add any remaining text after the last mention (if any)
    if (lastIndex < text.length) {
        result.push({
            type: 'text',
            content: text.substring(lastIndex),
        });
    }

    return result;
};
const transformTextNode2Text = (nodes: TextNode[]) => {
    return nodes.map((item) => {
        switch (item.type) {
            case 'user':
                return `@[${item.content.label}](${item.content.id})`;
            default:
                return item.content;
        }
    }).join('');
};


export const ThreadCommentEditor = (props: IThreadCommentEditorProps) => {
    const { comment, onSave, id, onCancel, autoFocus } = props;
    const localeService = useDependency(LocaleService);
    const [localComment, setLocalComment] = useState({ text: [], ...comment });
    const [editing, setEditing] = useState(false);

    return (
        <div className={styles.threadCommentEditor} onClick={(e) => e.preventDefault()}>
            <Mentions
                autoFocus={autoFocus}
                style={{ width: '100%' }}
                placeholder={localeService.t('threadCommentUI.editor.placeholder')}
                value={transformTextNode2Text(localComment?.text ?? [])}
                onChange={(e) => {
                    setLocalComment?.({ ...comment, text: parseMentions(e.target.value) });
                }}
                onFocus={() => {
                    setEditing(true);
                }}
            >
                <Mentions.Mention
                    trigger="@"
                    data={[{
                        id: '11',
                        display: 'zhangwei',
                    }]}
                    displayTransform={(id, label) => `@${label} `}
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
                                setLocalComment({ text: [] });
                            }}
                        >
                            {localeService.t('threadCommentUI.editor.cancel')}
                        </Button>
                        <Button
                            type="primary"
                            disabled={!localComment.text}
                            onClick={() => {
                                onSave?.(localComment);
                                setEditing(false);
                                setLocalComment({ text: [] });
                            }}
                        >
                            {localeService.t(id ? 'threadCommentUI.editor.save' : 'threadCommentUI.editor.reply')}
                        </Button>
                    </div>
                )
                : null}
        </div>
    );
};
