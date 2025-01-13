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

import type { Editor } from '@univerjs/docs-ui';
import type { ISequenceNode } from '@univerjs/engine-formula';
import { CommandType, DisposableCollection, ICommandService, useDependency } from '@univerjs/core';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { IShortcutService, KeyCode, RectPopup } from '@univerjs/ui';
import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { useEditorPostion } from '../hooks/useEditorPostion';
import { useFormulaSearch } from '../hooks/useFormulaSearch';
import { useStateRef } from '../hooks/useStateRef';
import styles from './index.module.less';

interface ISearchFunctionProps {
    isFocus: boolean;
    sequenceNodes: (string | ISequenceNode)[];
    onSelect: (data: {
        text: string;
        offset: number;
    }) => void;
    onChange?: (functionName: string) => void;
    editor: Editor;
    onClose?: () => void;
};
const noop = () => { };
export const SearchFunction = forwardRef<HTMLElement, ISearchFunctionProps>(SearchFunctionFactory);
function SearchFunctionFactory(props: ISearchFunctionProps, ref: any) {
    const { isFocus, sequenceNodes, onSelect, editor, onClose = noop } = props;
    const editorId = editor.getEditorId();
    const shortcutService = useDependency(IShortcutService);
    const commandService = useDependency(ICommandService);
    const { searchList, searchText, handlerFormulaReplace, reset: resetFormulaSearch } = useFormulaSearch(isFocus, sequenceNodes, editor);
    const visible = useMemo(() => !!searchList.length, [searchList]);
    const ulRef = useRef<HTMLUListElement>();
    const [active, activeSet] = useState(0);
    const isEnableMouseEnterOrOut = useRef(false);
    const [position$] = useEditorPostion(editorId, visible, [searchText, searchList]);
    const stateRef = useStateRef({ searchList, active });

    const handleFunctionSelect = (v: string) => {
        const res = handlerFormulaReplace(v);
        if (res) {
            resetFormulaSearch();
            onSelect(res);
        }
    };

    function handleLiMouseEnter(index: number) {
        if (!isEnableMouseEnterOrOut.current) {
            return;
        }
        activeSet(index);
    }

    function handleLiMouseLeave() {
        if (!isEnableMouseEnterOrOut.current) {
            return;
        }
        activeSet(-1);
    }

    useEffect(() => {
        if (!searchList.length) {
            return;
        }
        // 注册方向键事件
        const operationId = `sheet.formula-embedding-editor.search_function.${editorId}`;
        const d = new DisposableCollection();
        const handleKeycode = (keycode: KeyCode) => {
            const { searchList, active } = stateRef.current;

            switch (keycode) {
                case KeyCode.ARROW_UP: {
                    activeSet((pre) => {
                        const res = Math.max(0, pre - 1);
                        scrollToVisible(res);
                        return res;
                    });

                    break;
                }
                case KeyCode.ARROW_DOWN: {
                    activeSet((pre) => {
                        const res = Math.min(searchList.length - 1, pre + 1);
                        scrollToVisible(res);
                        return res;
                    });
                    break;
                }
                case KeyCode.TAB:
                case KeyCode.ENTER: {
                    const item = searchList[active];
                    handleFunctionSelect(item.name);
                    break;
                }
                case KeyCode.ESC: {
                    resetFormulaSearch();
                    onClose();
                    break;
                }
            }
        };
        d.add(commandService.registerCommand({
            id: operationId,
            type: CommandType.OPERATION,
            handler(_event, params) {
                const { keyCode } = params as { eventType: DeviceInputEventType; keyCode: KeyCode };
                handleKeycode(keyCode);
            },
        }));

        [KeyCode.ARROW_UP, KeyCode.ARROW_DOWN, KeyCode.ENTER, KeyCode.ESC, KeyCode.TAB].map((keyCode) => {
            return {
                id: operationId,
                binding: keyCode,
                preconditions: () => true,
                priority: 1000,
                staticParameters: {
                    eventType: DeviceInputEventType.Keyboard,
                    keyCode,
                },
            };
        }).forEach((item) => {
            d.add(shortcutService.registerShortcut(item));
        });

        return () => {
            d.dispose();
        };
    }, [searchList]);

    function scrollToVisible(liIndex: number) {
        // Get the <li> element
        const liElement = ulRef.current?.querySelectorAll(`.${styles.formulaSearchFunctionItem}`)[
            liIndex
        ] as HTMLLIElement;

        if (!liElement) return;

        // Get the <ul> element
        const ulElement = liElement.parentNode as HTMLUListElement;

        if (!ulElement) return;

        // Get the height of the <ul> element
        const ulRect = ulElement.getBoundingClientRect();
        const ulTop = ulRect.top;
        const ulHeight = ulElement.offsetHeight;

        // Get the position and height of the <li> element
        const liRect = liElement.getBoundingClientRect();
        const liTop = liRect.top;
        const liHeight = liRect.height;

        // If the <li> element is within the visible area, no scrolling operation is performed
        if (liTop >= 0 && liTop > ulTop && liTop - ulTop + liHeight <= ulHeight) {
            return;
        }

        // Calculate scroll position
        const scrollTo = liElement.offsetTop - (ulHeight - liHeight) / 2;

        // Perform scrolling operation
        ulElement.scrollTo({
            top: scrollTo,
            behavior: 'smooth',
        });
    }

    const debounceResetMouseState = useMemo(() => {
        let time = '' as any;
        return () => {
            clearTimeout(time);
            isEnableMouseEnterOrOut.current = true;
            time = setTimeout(() => {
                isEnableMouseEnterOrOut.current = false;
            }, 300);
        };
    }, []);

    return searchList.length > 0 && visible && (
        <RectPopup portal anchorRect$={position$} direction="vertical">
            <ul
                className={styles.formulaSearchFunction}
                ref={(v) => {
                    ulRef.current = v!;
                    if (ref) {
                        ref.current = v!;
                    }
                }}
            >
                {searchList.map((item, index) => (
                    <li
                        key={item.name}
                        className={active === index
                            ? `
                              ${styles.formulaSearchFunctionItem}
                              ${styles.formulaSearchFunctionItemActive}
                            `
                            : styles.formulaSearchFunctionItem}
                        onMouseEnter={() => handleLiMouseEnter(index)}
                        onMouseLeave={handleLiMouseLeave}
                        onMouseMove={debounceResetMouseState}
                        onClick={() => {
                            handleFunctionSelect(item.name);
                            if (editor) {
                                editor.focus();
                            }
                        }}
                    >
                        <span className={styles.formulaSearchFunctionItemName}>
                            <span className={styles.formulaSearchFunctionItemNameLight}>{item.name.substring(0, searchText.length)}</span>
                            <span>{item.name.slice(searchText.length)}</span>
                        </span>
                        <span className={styles.formulaSearchFunctionItemDesc}>{item.desc}</span>
                    </li>
                ))}
            </ul>
        </RectPopup>
    );
}
