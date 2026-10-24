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
  <div class="user-profile">
    <div class="main-container">
      <UserProfileHeader> </UserProfileHeader>
      <UserProfileContent> </UserProfileContent>
    </div>
  </div>
</template>

<script>
import UserProfileHeader from '@/components/user-profile/UserProfileHeader.vue'
import UserProfileContent from '@/components/user-profile/UserProfileContent.vue'

export default {
  name: 'UserProfile',
  components: { UserProfileContent, UserProfileHeader },
}
</script>

<style scoped>
.test-auth-content {
  margin-top: 100px;
  width: 500px;
}
.my-5 {
  margin-top: 5px;
  margin-bottom: 5px;
}

.mr-15 {
  margin-right: 15px;
}

.py-10 {
  padding-top: 10px;
  padding-bottom: 10px;
}

.wrap-text {
  word-wrap: break-word;
}

.font-small {
  font-size: 10px;
}
</style>
