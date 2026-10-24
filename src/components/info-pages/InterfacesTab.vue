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

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import InfoWidget from '@/components/info-pages/InfoWidget.vue';
import appConfig from '../../../config/appConfig';

const { t } = useI18n();
const customerHeaderTitle = appConfig.appHeader.headerTitle;
const customerHasDatCatalogModule = appConfig.customer.modules.dataCatalog?.available === 'true';

let searchAPIDoc = '';
let repoAPIDoc = '';
let sparqlAPIDoc = '';
if (customerHasDatCatalogModule) {
  searchAPIDoc = appConfig.piveauHubSearchUrl;
  repoAPIDoc = appConfig.piveauHubRepoUrl;
  sparqlAPIDoc = appConfig.piveauSparqlUrl;
}
</script>

<template>
  <section class="interface-info">
    <h1>{{ $t('info.interfaces.title') }}</h1>
    <p>
      {{ $t('info.interfaces.subtitle1') + customerHeaderTitle + $t('info.interfaces.subtitle2') }} <br />
      {{ $t('info.interfaces.subtitle3') }}
    </p>
    <div class="widgets">
      <InfoWidget
        icon-filename="SearchDark.svg"
        :title="$t('info.interfaces.widgets.first.title')"
        :description="$t('info.interfaces.widgets.first.subtitle')"
        :button-text="$t('info.interfaces.widgets.first.button-text')"
        :button-path="searchAPIDoc"
      />
      <InfoWidget
        icon-filename="ArrowsDark.svg"
        :title="$t('info.interfaces.widgets.second.title')"
        :description="$t('info.interfaces.widgets.second.subtitle')"
        :button-text="$t('info.interfaces.widgets.second.button-text')"
        :button-path="repoAPIDoc"
      />
      <!-- <InfoWidget
        icon-filename="StarDark.svg"
        :title="$t('info.interfaces.widgets.third.title')"
        :description="$t('info.interfaces.widgets.third.subtitle')"
        :button-text="$t('info.interfaces.widgets.third.button-text')"
        :button-path="sparqlAPIDoc"
      /> -->
    </div>
  </section>
</template>

<style scoped>
.interface-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
h1 {
  font-size: 24px;
  font-weight: 500;
  color: #33404a;
}
p {
  font-size: 16px;
  color: var(--color-neutral-600);
  max-width: 700px;
}
.widgets {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
@media (max-width: 1032px) {
  .widgets {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 768px) {
  .widgets {
    grid-template-columns: 1fr;
  }
}
</style>