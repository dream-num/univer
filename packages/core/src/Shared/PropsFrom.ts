import { Observable } from '../Observer';

/**
 * Get the type of the generic type of T
 */
export type PropsFrom<T> = T extends Observable<infer Props> ? Props : void;
