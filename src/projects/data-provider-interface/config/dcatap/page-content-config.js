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

const config = {
  datasets: {
    Mandatory: [ 'title', 'datasetID', 'description', 'catalog', 'publisher', 'theme', 'issued', 'modified' ],
    Advised: [ 'keyword', 'subject', 'contactPoint', 'landingPage', 'accrualPeriodicity', 'language', 'spatial', 'temporal', 'creator', 'identifier', 'admsIdentifier', 'page', 'accessRights' ],
    Recommended: [ 'type', 'isUsedBy', 'conformsTo', 'versionInfo', 'versionNotes', 'temporalResolution', 'spatialResolutionInMeters', 'relation', 'qualifiedRelation', 'isReferencedBy', 'hasVersion', 'isVersionOf', 'source', 'provenance', 'qualifiedAttribution', 'wasGeneratedBy' ],
    Distributions: [],
    Overview: [ 'overview' ]
  },
  distributions: {
    Mandatory: [ 'accessURL', 'title', 'description' ],
    Advised: [ 'downloadUrl', 'format', 'mediaType', 'licence', 'status', 'availability', 'issued', 'modified' ],
    Recommended: [ 'type', 'byteSize', 'checksum', 'compressFormat', 'packageFormat', 'language', 'page', 'conformsTo', 'rights' ,'hasPolicy' ,'temporalResolution' , 'spatialResolutionInMeters' ],
    DataService: [ 'accessService' ]
  },
  catalogues: {
    Mandatory: [ 'title', 'datasetID', 'description', 'publisher', 'language', 'homepage', 'licence' ],
    Advised: [ 'spatial', 'hasPart', 'isPartOf', 'rights', 'catalog', 'creator' ],
  }
}

export default config;
