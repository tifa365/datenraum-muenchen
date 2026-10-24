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
import appConfig from '@config/appConfig'
</script>

<script lang="ts">

interface LocalizedStrings {
  [locale: string]: string
}

interface PublisherAddress {
  locality?: string
  postalCode?: string
  street?: string
}

interface Publisher {
  email?: string
  homepage?: string
  name?: string
  address?: PublisherAddress
}

interface Catalog {
  catalogueBackground?: string[]
  catalogueProfile?: string[]
  catalogueLogo?: string[]
  homepage?: string
  publisher?: Publisher
  title?: LocalizedStrings
  description?: LocalizedStrings
  theme_taxonomy?: LocalizedStrings
}

export function mapCatalogToOrganisation(catalog: Catalog, currentLocale: string) {
  console.log('Locale is: ', currentLocale)
  return {
    backgroundImage: catalog?.catalogueBackground
      ? catalog.catalogueBackground[0]
      : `config/${appConfig.customer.name}/assets/images/${appConfig.components.headerImageFileName}`,
    logo: catalog?.catalogueProfile ? catalog.catalogueProfile[0] : catalog?.catalogueLogo?.[0],
    title: (() => {
      const titles = catalog?.title
      return titles?.[currentLocale] || titles?.de || titles?.en || ''
    })(),
    description: (() => {
      const desc = catalog?.description
      return desc?.[currentLocale] || desc?.de || desc?.en || ''
    })(),
    categories: (() => {
      const tax = catalog?.theme_taxonomy
      const localized = tax?.[currentLocale] || tax?.de || tax?.en || ''
      if (!localized) return []
      return localized
        .split(/[,;]+/)
        .map((str) => str.trim())
        .filter(Boolean)
    })(),
    website: catalog?.homepage,
    contact: catalog?.publisher,
  }
}
</script>
