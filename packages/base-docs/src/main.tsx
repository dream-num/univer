import { UniverDoc } from '@univer/core';
import { RenderEngine } from '@univer/base-render';
import { UniverComponentSheet } from '@univer/style-univer';
import { DocPlugin } from './DocPlugin';
import { DEFAULT_DOCUMENT_DATA_EN } from '@univer/common-plugin-data';

const univerDocUp = UniverDoc.newInstance(DEFAULT_DOCUMENT_DATA_EN);

univerDocUp.installPlugin(new RenderEngine());
univerDocUp.installPlugin(new UniverComponentSheet());

univerDocUp.installPlugin(new DocPlugin());
