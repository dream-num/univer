import { Locale } from '../Shared/Locale';
import { Nullable } from '../Shared/Types';

/**
 * Basics function of plugin
 */
export interface BasePlugin {
    getLocale(): Locale;
    getPluginName(): string;
    onDestroy(): void;

    deleteObserve(...names: string[]): void;
    getPluginByName<T extends BasePlugin>(name: string): Nullable<T>;
    /**
     * save data
     */
    save(): object;

    onMounted(): void;
    /**
     * load data
     */
    load<T>(data: T): void;
}

/**
 * Plug-in base class, all plug-ins must inherit from this base class. provides the basic method
 */
export abstract class Plugin<Obs = any, O = any> implements BasePlugin {
    context: O;

    private _name: string;

    private _observeNames: Array<keyof Obs & string>;

    protected constructor(name: string) {
        this._name = name;
        this._observeNames = [];
    }

    getLocale(): Locale {
        throw new Error('Method not implemented.');
    }

    deleteObserve(...names: string[]): void {
        throw new Error('Method not implemented.');
    }

    getPluginByName<T extends BasePlugin>(name: string): Nullable<T> {
        throw new Error('Method not implemented.');
    }

    onCreate(context: O): void {
        this.context = context;
    }

    load<T>(data: T): void {}

    save(): object {
        return Object();
    }

    onMounted(context: O): void {}

    onDestroy(): void {}

    getPluginName(): string {
        return this._name;
    }

    getContext(): O {
        return this.context;
    }
}
