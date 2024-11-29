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

import type { ISearchItem } from '@univerjs/sheets-formula';
import type { INavigateParam, ISearchFunctionOperationParams } from '../../../services/prompt.service';

import { Direction, IUniverInstanceService, useDependency } from '@univerjs/core';
import { Popup } from '@univerjs/design';
import { IEditorService } from '@univerjs/docs-ui';
import React, { useEffect, useRef, useState } from 'react';
import { IFormulaPromptService } from '../../../services/prompt.service';
import styles from './index.module.less';

export function SearchFunction() {
    const [visible, setVisible] = useState(false);
    const [active, setActive] = useState(0);
    const [offset, setOffset] = useState<[number, number]>([0, 0]);
    const [searchList, setSearchList] = useState<ISearchItem[]>([]);
    const [searchText, setSearchText] = useState<string>('');
    const ulRef = useRef<HTMLUListElement>(null);
    const promptService = useDependency(IFormulaPromptService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const editorService = useDependency(IEditorService);

    useEffect(() => {
        // TODO@Dushusir: How to get updated values in subscribe callback better
        let updatedSearchList: ISearchItem[] = [];
        let updatedActive = 0;
        const subscribeSearch = promptService.search$.subscribe((params: ISearchFunctionOperationParams) => {
            const { visible, searchText, searchList } = params;
            if (!visible) {
                setVisible(visible);
                return;
            }

            // const isFocusFormulaEditor = contextService.getContextValue(FOCUSING_FX_BAR_EDITOR);

            const position = getPosition();

            if (position == null) {
                return;
            }

            const { left, top, height } = position;

            setSearchText(searchText);
            setSearchList(searchList);
            updatedSearchList = searchList;
            setOffset([left, top + height]);
            setVisible(visible);
            setActive(0); // Reset active state
            updatedActive = 0;
        });

        const subscribeNavigate = promptService.navigate$.subscribe((params: INavigateParam) => {
            const { direction } = params;
            if (direction === Direction.UP) {
                let nextActive = updatedActive - 1;
                nextActive = nextActive < 0 ? updatedSearchList.length - 1 : nextActive;
                setActive(nextActive);
                updatedActive = nextActive;
            } else if (direction === Direction.DOWN) {
                let nextActive = updatedActive + 1;
                nextActive = nextActive >= updatedSearchList.length ? 0 : nextActive;
                setActive(nextActive);
                updatedActive = nextActive;
            }

            scrollToVisible(updatedActive);
        });

        const subscribeAccept = promptService.accept$.subscribe((params: boolean) => {
            const functionName = updatedSearchList[updatedActive].name;
            promptService.acceptFormulaName(functionName);
        });

        return () => {
            subscribeSearch?.unsubscribe();
            subscribeNavigate?.unsubscribe();
            subscribeAccept?.unsubscribe();
        };
    }, []);

    function getPosition() {
        const documentDataModel = univerInstanceService.getCurrentUniverDocInstance()!;

        const editorUnitId = documentDataModel.getUnitId();

        if (!editorService.isEditor(editorUnitId)) {
            return;
        }

        const editor = editorService.getEditor(editorUnitId);

        return editor?.getBoundingClientRect();
    }

    function handleLiMouseEnter(index: number) {
        setActive(index);
    }

    function handleLiMouseLeave() {
        setActive(-1);
    }

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

    return searchList.length > 0 && (
        <Popup visible={visible} offset={offset}>
            <ul className={styles.formulaSearchFunction} ref={ulRef}>
                {searchList.map((item, index) => (
                    <li
                        key={index}
                        className={active === index
                            ? `
                              ${styles.formulaSearchFunctionItem}
                              ${styles.formulaSearchFunctionItemActive}
                            `
                            : styles.formulaSearchFunctionItem}
                        onMouseEnter={() => handleLiMouseEnter(index)}
                        onMouseLeave={handleLiMouseLeave}
                        onClick={() => promptService.acceptFormulaName(item.name)}
                    >
                        <span className={styles.formulaSearchFunctionItemName}>
                            <span className={styles.formulaSearchFunctionItemNameLight}>{item.name.substring(0, searchText.length)}</span>
                            <span>{item.name.slice(searchText.length)}</span>
                        </span>
                        <span className={styles.formulaSearchFunctionItemDesc}>{item.desc}</span>
                    </li>
                ))}
            </ul>
        </Popup>
    );
}
