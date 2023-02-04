export * from '../index';
declare module '@univerjs/core' {}

declare global {
    interface Navigator {
        pointerEnabled?: any;
    }
}
