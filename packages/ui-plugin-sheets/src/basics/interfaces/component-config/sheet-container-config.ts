export interface SheetContainerConfig {
    outerLeft?: boolean;

    outerRight?: boolean;

    header?: boolean;

    footer?: boolean;

    innerLeft?: boolean;

    innerRight?: boolean;

    frozenHeaderLT?: boolean;

    frozenHeaderRT?: boolean;

    frozenHeaderLM?: boolean;

    frozenContent?: boolean;

    infoBar?: boolean;

    formulaBar?: boolean;

    countBar?: boolean;

    sheetBar?: boolean;

    // Whether to show the toolbar
    toolbar?: boolean;

    rightMenu?: boolean;

    contentSplit?: boolean | string;
}
