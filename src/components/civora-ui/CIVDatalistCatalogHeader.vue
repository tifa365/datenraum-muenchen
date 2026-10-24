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
import CIVTooltip from './CIVTooltip.vue'
import CIVMaskedIcon from './CIVMaskedIcon.vue'
import { useCatalogMetricsUrls } from '@/composables/useCatalogMetricsUrls'

const { metricsUrl } = useCatalogMetricsUrls()
const titlesList = [
    'organisation.catalogs.catalogName',
    'organisation.catalogs.publisher',
    'organisation.catalogs.description',
	'organisation.catalogs.quality',
	'organisation.catalogs.actions'
]

</script>

<template>
    <div class="civ-datalist-header">
        <div class="list-header" role="row">
            <div v-for="title in titlesList" :key="title" class="list-header-title" role="columnheader">
                <p>{{ $t(title) }}</p>
                <CIVTooltip
                    v-if="title === 'organisation.catalogs.quality'"
                    :text="$t('organisation.catalogs.qualityExplanation')"
                    :label="$t('organisation.catalogs.qualityInformation')"
                    position="bottom"
                    portal
                    interactive>
                    <template #default="{ tooltipId, visible }">
                        <button
                            type="button"
                            class="quality-info-button"
                            :aria-label="$t('organisation.catalogs.qualityInformation')"
                            :aria-controls="visible ? tooltipId : undefined"
                            :aria-expanded="visible"
                            aria-haspopup="dialog">
                            <CIVMaskedIcon svg-icon="/src/assets/icons/Info.svg" />
                        </button>
                    </template>
                    <template #content>
                        <span>{{ $t('organisation.catalogs.qualityExplanation') }}</span>
                        <i18n-t v-if="metricsUrl" keypath="organisation.catalogs.qualityMoreInformation" tag="span" class="quality-more-information">
                            <template #link>
                                <a :href="metricsUrl" target="_blank" rel="noopener noreferrer" class="quality-info-link">{{ $t('organisation.catalogs.qualityInformationLink') }}</a>
                            </template>
                        </i18n-t>
                    </template>
                </CIVTooltip>
            </div>
        </div>
    </div>
</template>

<style scoped>
.quality-more-information::before {
    content: " ";
}

.civ-datalist-header .list-header {
    width: calc(100% - 80px);
    margin: 0 40px;
    padding: 0 17px;
    display: grid;
    grid-template-columns: var(
        --catalog-list-columns,
        minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1.5fr) minmax(0, 0.8fr) 54px
    );
    column-gap: 24px;
    grid-auto-rows: 50px;
    align-items: center;
    background-color: var(--color-bg-darker);
    border-bottom: 2px solid var(--color-border);
    color: var(--color-text-light);
    box-sizing: border-box;
    height: 50px;
}


.civ-datalist-header .list-header .list-header-title {
    width: auto !important;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    overflow: hidden;
}

.civ-datalist-header .list-header .list-header-title p {
    margin: 0;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-family: var(--font-family), serif;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    padding: 5px 0;
}

.civ-datalist-header .list-header .list-header-title:nth-child(4) {
    justify-content: center;
    gap: 6px;
}

.quality-info-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    cursor: help;
    border-radius: 4px;
}

.quality-info-button :deep(.masked-icon) {
    width: 18px;
    height: 18px;
    background-color: currentColor;
}

.quality-info-button:focus-visible,
.quality-info-link:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
}

.quality-info-link {
    color: inherit;
    text-decoration: underline;
}

@media (max-width: 768px) {
    .civ-datalist-header {
        display: none;
    }

    .civ-datalist-header .list-header {
        width: auto;
        margin: 0 10px;
    }
}
</style>
