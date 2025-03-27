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

import type { IDocumentData } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { Editor } from '../../../services/editor/editor';
import { getPlainText, ICommandService } from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';
import { useDependency } from '@univerjs/ui';
import { useEffect } from 'react';

export function useOnChange(editor: Editor | undefined, onChange: (data: IDocumentData, str: string) => void) {
    const commandService = useDependency(ICommandService);

    useEffect(() => {
        if (!editor) return;
        const dispose = commandService.onCommandExecuted((command) => {
            if (command.id === RichTextEditingMutation.id) {
                const params = command.params as IRichTextEditingMutationParams;
                if (params.unitId !== editor.getEditorId()) return;
                const data = editor.getDocumentData();
                onChange(data, getPlainText(data.body?.dataStream ?? ''));
            }
        });

        return () => {
            dispose.dispose();
        };
    }, [editor, onChange, commandService]);
}
