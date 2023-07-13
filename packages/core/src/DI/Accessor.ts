import { Injector } from './Injector';

export interface Accessor {
    get: Injector['get'];
}
