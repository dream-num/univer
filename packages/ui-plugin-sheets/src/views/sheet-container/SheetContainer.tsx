import React from 'react';

import { ISheetUIPluginConfig } from '../../basics';
import { CountBar } from '../count-bar/CountBar';
import { EditorContainer } from '../editor-container/EditorContainer';
import { FormulaBar } from '../formula-bar/FormulaBar';
import { OperateContainer } from '../operate-container/OperateContainer';
import { SheetBar } from '../sheet-bar/SheetBar';
import { StatusBar } from '../status-bar/StatusBar';
import styles from './index.module.less';

export interface BaseSheetContainerProps {
    config: ISheetUIPluginConfig;
    changeLocale: (locale: string) => void;
    methods?: any;
}

export function RenderSheetFooter() {
    return (
        <section className={styles.sheetContainer}>
            <SheetBar />
            <StatusBar />
            <CountBar />
        </section>
    );
}

export function RenderSheetHeader() {
    return (
        <>
            <FormulaBar />
        </>
    );
}

export function RenderSheetContent() {
    return (
        <>
            <EditorContainer />
            <OperateContainer />
        </>
    );
}
