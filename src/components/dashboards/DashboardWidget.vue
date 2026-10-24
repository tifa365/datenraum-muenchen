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
    <div class="widget-container">
      <router-link :to="`/app/dashboards/${dashboardId}`">
        <div style="display: flex; flex-direction: column; flex: 1">
          <div class="title-tile">
            <div class="icon-container">
              <span v-if="hasEmojiIcon" class="icon-placeholder" style="filter: grayscale(100%);">{{ emojiIcon }}</span>
              <span v-else class="icon-placeholder icon-default-icon" :class="iconClass"
                    style="filter: grayscale(100%);"></span>
            </div>
            <h2 class="widget-title">{{ title }}</h2>
          </div>
          <div class="text-content">
            <p v-if="publisher" class="widget-provider">{{ $t('dashboard.publisher') }}: {{ publisher }}</p>
            <p v-else class="widget-provider"> <br> </p>
            <p class="widget-themes">{{ $t('dashboard.topics') }}: {{ topics }}</p>
          </div>
        </div>
        <div class="widget-button">
          <COSButton
              :button-text="$t('dashboard.to-dashboard')"
              button-style="text"
              suffix="src/assets/icons/ArrowRight.svg"
              route-to=""></COSButton>
        </div>
      </router-link>
    </div>
</template>

<script setup>
import COSButton from '@/components/city-os/COSButton.vue'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  publisher: {
    type: String,
    default: '',
  },
  topics: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  dashboardId: {
    type: Number,
    required: true,
  },
});

// We support both emojis and Material Design Light icons.
// The emojis work by default, the icons are implemented as a custom plugin in tailwind.config.js.
const hasEmojiIcon = /\p{Emoji}/u.test(props.icon);
const emojiIcon = hasEmojiIcon ? props.icon : '';
const iconClass = !hasEmojiIcon ? "icon-" + props.icon : '';
</script>

<style scoped>
.widget-container {
  flex: 1 1 30%;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding-top: 1.5rem;
  min-width: 320px;
  display: flex;
  flex-direction: column;
}

.title-tile {
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 1rem;
  padding-left: 1rem;
  padding-right: 1rem;
}

.icon-container {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  background-color: rgba(147, 178, 195, 0.2);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-placeholder {
  width: 1.5rem;
  height: 1.5rem;
  color: #6b7280;
  text-align: center;
}

.icon-default-icon {
  background: url('@/assets/icons/Layout.svg') no-repeat center center / contain;
}

.text-content {
  padding-left: 4.5rem;
  padding-right: 1rem;
  padding-bottom: 1.5rem;
}

.widget-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #181c1f;
  font-family: var(--font-family), serif;
  font-style: normal;
  line-height: 26px;
}

.widget-provider {
  font-size: 0.875rem;
  margin-top: 0.5rem;
  color: #878d96;
  font-family: var(--font-family), serif;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
}

.widget-themes {
  margin-top: 0.25rem;
  color: #667f93;
  font-family: var(--font-family), serif;
  font-size: 1rem;
  font-style: normal;
  font-weight: 600;
  line-height: 26px;
}

.widget-button {
  padding: 0.65rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #e5e7eb;
  text-align: right;
}

@media (max-width: 480px) {
  .text-content {
    padding-left: 1rem;
    padding-right: 1rem;
    padding-bottom: 1rem;
  }

  .widget-container {
    min-width: unset !important;
  }
}
</style>
