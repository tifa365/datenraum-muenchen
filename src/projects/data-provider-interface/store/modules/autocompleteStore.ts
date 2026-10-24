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
/* eslint-disable no-param-reassign, no-shadow, no-console */
import axios from 'axios';
import generalDpiConfig from '../../config/dpi-spec-config.js';

const state = {};
const getters = {};

const actions = {
    requestFirstEntrySuggestions({ commit }, voc, base) {
        const baseMaybeTrailingSlash = base.endsWith('/') ? base : `${base}/`;
        return new Promise((resolve, reject) => {
            const req = `${baseMaybeTrailingSlash}search?filter=vocabulary&vocabulary=${voc}`;
            axios.get(req)
                .then((res) => {
                    resolve(res);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    requestAutocompleteSuggestions({ commit }, { voc, text, base }) {
        // console.log(voc,text,base); 
        return new Promise((resolve, reject) => {
            const baseMaybeTrailingSlash = base.endsWith('/') ? base : `${base}/`;
            const req = `${baseMaybeTrailingSlash}search?filter=vocabulary&vocabulary=${voc}&q=${text}`;
            axios.get(req)
                .then((res) => {
                    // console.log(res);

                    resolve(res);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    async requestResourceName({ commit }, { voc, uri, envs }) {
        try {
            const specification = envs.content.dataProviderInterface.specification;

            // Catching invalid URI's
            if (voc === undefined) return
            if (voc === "application") return

            let req;

            // vocabularies for spdx checksum and inana-media-types are structured differently in the backend then other vocabularies
            if (voc === 'iana-media-types' || voc === 'spdx-checksum-algorithm') {
                req = `${envs.api.baseUrl}vocabularies/${voc}`;

            } else {
                const value = encodeURIComponent(uri.replace(generalDpiConfig[specification].vocabPrefixes[voc], ""));
                req = `${envs.api.baseUrl}vocabularies/${voc}/${value}`;

            }
            return new Promise((resolve, reject) => {
                axios.get(req)
                    .then((res) => {
                        resolve(res);
                    })
                    .catch((err) => {
                        reject(err);

                    });
            });
        } catch (error) {
            // console.log(error);

        }

    },
};

const mutations = {};

const autocompleteModule = {
    state,
    getters,
    actions,
    mutations
};

export default autocompleteModule;