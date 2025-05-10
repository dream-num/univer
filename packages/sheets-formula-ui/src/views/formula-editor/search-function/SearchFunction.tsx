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

import type { Editor } from '@univerjs/docs-ui';
import type { ISequenceNode } from '@univerjs/engine-formula';
import { CommandType, DisposableCollection, ICommandService } from '@univerjs/core';
import { borderClassName, clsx, scrollbarClassName } from '@univerjs/design';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { IShortcutService, KeyCode, RectPopup, useDependency } from '@univerjs/ui';
import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { useEditorPosition } from '../hooks/use-editor-position';
import { useFormulaSearch } from '../hooks/use-formula-search';
import { useStateRef } from '../hooks/use-state-ref';

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
    const ulRef = useRef<HTMLUListElement>(undefined);
    const [active, activeSet] = useState(0);
    const isEnableMouseEnterOrOut = useRef(false);
    const [position$] = useEditorPosition(editorId, visible, [searchText, searchList]);
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
        // Get the <li> element directly from children
        const ulElement = ulRef.current;
        if (!ulElement) return;

        const liElement = ulElement.children[liIndex] as HTMLLIElement;
        if (!liElement) return;

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
                ref={(v) => {
                    ulRef.current = v!;
                    if (ref) {
                        ref.current = v!;
                    }
                }}
                className={clsx(`
                  univer-m-0 univer-box-border univer-max-h-[400px] univer-w-[250px] univer-list-none
                  univer-overflow-y-auto univer-rounded-lg univer-bg-white univer-p-2 univer-leading-5 univer-shadow-md
                  univer-outline-none
                `, borderClassName, scrollbarClassName)}
            >
                {searchList.map((item, index) => (
                    <li
                        key={item.name}
                        className={clsx(`
                          univer-box-border univer-cursor-pointer univer-rounded univer-px-2 univer-py-1
                          univer-text-gray-900 univer-transition-colors
                          dark:univer-text-white
                        `, {
                            'univer-bg-gray-200 dark:univer-bg-gray-600': active === index,
                        })}
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
                        <span className="univer-text-xs">
                            <span className="univer-text-red-500">{item.name.substring(0, searchText.length)}</span>
                            <span>{item.name.slice(searchText.length)}</span>
                        </span>
                        <span
                            className="univer-block univer-text-xs univer-text-gray-400"
                        >
                            {item.desc}
                        </span>
                    </li>
                ))}
            </ul>
        </RectPopup>
    );
}
