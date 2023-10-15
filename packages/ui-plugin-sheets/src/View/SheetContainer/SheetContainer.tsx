import { BaseComponentProps } from '@univerjs/base-ui';

import { ISheetUIPluginConfig } from '../../Basics';
import { CountBar } from '../CountBar';
import { EditorContainer } from '../EditorContainer/EditorContainer';
import { FormulaBar } from '../FormulaBar/FormulaBar';
import { SheetBar } from '../SheetBar';

export interface BaseSheetContainerProps extends BaseComponentProps {
    config: ISheetUIPluginConfig;
    changeLocale: (locale: string) => void;
    methods?: any;
}

export function RenderSheetFooter() {
    return (
        <>
            <SheetBar />
            <CountBar />
        </>
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
