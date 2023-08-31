export * from './Basics';
export * from './Common';
export * from './Interfaces';
export * from './Enum';
export * from './Utils';
export * from './Helpers';
export * from './Components';
export * from './BaseComponent';
export * from './UIPlugin';

export { IMenuService, IMenuItem, MenuPosition, DesktopMenuService, IDisplayMenuItem } from './services/menu/menu.service';
export { KeyCode, MetaKeys } from './services/shortcut/keycode';
export { IShortcutService, IShortcutItem, DesktopShortcutService } from './services/shortcut/shorcut.service';
export { IPlatformService, DesktopPlatformService } from './services/platform/platform.service';

export { SharedController } from './controllers/shared-shortcut.controller';
