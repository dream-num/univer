/**
 * This enum defines multiple lifecycle stages in Univer SDK.
 */
export const enum LifecycleStages {
    /**
     * Register plugins to Univer.
     */
    Staring,

    /**
     * Univer business instances (UniverDoc / UniverSheet / UniverSlide) are created and services or controllers provided by
     * plugins get intialized. The application is ready to do the first-time rendering.
     */
    Ready,

    /**
     * First-time rendering is completed.
     */
    Rendered,

    /**
     * All lazy tasks are completed. The application is fully ready to provide features to users.
     */
    Steady,
}
