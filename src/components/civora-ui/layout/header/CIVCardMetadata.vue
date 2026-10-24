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
import CIVTag from '../../CIVTag.vue';
import CIVTransparentCard from '../../CIVTransparentCard.vue';


const props = defineProps({
    formate: Array,
    author: String,
    createdAt: String,
    updatedAt: String,
    themes: Array,
    license: Array,
    cardStyle: {
        type: Object,
        default: () => ({})
    },
    cardClass: {
        type: String,
        default:""
    },
})

const list = [
    {
        title: 'kdw.sdk.formats',
        value: props.formate,
    }, {
        title: 'kdw.sdk.author',
        value: props.author,
    }, {
        title: 'kdw.sdk.created-date',
        value: props.createdAt,
    }, {
        title: 'kdw.sdk.last-update',
        value: props.updatedAt,
    }, {
        title: 'kdw.sdk.topics',
        value: props.themes,
    }, {
        title: 'kdw.sdk.license',
        value: props.license,
    }
]
</script>

<template>
    <CIVTransparentCard :cardClass="cardClass">
        <div class="content">
            <template v-for="{ value, title } in list" :key="title">
                <div v-if="value" class="box">
                    <p class="title title-md">{{ $t(title) }}</p>
                    <div v-if="Array.isArray(value)" class="formate-items">
                        <CIVTag v-for="(text, index) in value" :key="index" :text="text"
                            :hasCloseIcon="false" :hasDotIcon="false" />
                        <p v-if="value.length === 0" class="text body-lg">/</p>
                    </div>
                    <p v-else class="text body-lg">{{ value }}</p>
                </div>
            </template>
        </div>
    </CIVTransparentCard>
</template>

<style scoped>
.content {
    height: 488px;
    gap: 24px;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: start;
}

.box {
    width: 100%;
    display: flex;
    gap: 4px;
    flex-direction: column;
    align-items: start;
}

.formate-items {
    display: flex;
    gap: 8px;
}

.title {
    color: var(--color-text-regular);
}

.text {
    color: var(--color-text-light);
}
</style>