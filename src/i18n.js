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

import { createI18n } from 'vue-i18n'
import appConfig from "@config/appConfig.ts"

export const DEFAULT_LOCALE = appConfig.languages?.fallbackLanguage || 'en'
const displayOptions = appConfig.languages?.displayOptions?.split(',').map((locale) => locale.trim())
export const SUPPORTED_LOCALES = displayOptions || [DEFAULT_LOCALE]

export function getInitialLocale() {
	return localStorage.getItem("locale") || getBrowserLocale() || DEFAULT_LOCALE;
}

export async function setLocale(locale) {
	if (!i18n.global.availableLocales.includes(locale)) {
		await loadLocaleMessages(locale);
	}
	localStorage.setItem("locale", locale);
	setI18nLanguage(i18n, locale);
}

const i18n = createI18n({
	legacy: false,
});

export function setI18nLanguage(i18n, locale) {
	if (i18n.mode === 'legacy') {
		i18n.global.locale = locale
	} else {
		i18n.global.locale.value = locale
	}
	document.querySelector('html').setAttribute('lang', locale)
}

async function loadLocaleMessages(locale) {
	const messages = import.meta.glob('./locales/*.json', { eager: true });
	const defaultMessages = messages[`./locales/${locale}.json`]?.default || {};

	let customerMessages = {};
	try {
		const customerName = appConfig.customer.name;
		const customerPath = `../config/${customerName}/locale-overrides/${locale}.json`;

		const customerFiles = import.meta.glob('../config/**/locale-overrides/*.json', { eager: true });
		customerMessages = customerFiles[customerPath]?.default || {};
	} catch (error) { /* Empty */ }

	deepMerge(defaultMessages, customerMessages);
	i18n.global.setLocaleMessage(locale, defaultMessages);
}

function deepMerge(target, source) {
	for (const key of Object.keys(source)) {
		if (typeof source[key] === 'object' && source[key] !== null) {
			if (!target[key]) target[key] = {};
			deepMerge(target[key], source[key]);
		} else {
			target[key] = source[key];
		}
	}
}

function getBrowserLocale() {
	const browserLocale = navigator.language || navigator.userLanguage;
	const locale = browserLocale.split('-')[0].trim();
	return locale;
}

export default i18n;
