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

const createIdentifiersApi = ({ baseURL, authToken }: { baseURL: string, authToken: string }) => {
  const maybeTrailingSlash = baseURL.endsWith('/') ? '' : '/';
  const api = Axios.create({
    baseURL: `${baseURL}${maybeTrailingSlash}identifiers`,
    headers: {
      'Content-Type': 'text/turtle',
      Authorization: `Bearer ${authToken}`,
    },
  });

  // Create persistent identifier for a dataset id (Register DOI)
  const createPersistentIdentifier = ({ id, catalogue, type = 'mock' }: { id: string, catalogue: string, type?: string }) => api
    .put(`/datasets/${id}`, null, { params: { catalogue, type } });

  return {
    createPersistentIdentifier,
  };
};

export default createIdentifiersApi;
