/*
 * This file is part of Civora UI.
 *
 * Copyright (C) 2025 DKSR GmbH.
 *
 * Civora UI is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

export const overrideBaseStyles = (customer: string) => {
  const existingLink = document.getElementById('override-style') as HTMLLinkElement;
  if (existingLink) {
    existingLink.href = `/config/${customer}/assets/style.css`; // Update if already exists
  } else {
    const link = document.createElement('link');
    link.id = 'override-style';
    link.rel = 'stylesheet';
    link.href = `/config/${customer}/assets/style.css`;
    document.head.appendChild(link);
  }
};
