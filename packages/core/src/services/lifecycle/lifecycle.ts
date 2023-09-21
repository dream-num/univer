import { Ctor, DependencyIdentifier } from '@wendellhu/redi';

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

export const LifecycleToModules = new Map<LifecycleStages, Array<DependencyIdentifier<unknown>>>();

// register some modules here that will automatically run when Univer progressed to a certain lifecycle stage
export function OnLifecycle(lifecycleStage: LifecycleStages, identifier: DependencyIdentifier<unknown>) {
    const decorator = function decorator(_registerTarget: Ctor<unknown>) {
        if (!LifecycleToModules.has(lifecycleStage)) {
            LifecycleToModules.set(lifecycleStage, []);
        }

        LifecycleToModules.get(lifecycleStage)!.push(identifier);
    };

    return decorator;
}
