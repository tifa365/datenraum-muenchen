<!--
  ~ This file is part of Civora UI.
  ~
  ~ Copyright (C) 2025 DKSR GmbH.
  ~
  ~ Civora UI is free software: you can redistribute it and/or modify
  ~ it under the terms of the GNU Affero General Public License as published by
  ~ the Free Software Foundation, version 3.
  ~
  ~ This program is distributed in the hope that it will be useful,
  ~ but WITHOUT ANY WARRANTY; without even the implied warranty of
  ~ MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  ~ GNU Affero General Public License for more details.
  ~
  ~ You should have received a copy of the GNU Affero General Public License
  ~ along with this program. If not, see <https://www.gnu.org/licenses/>.
-->

<template>
  <div style="height:370px;">
    <div class="spinner"></div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  props: ['id', 'property', 'catalog'],
  data() {
    return {
      hubUrl: this.$env.api.hubUrl.endsWith('/') ? this.$env.api.hubUrl : this.$env.api.hubUrl + '/',
    };
  },
  computed: {
    ...mapGetters('auth', [
      'getIsDraft',
      'getUserData',
    ]),
    token() {
      return this.getUserData.rtpToken;
    },
    redirectUri() {
      return `${this.$env.content.dataProviderInterface.basePath}/${this.property}?locale=${this.$i18n.locale}`;
    },
  },
  methods: {
    ...mapActions('auth', [
      'setIsEditMode',
      'setIsDraft',
    ]),
    ...mapActions('dpiStore', [
      'convertToInput',
    ]),
    async setupEditPage() {
      let endpoint;
      this.setIsEditMode(true);
      const specification = this.$env.content.dataProviderInterface.specification;

      if (this.getIsDraft) {
        this.setIsDraft(true);
        endpoint = `${this.hubUrl}drafts/datasets/${this.id}.nt?catalogue=${this.catalog}`;
        await this.convertToInput({endpoint, token: this.token, property: this.property, id: this.id, specification: specification });
      } else {
        this.setIsDraft(false);
        if (this.property === 'catalogues') {
          endpoint = `${this.hubUrl}catalogues/${this.catalog}.nt`;
          await this.convertToInput({endpoint, token: this.token, property: this.property, id: this.catalog, specification: specification });
        } else {
          endpoint = `${this.hubUrl}datasets/${this.id}.nt?useNormalizedId=true`;
          await this.convertToInput({endpoint, token: this.token, property: this.property, id: this.id, specification: specification });
        } 
      }

      this.$router.push(this.redirectUri).catch(() => {});
    },
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (from.fullPath.startsWith(vm.redirectUri)) {
        vm.$router.go(-1);
      } else vm.setupEditPage();
    });
  },
};
</script>
