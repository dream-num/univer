import { UniverDoc } from '@univer/core';
import { RenderEngine } from '@univer/base-render';
import { UniverComponentSheet } from '@univer/style-universheet';
import { DocPlugin } from './DocPlugin';
import { DOCS_DEMO_DATA } from './Basic/DemoData';

const univerDocUp = UniverDoc.newInstance(DOCS_DEMO_DATA);

univerDocUp.installPlugin(new RenderEngine());
univerDocUp.installPlugin(new UniverComponentSheet());

univerDocUp.installPlugin(new DocPlugin());
