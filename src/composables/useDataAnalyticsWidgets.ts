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

import { computed, type ComputedRef } from "vue"
import { useAuthStore } from "@/stores/authStore.js"
import appConfig from "@config/appConfig.js"

interface IDKSRAnalyticsApp {
	id: string
	appId: string
	imagePath: string
	provider: string
	categories: string[]
	translation: string
	link: string
	isRequiredAuth?: boolean
}

// Replace links with deployed apps, make sure that ID is matching id in DKSRAppsView.vue
const dksrAnalyticsApps = [
	{
		id: 'bikePlanner',
		appId: '20818f21de8e',
		imagePath: 'src/assets/images/bikelanes.png',
		provider: 'DKSR',
		categories: ['traffic', 'citizens'],
		translation: 'bikePlanner',
		link: 'https://bike-planner.analytics.dksr.city/',
	}, {
		id: 'heatwaves',
		appId: '42af1ad994fe',
		imagePath: 'src/assets/images/heatwaves.png',
		provider: 'DKSR',
		categories: ['traffic', 'environment', 'energy', 'citizens'],
		translation: 'heatwaves',
		link: 'https://heat-resilience.analytics.dksr.city/Understanding_Heatwaves',
	}, {
		id: 'heatRisk',
		appId: '1884da02be32',
		imagePath: 'src/assets/images/filter_heat_risk.png',
		provider: 'DKSR',
		categories: ['traffic', 'environment', 'energy', 'citizens'],
		translation: 'heatRisk',
		link: 'https://heat-resilience.analytics.dksr.city/Filter_Heat_Risk',
	}, {
		id: 'heatActions',
		appId: '56518f21de9c',
		imagePath: 'src/assets/images/hood.png',
		provider: 'DKSR',
		categories: ['traffic', 'environment', 'energy', 'citizens'],
		translation: 'heatActions',
		link: 'https://heat-resilience.analytics.dksr.city/Measures_Against_Heatwaves',
	}, {
		id: 'heatRiskWeighted',
		appId: '1234567890ab',
		imagePath: 'src/assets/images/filter_heat_risk_weighted.png',
		provider: 'DKSR',
		categories: ['environment', 'citizens', 'climate', 'health'],
		translation: 'heatRiskWeighted',
		link: 'https://heat-resilience.analytics.dksr.city/Filter_Heat_Risk_weighted',
	}, {
		id: 'solarTool',
		appId: '1234567890ac',
		imagePath: 'src/assets/images/solar-tool.png',
		provider: 'Virtual City Systems',
		categories: ['energy', 'environment', 'urbanPlanning'],
		translation: 'solarTool',
		link: 'https://www.virtualcitymap.de/?state=%5B%5B%5B13.374111%2C52.512641%2C1039.44%5D%2C%5B13.371271%2C52.525291%2C31.07%5D%2C1742.35%2C352.2041%2C-35.3682%2C359.969%5D%2C%22cesium%22%2C%5B%22VC+Map+Demo%22%2C%22moduleSelector_module_id%22%5D%2C%5B%5B%22Berlin+untexturiert+openData+%28pbr+recalculation%29%22%2C0%2C0%5D%5D%2C%5B%5B%22%40vcmap%2Fmodule-selector%22%2C%7B%22smi%22%3A0%2C%22w%22%3Afalse%7D%5D%5D%2C0%2C%5B%5D%5D',
	}, {
		id: 'heatRiskAnalysis',
		appId: '1234567890ad',
		imagePath: 'src/assets/images/heat-risk-analysis.png',
		provider: 'DKSR',
		categories: ['heatWaves', 'resilience', 'urbanPlanning'],
		translation: 'heatRiskAnalysis',
		link: 'https://hitzerisikofilter.analytics.dksr.city/',
	}, {
		id: 'digitalEnergyAdvisor',
		appId: '1234567890ae',
		imagePath: 'src/assets/images/digital-energy-advisor.png',
		provider: 'DKSR',
		categories: ['energy', 'urbanPlanning'],
		translation: 'digitalEnergyAdvisor',
		link: 'https://latest.digitale-energieberater.analytics.dksr.city/',
	}, {
		id: 'smartWinterService',
		appId: 'smartWinterService',
		imagePath: 'src/assets/images/smart-winter.png',
		provider: 'DKSR',
		categories: ['roadSafety', 'buildYard', 'deploymentPlanning'],
		translation: 'smartWinterService',
		link: 'https://superset.hoferland.civora.org/superset/dashboard/274/?native_filters_key=VIrgrI8MyEk&standalone=1',
	}, {
		id: 'schoolDistrictPlanning',
		appId: 'schoolDistrictPlanning',
		imagePath: 'src/assets/images/school-district-planning.png',
		provider: 'DKSR',
		categories: ['education', 'demandPlanning'],
		translation: 'schoolDistrictPlanning',
		link: 'https://superset.ladadi.civora.org/superset/dashboard/347/?native_filters_key=ULrds1qr09k&standalone=1',
	}, {
		id: 'economyMonitoring',
		appId: 'economyMonitoring',
		imagePath: 'src/assets/images/economy-monitoring.png',
		provider: 'DKSR',
		categories: ['economy', 'jobMarket'],
		translation: 'economyMonitoring',
		link: 'https://superset.hoferland.civora.org/superset/dashboard/62/?standalone=1',
	}, {
		id: 'socialMonitoring',
		appId: 'socialMonitoring',
		imagePath: 'src/assets/images/social-monitoring.png',
		provider: 'DKSR',
		categories: ['school', 'daycare', 'youthSupport'],
		translation: 'socialMonitoring',
		link: 'https://superset.ladadi.civora.org/superset/dashboard/380/?native_filters_key=yJwOL4tSkUY&standalone=1',
	}
]

export function useDataAnalyticsWidgets(): ComputedRef<IDKSRAnalyticsApp[]> {
	const authStore = useAuthStore()
	const widgetsConfig = appConfig?.customer?.modules?.dksrApps?.apps ?? {}

	const list = computed(() => {
		return dksrAnalyticsApps.reduce((newList: IDKSRAnalyticsApp[], data: IDKSRAnalyticsApp) => {
			if (!(data.id in widgetsConfig)) {
				return newList
			}
			if (!widgetsConfig[data.id]?.available || widgetsConfig[data.id]?.available === 'false') {
				return newList
			}

			const configLink = widgetsConfig[data.id]?.url
			const requiresLogin = widgetsConfig[data.id]?.requiresLogin === 'true'

			const link = configLink || data.link

			if ((requiresLogin && !authStore.authenticated) || !link) {
				return newList
			}

			newList.push({
				...data,
				link,
			})

			return newList
		}, [] as IDKSRAnalyticsApp[])
	})

	return list
}
