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
    <div class="loading">
        <img src="../../assets/icons/Spinner.svg" alt="Spinner">
    </div>
</template>

<style scoped>
@keyframes spin {
    from {
        rotate: 0deg;
    }

    to {
        rotate: 360deg;
    }
}

.loading {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 30px;
}

.loading img {
    width: 90px;
    aspect-ratio: 1/1;
    animation: spin 1s linear infinite;
}
</style>