export * from '../index';
declare module '@univer/core' { }

declare global {
    interface Navigator {
        pointerEnabled?: any;
    }
}
