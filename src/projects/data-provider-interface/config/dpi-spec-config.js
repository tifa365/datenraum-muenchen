/*
 * This file is part of Civora UI.
 *
 * Copyright (C) 2025 DKSR GmbH.
 *
 * Civora UI is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

// @ts-nocheck
// dynamic imports are somehow diffcult so we need to import everything :(

// import for DCAT-AP
import pageContent from './dcatap/page-content-config';
import inputDefinition from './dcatap/input-definition';
import prefixes from './dcatap/prefixes';
import formatTypes from './dcatap/format-types';
import vocabPrefixes from './dcatap/vocab-prefixes';

// import DCAT-AP.de
import pageContentDCATAPDE from './dcatapde/page-content-config';
import inputDefinitionDCATAPDE from './dcatapde/input-definition';
import prefixesDCATAPDE from './dcatapde/prefixes';
import formatTypesDCATAPDE from './dcatapde/format-types';
import vocabPrefixesDCATAPDE from './dcatapde/vocab-prefixes';

// import DCAT-AP.de for ODB
import pageContentDCATAPDEODB from './dcatapdeODB/page-content-config';
import inputDefinitionDCATAPDEODB from './dcatapdeODB/input-definition';
import prefixesDCATAPDEODB from './dcatapdeODB/prefixes';
import formatTypesDCATAPDEODB from './dcatapdeODB/format-types';
import vocabPrefixesDCATAPDEODB from './dcatapdeODB/vocab-prefixes';


const config = {
    dcatap: {
        pageConent: pageContent,
        inputDefinition: inputDefinition,
        formatTypes: formatTypes,
        prefixes: prefixes,
        vocabPrefixes: vocabPrefixes,
    },
    dcatapde: {
        pageConent: pageContentDCATAPDE,
        inputDefinition: inputDefinitionDCATAPDE,
        formatTypes: formatTypesDCATAPDE,
        prefixes: prefixesDCATAPDE,
        vocabPrefixes: vocabPrefixesDCATAPDE,
    },
    dcatapdeODB: {
        pageConent: pageContentDCATAPDEODB,
        inputDefinition: inputDefinitionDCATAPDEODB,
        formatTypes: formatTypesDCATAPDEODB,
        prefixes: prefixesDCATAPDEODB,
        vocabPrefixes: vocabPrefixesDCATAPDEODB,
    }

};

export default config;