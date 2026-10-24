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
import { computed, ref, useSlots } from 'vue'
import CIVButton from '../../CIVButton.vue'
import CIVMarkdown from '../../CIVMarkdown.vue'
import CIVTransparentCard from '../../CIVTransparentCard.vue'

const slots = useSlots()

const props = defineProps({
  image: { type: String, default: '' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  url: { type: String, default: '' },
  compactMode: { type: Boolean, default: false },
  showAllText: { type: Boolean, default: true },
  cardStyle: { type: Object, default: () => ({}) },
  descriptionClass: { type: String, default: '' },
  cardClass: { type: String, default: '' },
})

const showMoreClicked = ref(false)

const maxLength = 300
const truncateLength = 250

const isTooLong = computed(() => (props.description?.length || 0) > maxLength)
const rawText = computed(() => {
  if (props.showAllText) return props.description || ''
  if (isTooLong.value && !showMoreClicked.value) return (props.description || '').slice(0, truncateLength) + '...'
  return props.description || ''
})
const shouldShowMoreButton = computed(() => !props.showAllText && isTooLong.value && !showMoreClicked.value)

const showMore = () => { showMoreClicked.value = true }
</script>

<template>
  <div class="card-content">
    <div v-if="slots.iconSection" class="icon-container">
      <slot name="iconSection" />
    </div>

    <CIVTransparentCard :cardStyle="cardStyle" :cardClass="cardClass">
        <div v-if="image" class="image-container">
          <img class="organisation-image" :src="image" />
        </div>

        <div class="text-container">

          <div v-if="slots.tags || slots.actions" class="info-container">
            <div class="info-tags">
              <slot name="tags" />
              <h2 class="title display-sm">{{ title }}</h2>
            </div>
            <div v-if="slots.actions" class="actions-container">
              <slot name="actions" />
            </div>
          </div>

          <h2 v-else class="title display-sm">{{ title }}</h2>

          <CIVMarkdown v-if="description"
            class="description"
            :class="[descriptionClass
                ? descriptionClass
                : compactMode ? 'title-md' : 'title-lg']"
            :content="rawText"
          />

          <slot name="search" />

          <div v-if="url" class="website-container">
            <p class="title-md">{{ $t('message.metadata.website') }}:</p>
            <a class="title-md" :href="url">{{ url }}</a>
          </div>

          <slot name="meta" />

          <CIVButton v-if="shouldShowMoreButton" @click="showMore" :label="$t('message.metadata.readMore')"
            type="tertiary" iconSuffix="/src/assets/icons/ChevronBottom.svg" />

          <slot name="footer" />

          <div v-if="slots.bottomLeft" class="bottom-left-container">
            <slot name="bottomLeft" />
          </div>
        </div>
    </CIVTransparentCard>
  </div>
</template>

<style scoped>
.icon-container {
    display: flex;
    justify-content: end;
    gap: 8px;
}

.card-content {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 8px;
}

.image-container {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.text-container {
    gap: 24px;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
}

.info-container {
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
}

.info-tags {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.info-tags div {
    display: flex;
    align-items: center;
    gap: 16px;
}

.title {
    color: var(--hero-card-header-text-primary-color);
}

.description {
    overflow: auto;
    color: var(--hero-card-header-text-secondary-color);
}

.organisation-image {
    min-width: 83px;
}

.website-container {
    display: flex;
    gap: 4px;
    color: var(--hero-card-header-text-secondary-color);
}

.bottom-left-container {
    display: flex;
    padding: 8px 0;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
}

/* Tablet responsive (870px and below) */
@media (max-width: 870px) {
    .button_placeholder {
        margin-bottom: 40px;
    }

    .icon-container {
        margin-bottom: 0;
    }
}

/* Mobile responsive (614px and below) */
@media (max-width: 614px) {
    .image-container {
        display: none;
    }

    .icon-container {
        margin: 16px;
        margin-bottom: 0;
    }

    .content {
        gap: 24px;
    }

    .text-container {
        gap: 20px;
    }

    .info-container {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }

    .info-tags {
        width: 100%;
    }

    .info-tags div {
        flex-wrap: wrap;
        gap: 8px;
    }

    .title {
        font-size: 24px;
        line-height: 32px;
        word-break: break-word;
    }

    .description {
        font-size: 16px;
        line-height: 24px;
    }

    .website-container {
        flex-direction: column;
        gap: 8px;
        word-break: break-all;
    }

    .button_placeholder {
        margin-bottom: 20px;
    }
}

/* Extra small mobile (400px and below) */
@media (max-width: 400px) {
    .info-tags div {
        flex-direction: column;
        align-items: flex-start;
    }

    .title {
        font-size: 20px;
        line-height: 28px;
    }
}

</style>
