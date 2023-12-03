import { SelectionManagerService } from '@univerjs/sheets';
import { LocaleService } from '@univerjs/core';
import { Tooltip } from '@univerjs/design';
import { SelectRangeSingle } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useRef, useState } from 'react';

import styles from './index.module.less';

export interface IRangeSelectorProps {
    onChange: (range: string) => void;
    onActive: (active: boolean) => void;
}

export function RangeSelector(props: IRangeSelectorProps) {
    const { onChange, onActive } = props;
    const [active, setActive] = useState(false);
    const editableRef = useRef<HTMLDivElement>(null);
    const localeService = useDependency(LocaleService);
    const textSelectionManagerService = useDependency(SelectionManagerService);

    useEffect(() => {
        if (active) {
            onActive(active);
            const subscribe = textSelectionManagerService.selectionInfo$.subscribe((selectionInfo) => {
                // TODO@Dushusir: get range text info from selectionInfo
                const rangeTextList = ['A1', 'B2:C3', 'Sheet2!A1:B2', 'D10:E11,F1:G2,H3:I4'];
                const randomIndex = Math.floor(Math.random() * rangeTextList.length);
                const range = rangeTextList[randomIndex];

                if (editableRef.current) {
                    editableRef.current.innerHTML = range;
                }
            });

            document.addEventListener('click', handleActiveClick);

            return () => {
                document.removeEventListener('click', handleActiveClick);
                subscribe.unsubscribe();
            };
        }
        onChange(editableRef.current?.innerHTML || '');
    }, [active]);

    function handleActiveClick(e: MouseEvent) {
        // content and footer area, used to select the area
        const selector = (e.target as Element)?.closest('[data-range-selector="true"]');
        if (selector) return;

        // Current editor area
        if (e.target === editableRef.current) return;

        // Right button
        const editorContainer = (e.target as Element)?.closest(`.${styles.rangeSelector}`);
        const editor = editorContainer?.querySelector(`.${styles.rangeSelectorEditor}`);
        if (editor === editableRef.current) return;

        setActive(false);
        editableRef.current?.blur();
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
        e.stopPropagation();
        if (e.key === 'Enter') {
            e.preventDefault();
            e.currentTarget.blur();
            setActive(false);
        }
    }

    function handleFocus() {
        setActive(true);
    }

    function handleClick() {
        if (!active) {
            editableRef.current?.focus();
            return;
        }
        setActive(!active);
    }

    return (
        <div className={active ? `${styles.rangeSelector} ${styles.rangeSelectorActive}` : styles.rangeSelector}>
            <div
                ref={editableRef}
                className={styles.rangeSelectorEditor}
                contentEditable
                data-placeholder={localeService.t('rangeSelector.placeholder')}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
            />

            <Tooltip title={localeService.t('rangeSelector.tooltip')} placement="bottom">
                <button className={styles.rangeSelectorIcon} onClick={handleClick}>
                    <SelectRangeSingle />
                </button>
            </Tooltip>
        </div>
    );
}
