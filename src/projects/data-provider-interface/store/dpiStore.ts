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
import formModule from './modules/formSchemaStore';
import autocompleteModule from './modules/autocompleteStore';
import conversionModule from './modules/conversionStore';
import navigationModule from './modules/navigationStore';

const state = {};
const getters = {};
const actions = {};
const mutations = {};

const module = {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
  modules: {
    formModule,
    autocompleteModule,
    conversionModule,
    navigationModule
  }
};

export default module;
