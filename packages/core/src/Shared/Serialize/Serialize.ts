import { Sequence } from './Sequence';

export declare class Serialize {
    static newInstance(sequence: Sequence): Serialize;

    static fromSequence(sequence: Sequence[]): Serialize[];
    static fromSequence(sequence: Sequence): Serialize;

    toSequence(): Sequence;
}
