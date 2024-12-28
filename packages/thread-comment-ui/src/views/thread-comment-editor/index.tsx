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

import type { IDocumentBody, IDocumentData } from '@univerjs/core';
import type { Editor, IKeyboardEventConfig } from '@univerjs/docs-ui';
import type { IThreadComment } from '@univerjs/thread-comment';
import { ICommandService, LocaleService, Tools, useDependency } from '@univerjs/core';
import { Button } from '@univerjs/design';
import { BreakLineCommand, RichTextEditor } from '@univerjs/docs-ui';
import { KeyCode } from '@univerjs/ui';
import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { SetActiveCommentOperation } from '../../commands/operations/comment.operations';
import styles from './index.module.less';

export interface IThreadCommentEditorProps {
    id?: string;
    comment?: Pick<IThreadComment, 'attachments' | 'text' | 'mentions'>;
    onSave?: (comment: Pick<IThreadComment, 'attachments' | 'text'>) => void;
    onCancel?: () => void;
    autoFocus?: boolean;
    unitId: string;
    subUnitId: string;
}

export interface IThreadCommentEditorInstance {
    reply: (text: IDocumentBody) => void;
}

function getSnapshot(body: IDocumentBody): IDocumentData {
    return {
        id: 'd',
        body,
        documentStyle: {},
    };
}

export const ThreadCommentEditor = forwardRef<IThreadCommentEditorInstance, IThreadCommentEditorProps>((props, ref) => {
    const { comment, onSave, id, onCancel, autoFocus } = props;
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const [editing, setEditing] = useState(false);
    const editor = useRef<Editor>(null);

    const keyboardEventConfig: IKeyboardEventConfig = useMemo(() => (
        {
            keyCodes: [{ keyCode: KeyCode.ENTER }],
            handler: (keyCode) => {
                if (keyCode === KeyCode.ENTER) {
                    commandService.executeCommand(
                        BreakLineCommand.id
                    );
                }
            },
        }
    ), [commandService]);

    useImperativeHandle(ref, () => ({
        reply(text) {
            editor.current?.focus();
            editor.current?.setDocumentData(getSnapshot(text));
        },
    }));

    const handleSave = () => {
        if (editor.current) {
            const newText = Tools.deepClone(editor.current.getDocumentData().body);
            setEditing(false);
            editor.current.blur();
            onSave?.({
                ...comment,
                text: newText!,
            });
            editor.current?.replaceText('', true);
        }
    };

    return (
        <div className={styles.threadCommentEditor} onClick={(e) => e.preventDefault()}>
            <RichTextEditor
                ref={editor}
                autoFocus={autoFocus}
                style={{ width: '100%' }}
                keyboardEventConfig={keyboardEventConfig}
                placeholder={localeService.t('threadCommentUI.editor.placeholder')}
                initialValue={comment?.text && getSnapshot(comment.text)}
                onFocusChange={(isFocus) => setEditing(isFocus)}
                isSingle={false}
            />
            {editing
                ? (
                    <div className={styles.threadCommentEditorButtons}>
                        <Button
                            style={{ marginRight: 12 }}
                            onClick={() => {
                                onCancel?.();
                                setEditing(false);
                                editor.current?.replaceText('', true);
                                commandService.executeCommand(SetActiveCommentOperation.id);
                            }}
                        >
                            {localeService.t('threadCommentUI.editor.cancel')}
                        </Button>
                        <Button
                            type="primary"
                            // disabled={!localComment.text}
                            onClick={handleSave}
                        >
                            {localeService.t(id ? 'threadCommentUI.editor.save' : 'threadCommentUI.editor.reply')}
                        </Button>
                    </div>
                )
                : null}
        </div>
    );
});
