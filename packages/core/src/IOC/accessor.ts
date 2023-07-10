import { Injector } from '@wendellhu/redi';

export interface Accessor {
    get: Injector['get'];
}
