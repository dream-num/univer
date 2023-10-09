export interface IExtraModelConfig {
    /**
     * should start renderLoop Immediately
     * default is true
     */
    shouldStartRenderingImmediately?: boolean;

    // Union field properties can be only one of the following:
    /**
     * HTML selector
     * default is null
     */
    container?: string;

    /**
     * Specify the unitID of the parent render. In this case, the scene will enter
     * the sceneViewer and become a child application of the parent scene.
     * default is null
     */
    parentRenderUnitId?: string;
}
