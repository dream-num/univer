import type { Ctor, DependencyIdentifier } from '@wendellhu/redi';

/**
 * This enum defines multiple lifecycle stages in Univer SDK.
 */
export const enum LifecycleStages {
    /**
     * Register plugins to Univer.
     */
    Starting,

    /**
     * Univer business instances (UniverDoc / UniverSheet / UniverSlide) are created and services or controllers provided by
     * plugins get initialized. The application is ready to do the first-time rendering.
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

export const LifecycleNameMap = {
    [LifecycleStages.Starting]: 'Starting',
    [LifecycleStages.Ready]: 'Ready',
    [LifecycleStages.Rendered]: 'Rendered',
    [LifecycleStages.Steady]: 'Steady',
};

export const LifecycleToModules = new Map<LifecycleStages, Array<DependencyIdentifier<unknown>>>();

/**
 * Register some modules here that will automatically run when Univer progressed to a certain lifecycle stage
 */
export function OnLifecycle(lifecycleStage: LifecycleStages, identifier: DependencyIdentifier<unknown>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const decorator = function decorator(_: Ctor<unknown>) {
        runOnLifecycle(lifecycleStage, identifier);
    };

    return decorator;
}

export function runOnLifecycle(lifecycleStage: LifecycleStages, identifier: DependencyIdentifier<unknown>) {
    if (!LifecycleToModules.has(lifecycleStage)) {
        LifecycleToModules.set(lifecycleStage, []);
    }

    LifecycleToModules.get(lifecycleStage)!.push(identifier);
}
