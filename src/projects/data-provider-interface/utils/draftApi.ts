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

import Axios from 'axios';

const createDraftApi = ({ baseURL, authToken }: { baseURL: string, authToken: string }) => {
  const maybeTrailingSlash = baseURL.endsWith('/') ? '' : '/';
  const api = Axios.create({
    baseURL: `${baseURL}${maybeTrailingSlash}drafts`,
    headers: {
      'Content-Type': 'text/turtle',
      Authorization: `Bearer ${authToken}`,
    },
  });

  // Create a new draft
  const createDatasetDraft = ({ id, catalogue, body }: { id: string, catalogue: string, body: unknown}) =>
    api.put(`/datasets/${id}`, body, {
    headers: { 'Content-Type': 'text/turtle' },
    params: { catalogue },
  });

  // Get all drafts
  const getAllDatasetDrafts = () => api.get('/datasets');

  // Get a draft by id or all drafts associated to current authorized user
  const getDatasetDrafts = ({ id = '', catalogue = '', filterByProvider = false }) => {
    const maybeId = id ? `/${id}` : '';
    return api.get(`/datasets${maybeId}`, { params: { catalogue, filterByProvider } });
  };

  // Delete a draft by id
  const deleteDatasetDraft = ({ id, catalogue }: { id: string, catalogue: string }) =>
    api.delete(`/datasets/${id}`, { params: { catalogue } });

  // Publish a draft as dataset
  const publishDatasetDraft = ({ id, catalogue, body }: { id: string, catalogue: string, body: unknown }) => {
    const maybeId = id ? `/${id}` : '';
    return api.put(`/datasets/publish${maybeId}`, body, { params: { catalogue } });
  };

  // Put a dataset back to draft
  const putDatasetToDraft = ({ id, catalogue }: { id: string, catalogue: string }) => {
    const maybeId = id ? `/${id}` : '';
    return api.put(`/datasets/hide${maybeId}`, null, { params: { catalogue } });
  };

  return {
    createDatasetDraft,
    getAllDatasetDrafts,
    getDatasetDrafts,
    deleteDatasetDraft,
    publishDatasetDraft,
    putDatasetToDraft,
  };
};

export default createDraftApi;
