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

export interface IStartSheetTabNameEditorParams {
    slideTabItem: HTMLElement;
    canStart: () => boolean;
    checkName: (name: string) => boolean;
    setEditMode: (editing: boolean) => void;
    beforeCommit: () => void;
    onCommit: (name: string, event: FocusEvent) => void;
}

interface ISheetTabNameEditorActions {
    blurAction: (event: FocusEvent) => void;
    compositionstartAction: () => void;
    compositionendAction: () => void;
    inputAction: () => void;
    keydownAction: (event: KeyboardEvent) => void;
    pasteAction: (event: ClipboardEvent) => void;
    cleanup: () => void;
}

const MAX_SHEET_NAME_LENGTH = 31;

function getEditorText(input: HTMLElement): string {
    return input.textContent ?? '';
}

export function keepLastTextIndex(inputHtml: HTMLElement) {
    setTimeout(() => {
        const range = window.getSelection();
        if (range) {
            range.selectAllChildren(inputHtml);
            range.collapseToEnd();
        }
    });
}

export function keepTextSelected(inputHtml: HTMLElement) {
    setTimeout(() => {
        const selection = window.getSelection();
        if (!selection) return;

        const range = document.createRange();
        range.selectNodeContents(inputHtml);

        selection.removeAllRanges();
        selection.addRange(range);
    });
}

function createSheetTabNameEditorActions(
    input: HTMLElement,
    params: IStartSheetTabNameEditorParams
): ISheetTabNameEditorActions {
    let compositionFlag = true;
    let cleanup = () => { };

    const pasteAction = (event: ClipboardEvent) => {
        event.preventDefault();
        const text = event.clipboardData?.getData('text/plain');
        if (text) {
            const savedText = text.replace(/\s/g, '');
            document.execCommand('insertText', false, savedText);
        }
    };

    const blurAction = (focusEvent: FocusEvent) => {
        if (params.checkName(getEditorText(input))) {
            return;
        }

        params.setEditMode(false);
        cleanup();
        params.beforeCommit();
        params.onCommit(getEditorText(input), focusEvent);
    };

    const keydownAction = (event: KeyboardEvent) => {
        event.stopPropagation();

        if (event.key === 'Enter') {
            input.blur();
            event.preventDefault();
        }
    };

    const compositionstartAction = () => {
        compositionFlag = false;
    };

    const compositionendAction = () => {
        compositionFlag = true;
    };

    const inputAction = () => {
        setTimeout(() => {
            if (compositionFlag) {
                const text = getEditorText(input);
                if (text.length > MAX_SHEET_NAME_LENGTH) {
                    input.textContent = text.substring(0, MAX_SHEET_NAME_LENGTH);
                    keepLastTextIndex(input);
                }
            }
        }, 0);
    };

    cleanup = () => {
        input.removeAttribute('contentEditable');
        input.removeEventListener('focusout', blurAction);
        input.removeEventListener('compositionstart', compositionstartAction);
        input.removeEventListener('compositionend', compositionendAction);
        input.removeEventListener('input', inputAction);
        input.removeEventListener('keydown', keydownAction);
        input.removeEventListener('paste', pasteAction);
    };

    return {
        blurAction,
        compositionstartAction,
        compositionendAction,
        inputAction,
        keydownAction,
        pasteAction,
        cleanup,
    };
}

export function startSheetTabNameEditor(params: IStartSheetTabNameEditorParams): void {
    if (!params.canStart()) {
        return;
    }

    const input = params.slideTabItem.querySelector<HTMLElement>('span');
    if (!input) {
        return;
    }

    const actions = createSheetTabNameEditorActions(input, params);

    input.setAttribute('contentEditable', 'true');
    input.addEventListener('focusout', actions.blurAction);
    input.addEventListener('compositionstart', actions.compositionstartAction);
    input.addEventListener('compositionend', actions.compositionendAction);
    input.addEventListener('input', actions.inputAction);
    input.addEventListener('keydown', actions.keydownAction);
    input.addEventListener('paste', actions.pasteAction);
    params.setEditMode(true);
    keepTextSelected(input);
}
