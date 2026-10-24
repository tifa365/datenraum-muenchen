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

import type { PropertyTableEntryNode } from '@/utils/types'

export interface DistributionViewModel {
  id: string
  title?: string
  description?: string
  format?: string
  properties?: PropertyTableEntryNode[]
  accessUrls?: string[]
  downloadUrls?: string[]
  compressFormat?: { label?: string | null, resource?: string | null } | null
}

export interface DistributionDataInfoBoxProps extends DistributionViewModel {}
export interface DistributionDataInfoBoxListProps {
  distributions: DistributionViewModel[]
}
