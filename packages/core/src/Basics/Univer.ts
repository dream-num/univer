import { UniverSheet } from './UniverSheet';
import { UniverDoc } from './UniverDoc';
import { UniverSlide } from './UniverSlide';
import { Nullable } from '../Shared';
import { Context } from './Context';
import { Plugin } from '../Plugin';
import { IUniverData } from '../Types/Interfaces';
import { UniverObserverImpl } from './UniverObserverImpl';

export class Univer {
    private _univerSheets: UniverSheet[];

    private _univerDocs: UniverDoc[];

    private _univerSlides: UniverSlide[];

    private _context: Context;

    constructor(univerData: Partial<IUniverData> = {}) {
        this._univerSheets = [];
        this._univerDocs = [];
        this._univerSlides = [];

        this._context = new Context(univerData);
        this._setObserver();
        this._context.onUniver(this);
    }

    addUniverSheet(univerSheet: UniverSheet): void {
        univerSheet.context.onUniver(this);
        this._univerSheets.push(univerSheet);
    }

    addUniverDoc(univerDoc: UniverDoc): void {
        univerDoc.context.onUniver(this);
        this._univerDocs.push(univerDoc);
    }

    addUniverSlide(univerSlide: UniverSlide): void {
        univerSlide.context.onUniver(this);
        this._univerSlides.push(univerSlide);
    }

    getUniverSheetInstance(id: string): Nullable<UniverSheet> {
        return this._univerSheets.find((sheet) => sheet.getUnitId() === id);
    }

    getUniverDocInstance(id: string): Nullable<UniverDoc> {
        return this._univerDocs.find((doc) => doc.getUnitId() === id);
    }

    getUniverSlideInstance(id: string): Nullable<UniverSheet> {
        return null;
    }

    getAllUniverSheetsInstance() {
        return this._univerSheets;
    }

    getAllUniverDocsInstance() {
        return this._univerDocs;
    }

    getAllUniverSlidesInstance() {
        return this._univerSlides;
    }

    /**
     * get active universheet
     * @returns
     */
    getCurrentUniverSheetInstance() {
        return this._univerSheets[0];
    }

    getCurrentUniverDocInstance() {
        return this._univerDocs[0];
    }

    getCurrentUniverSlideInstance() {
        return this._univerSlides[0];
    }

    getGlobalContext() {
        return this._context;
    }

    /**
     * install plugin
     *
     * @param plugin - install plugin
     */
    install(plugin: Plugin): void {
        this._context.getPluginManager().install(plugin);
    }

    /**
     * uninstall plugin
     *
     * @param name - plugin name
     */
    uninstall(name: string): void {
        this._context.getPluginManager().uninstall(name);
    }

    protected _setObserver(): void {
        const manager = this._context.getObserverManager();
        new UniverObserverImpl().install(manager);
    }
}
