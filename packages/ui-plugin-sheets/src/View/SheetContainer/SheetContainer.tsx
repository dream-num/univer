import { ISheetUIPluginConfig } from '../../Basics';
import { CountBar } from '../CountBar';
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
