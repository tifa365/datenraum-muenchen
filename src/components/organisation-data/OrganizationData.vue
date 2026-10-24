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

<script setup>
import COSViewHeaderBackButtonPanel from "@/components/city-os/COSViewHeaderBackButtonPanel.vue";
import OrganisationDataHeader from "@/components/organisation-data/OrganisationDataHeader.vue";
import {ref} from "vue";
import OrganisationDataDatasets from "@/components/organisation-data/OrganisationDataDatasets.vue";
import OrganisationDataDraftDatasets from "@/components/organisation-data/OrganisationDataDraftDatasets.vue";

let activeTab = ref('published');
</script>

<template>

    <COSViewHeaderBackButtonPanel :context-text="$t('navigation.data-catalog')"></COSViewHeaderBackButtonPanel>
    <OrganisationDataHeader></OrganisationDataHeader>
    <div class="nav tab">
        <a
                :class="activeTab === 'published' ? 'active' : ''"
                @click="activeTab = 'published'"
        >{{ $t('components.organization-data.OrganizationData.published') }}</a>
        <a
                :class="activeTab === 'drafts' ? 'active' : ''"
                @click="activeTab = 'drafts'"
        >{{ $t('components.organization-data.OrganizationData.dataset-drafts') }}</a>
    </div>
    <keep-alive>
      <OrganisationDataDatasets v-if="activeTab === 'published'" />  
    </keep-alive>
    <OrganisationDataDraftDatasets v-if="activeTab === 'drafts'" />
</template>

<style scoped>
.nav {
    font-size: 15px;
    color: var(--button-pressed, var(--color-primary-500));
    display: flex;
    padding: 30px;
    font-weight: 500;
}

.content {
    background: var(--color-bg-dark);
    width: 100%;
    padding: 32px;
    display: flex;
    flex-wrap: wrap;
}

.tab {
    border-bottom: 2px solid var(--color-border);
    padding-bottom: 10px;
    font-size: 17px;
}
.tab a {
    cursor: pointer;
}
.active {
    color: var(--color-primary-500) !important;
    border-bottom: 1px solid var(--color-primary-500);
}
.tab a {
    margin-right: 50px;
    color: #33404a;
}
</style>
