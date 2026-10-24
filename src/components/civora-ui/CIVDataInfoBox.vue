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
import { computed } from 'vue'
import CIVTag from '@/components/civora-ui/CIVTag.vue'
import type { DatasetType } from '@/projects/kdw/utils/types'

const ACCESS_LEVEL_ICON_MAP: Record<string, string> = {
  public: '/src/assets/icons/OpenData.svg',
  'non-public': '/src/assets/icons/Non-public.svg',
  internal: '/src/assets/icons/Internal-data.svg',
  restricted: '/src/assets/icons/Non-public.svg',
  confidential: '/src/assets/icons/Internal-data.svg',
}

const DEFAULT_ICON = '/src/assets/icons/globeIcon.svg'

interface Props {
  superTitle?: string
  title?: string
  text?: string
  formats?: string[]
  categories?: string[]
  issued?: string
  to: string
  href?: string
  ghost?: boolean
  datasetType?: DatasetType
  isHvd?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  to: ''
})

const iconSrc = computed(() =>
  props.datasetType && props.datasetType.toLowerCase() !== 'kritis'
    ? (ACCESS_LEVEL_ICON_MAP[props.datasetType.toLowerCase()] ?? DEFAULT_ICON)
    : DEFAULT_ICON
)

const isKritis = computed(() => props.datasetType === 'kritis')

const wrapperAttrs = computed(() => props.to.startsWith('https') ?
  {
    href: props.to,
    target: '_blank',
    rel: 'noopener noreferrer'
  } : {
    to: props.to
  }
)
</script>

<template>
  <component v-if="!props.ghost" :is="to.startsWith('http') ? 'a' : 'router-link'" v-bind="wrapperAttrs" class="datainfoBox">
    <div class="iconBox">
      <slot name="icon">
        <span
            v-if="isKritis"
            class="icon-[ph--warning]"
            style="width:25px;height:25px"
          />
          <img
            v-else
            :src="iconSrc"
            :alt="props.datasetType ?? 'dataset'"
            width="25"
            height="25"
          />
      </slot>
    </div>
    <div class="content-box">
      <slot>
        <div class="about">
          <div class="text-content">
            <p class="body-md caption">{{ props.superTitle }}</p>
            <p class="title-md paragraph">{{ props.title }}</p>
          </div>
          <div class="categories">
            <CIVTag v-for="(category, idx) in props.categories" :key="idx" :text="category" :hasCloseIcon="false"
              :hasDotIcon="false" />
          </div>
        </div>
        <CIVTag v-if="props.isHvd" text="HVD" :hasCloseIcon="false" :hasDotIcon="false" tone="promote" class="isHvd" />
      </slot>
    </div>
    <div class="infoBox">
      <div class="date">
        <img src="../../assets/icons/Clock.svg" alt="clock">
        <p class="body-lg">{{ props.issued }}</p>
      </div>
      <div class="tags-container">
        <div class="tags">
          <CIVTag v-for="(format, idx) in props.formats?.filter((format) => !!format)" :key="idx" size="small"
            :text="format" :hasCloseIcon="false" :hasDotIcon="false" />
        </div>
      </div>
    </div>
  </component>
  <div v-else class="ghostBox"></div>
</template>

<style scoped>
@keyframes pulse {
  0% { background-color: var(--color-neutral-100); }
  50% { background-color: var(--color-neutral-300); }
  100% { background-color: var(--color-neutral-100); }
}

.datainfoBox {
  min-height: 142px;
  display: flex;
  gap: 2rem;
  padding: 1rem;
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-white);
}
.datainfoBox:hover {
  background-color: var(--color-bg-hover);
}

.iconBox {
  width: 30px;
  display: grid;
  place-content: center;
}

.content-box {
  width: 100%;
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
}

.about {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: space-between;
  height: 100%;
  gap: 24px;
}

.isHvd {
  display: none;
}

.text-content {
  display: flex;
  flex-direction: column;
}
.caption {
  color: var(--color-text-muted);
}
.paragraph {
  color: var(--color-text-regular);
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: var(--color-text-light)
}

.infoBox {
  display: flex;
  width: 201px;
  flex-direction: column;
  align-items: start;
  padding: 0 16px;
  gap: 8px;
}
.date {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-muted);
}
.tags-container {
  display: flex;
  align-items: center;
  height: 100%;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  height: auto;
  color: var(--color-text-regular);
}

.ghostBox {
  width: 100%;
  height: 141px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@media (max-width: 768px) {
  .datainfoBox {
    flex-wrap: wrap;
    gap: 16px;
  }

  .iconBox {
    place-content: start;
    flex-shrink: 0;
  }

  .content-box {
    flex-direction: row;
    flex: 1;
    min-width: 0;
    width: 100%
  }

  .about {
    gap: 16px;
    min-width: 0;
    flex: 1;
  }

  .text-content {
    min-width: 0;
    width: 100%;
  }

  .paragraph {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  }

  .isHvd {
    display: block;
    margin-top: 16px;
    padding: 3px 4px;
    border: 1.5px solid var(--color-border);
    font-size: 16px;
  }

  .categories {
    margin-left: -40px;
    padding-bottom: 10px;
  }

  .infoBox {
    width: 100%;
    padding: 0;
    gap: 8px;
    border-top: 1px solid var(--color-border);
    padding-top: 10px;
  }

  .tags-container {
    display: none;
  }
}
</style>