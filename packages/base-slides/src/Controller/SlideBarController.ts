import { PLUGIN_NAMES } from '@univer/core';
import { SlidePlugin } from '../SlidePlugin';
import { SlideBar } from '../View/UI/SlideBar/SlideBar';

export class SlideBarController {
    private _plugin: SlidePlugin;

    private _slideBar: SlideBar;

    private _slideList: any[];

    constructor(plugin: SlidePlugin) {
        this._plugin = plugin;
        this._slideList = [{}, {}, {}, {}, {}];

        this._init();
    }

    private _init() {
        const context = this._plugin.context;
        const manager = context.getObserverManager();

        manager.requiredObserver<SlideBar>('onSlideBarDidMountObservable', PLUGIN_NAMES.SLIDE).add((component) => {
            this._slideBar = component;

            this._slideBar.setSlide(this._slideList);
        });
    }

    addSlide() {
        this._slideList.push({});

        this._slideBar.setSlide(this._slideList);
    }
}
