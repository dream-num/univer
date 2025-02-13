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

export function onLoad(univerAPI) {
    let mode = 'normal';

    let label;
    function setMode(m) {
        mode = m;
        if (!label) {
            label = document.createElement('div');
            label.style.position = 'fixed';
            label.style.bottom = '36px';
            label.style.left = '0';
            label.style.borderTopRightRadius = '4px';
            label.style.backgroundColor = 'rgb(255, 255, 255)';
            label.style.zIndex = '1000000';
            label.style.paddingLeft = '8px';
            label.style.width = '120px';
            label.style.fontSize = '14px';
            label.style.fontFamily = 'monospace';

            document.body.append(label);
        }

        label.textContent = `Vim: ${mode}`;
        switch (mode) {
            case 'normal':
                label.style.color = 'rgb(115, 141, 242)';
                break;
            case 'insert':
                label.style.color = 'rgb(223, 93, 0)';
                break;
            case 'visual':
                label.style.color = 'rgb(139, 187, 17)';
                break;
        }
    }

    setMode('normal');

    univerAPI.getShortcut().disableShortcut();

    univerAPI.onCommandExecuted((command) => {
        if (command.id.startsWith('sheet.operation.set-cell-edit-visible')) {
            if (command.params.visible) {
                setMode('insert');
            } else {
                setMode('normal');
            }
        } else if (command.id === 'sheet.operation.set-selections') {
            if (command.params.selections.length > 1) {
                setMode('visual');
                return;
            }

            const length = command.params.selections.length;
            const range = command.params.selections[length - 1].range;
            const primary = command.params.selections[length - 1].primary;

            if (
                range.startRow !== primary.startRow
                || range.startColumn !== primary.startColumn
                || range.endRow !== primary.endRow
                || range.endColumn !== primary.endColumn
            ) {
                setMode('visual');
            }
        }
    });

    window.addEventListener('keydown', (e) => {
        if (mode === 'normal') {
            if (e.key === 'i') {
                setMode('insert');

                univerAPI.getShortcut().enableShortcut();
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            if (e.key === 'j') {
                univerAPI.executeCommand('sheet.command.move-selection', { direction: 2 });
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            if (e.key === 'k') {
                univerAPI.executeCommand('sheet.command.move-selection', { direction: 0 });
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            if (e.key === 'l') {
                univerAPI.executeCommand('sheet.command.move-selection', { direction: 1 });
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            if (e.key === 'h') {
                univerAPI.executeCommand('sheet.command.move-selection', { direction: 3 });
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            if (e.key === 'v') {
                setMode('visual');

                e.preventDefault();
                e.stopPropagation();
                return;
            }

            if (e.key === 'y') {
                univerAPI.executeCommand('univer.command.copy');

                e.preventDefault();
                e.stopPropagation();
                return;
            }

            if (e.key === 'd') {
                univerAPI.executeCommand('univer.command.cut');
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            if (e.key === 'p') {
                univerAPI.executeCommand('univer.command.paste');
                setMode('normal');
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            if (!univerAPI.getShortcut().dispatchShortcutEvent(e)) {
                e.preventDefault();
                e.stopPropagation();
            }
        }

        if (mode === 'insert' && e.key === 'Escape') {
            setMode('normal');

            univerAPI.getShortcut().disableShortcut();
            e.preventDefault();
            e.stopPropagation();
        }

        if (mode === 'visual') {
            if (e.key === 'j') {
                univerAPI.executeCommand('sheet.command.expand-selection', { direction: 2 });
                e.preventDefault();
                e.stopPropagation();
            }

            if (e.key === 'k') {
                univerAPI.executeCommand('sheet.command.expand-selection', { direction: 0 });
                e.preventDefault();
                e.stopPropagation();
            }

            if (e.key === 'l') {
                univerAPI.executeCommand('sheet.command.expand-selection', { direction: 1 });
                e.preventDefault();
                e.stopPropagation();
            }

            if (e.key === 'h') {
                univerAPI.executeCommand('sheet.command.expand-selection', { direction: 3 });
                e.preventDefault();
                e.stopPropagation();
            }

            if (e.key === 'y') {
                univerAPI.executeCommand('univer.command.copy');

                setMode('normal');
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            if (e.key === 'd') {
                univerAPI.executeCommand('univer.command.cut');
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            if (e.key === 'p') {
                univerAPI.executeCommand('univer.command.paste');
                setMode('normal');
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            if (e.key === 'Escape') {
                setMode('normal');

                e.preventDefault();
                e.stopPropagation();
                return;
            }

            if (!univerAPI.getShortcut().dispatchShortcutEvent(e)) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
    });
}
