import { ISheetUIPluginConfig } from '../../Basics';
import { CountBar } from '../CountBar';
import { EditorContainer } from '../EditorContainer/EditorContainer';
import { FormulaBar } from '../FormulaBar/FormulaBar';
import { SheetBar } from '../SheetBar';
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
        </>
    );
}
