export interface SlideContainerConfig {
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

    countBar?: boolean;

    // Whether to show the toolbar
    toolbar?: boolean;

    rightMenu?: boolean;

    contentSplit?: boolean | string;
}
