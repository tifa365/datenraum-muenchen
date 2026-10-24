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

// config defining which properties are displayed on which page
import generalDpiConfig from '../../config/dpi-spec-config.js';

const state = {
    navigation: {
        datasets: [],
        distributions: [],
        catalogues: [],
    }
};

const getters = {
    getNavSteps: (state) => (specification) => {
        const dpiConfig = generalDpiConfig[specification];
        setConfig(dpiConfig);
       
        return state.navigation;
    },
};
function setConfig(specification) {
    state.navigation.datasets = Object.keys(specification.pageConent.datasets);
    state.navigation.distributions = Object.keys(specification.pageConent.distributions);
    state.navigation.catalogues = Object.keys(specification.pageConent.catalogues);
}

const actions = {};
const mutations = {};

const navigationModule = {
    state,
    getters,
    actions,
    mutations
};

export default navigationModule;