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

import { useQuery } from '@tanstack/vue-query'
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import appConfig from '@config/appConfig'

// Supported RDF formats for Piveau hub-repo (from official docs)
export type RDFFormat = 
    | 'application/rdf+xml'      // RDF/XML
    | 'application/ld+json'      // JSON-LD
    | 'application/n-triples'    // N-Triples
    | 'application/n-quads'      // N-Quads
    | 'application/trig'         // TriG
    | 'application/trix'         // TriX
    | 'text/turtle'              // Turtle
    | 'text/n3'                  // Notation3

// Base URL for hub-repo API
const hubRepoURL = appConfig.piveauHubRepoUrl.endsWith('/')
    ? appConfig.piveauHubRepoUrl
    : appConfig.piveauHubRepoUrl + '/'

/**
 * a set of composables for fetching and
 * downloading metadata of distributions and datasets
 * in selected RDF formats (JSON-LD, Turtle, RDF/XML, etc.)
 * from the piveau hub-repo
 */
export function useDistributions() {
    const store = useStore()
    const currentFormat = ref<RDFFormat>('application/ld+json')

    const useDatasetAccessControl = appConfig.customer?.enableDataSetLevelAccessControl === true ||
        appConfig.customer?.enableDataSetLevelAccessControl === 'true'

    /**
     * Fetch a specific distribution by ID in the requested RDF format
     */
    const fetchDistribution = async (
        distributionId: string,
        format: RDFFormat = 'application/ld+json'
    ) => {
        const url = `${hubRepoURL}distributions/${distributionId}`

        console.log('Fetching distribution:', {
            url,
            distributionId,
            format
        })

        // Build headers - try both authorization methods
        const headers: Record<string, string> = {
            'Accept': format
        }

        const token = useDatasetAccessControl
            ? store.state.auth.userData.authToken
            : store.state.auth.userData.rtpToken

        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        // Also add X-API-Key if available in config
        if (appConfig.piveauApiKey) {
            headers['X-API-Key'] = appConfig.piveauApiKey
        }

        console.log('Request headers:', { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : undefined })

        const response = await fetch(url, {
            method: 'GET',
            headers
        })

        console.log('Response status:', response.status, response.statusText)

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Error response:', errorText)
            throw new Error(
                `Failed to fetch distribution from piveau: ${response.status} ${response.statusText}\n${errorText}`
            )
        }

        // Return JSON for JSON-LD, text for other RDF formats
        if (format === 'application/ld+json') {
            return await response.json()
        }

        return await response.text()
    }

    /**
     * Download a distribution in a specific format
     */
    const downloadDistribution = async (
        distributionId: string,
        format: RDFFormat
    ) => {
        try {
            console.log('Starting download:', { distributionId, format })
            const data = await fetchDistribution(distributionId, format)

            // Create a blob and trigger download
            const blob = new Blob(
                [typeof data === 'string' ? data : JSON.stringify(data, null, 2)],
                { type: format }
            )
            
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            
            // Determine file extension based on format
            const extension = getFileExtension(format)
            link.download = `distribution-${distributionId}.${extension}`
            
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            
            console.log('Download completed successfully')
        } catch (error) {
            console.error('Error downloading distribution:', error)
            throw error
        }
    }

    /**
     * Use query to fetch a specific distribution
     */
    function useDistributionQuery(
        distributionId: string,
        format: RDFFormat = 'application/ld+json'
    ) {
        return useQuery({
            queryKey: ['distribution', distributionId, format],
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            queryFn: () => fetchDistribution(distributionId, format),
            enabled: !!distributionId, // Only run if we have a distributionId
        })
    }

    /**
     * Fetch a specific dataset by ID in the requested RDF format
     */
    const fetchDataset = async (
        datasetId: string,
        format: RDFFormat = 'application/ld+json'
    ) => {
        const url = `${hubRepoURL}datasets/${datasetId}`

        console.log('Fetching dataset:', {
            url,
            datasetId,
            format
        })

        // Build headers - try both authorization methods
        const headers: Record<string, string> = {
            'Accept': format
        }

        const token = useDatasetAccessControl
            ? store.state.auth.userData.authToken
            : store.state.auth.userData.rtpToken

        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        // Also add X-API-Key if available in config
        if (appConfig.piveauApiKey) {
            headers['X-API-Key'] = appConfig.piveauApiKey
        }

        console.log('Request headers:', { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : undefined })

        const response = await fetch(url, {
            method: 'GET',
            headers
        })

        console.log('Response status:', response.status, response.statusText)

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Error response:', errorText)
            throw new Error(
                `Failed to fetch dataset from piveau: ${response.status} ${response.statusText}\n${errorText}`
            )
        }

        // Return JSON for JSON-LD, text for other RDF formats
        if (format === 'application/ld+json') {
            return await response.json()
        }
        
        return await response.text()
    }

    /**
     * Download a dataset in a specific format
     */
    const downloadDataset = async (
        datasetId: string,
        format: RDFFormat
    ) => {
        try {
            console.log('Starting download:', { datasetId, format })
            const data = await fetchDataset(datasetId, format)

            // Create a blob and trigger download
            const blob = new Blob(
                [typeof data === 'string' ? data : JSON.stringify(data, null, 2)],
                { type: format }
            )
            
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            
            // Determine file extension based on format
            const extension = getFileExtension(format)
            link.download = `dataset-${datasetId}.${extension}`
            
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            
            console.log('Download completed successfully')
        } catch (error) {
            console.error('Error downloading dataset:', error)
            throw error
        }
    }

    /**
     * Use query to fetch a specific dataset
     */
    function useDatasetQuery(
        datasetId: string,
        format: RDFFormat = 'application/ld+json'
    ) {
        return useQuery({
            queryKey: ['dataset', datasetId, format],
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            queryFn: () => fetchDataset(datasetId, format),
            enabled: !!datasetId, // Only run if we have a datasetId
        })
    }

    /**
     * Get file extension based on RDF format
     */
    const getFileExtension = (format: RDFFormat): string => {
        const extensionMap: Record<RDFFormat, string> = {
            'application/rdf+xml': 'rdf',
            'application/ld+json': 'jsonld',
            'application/n-triples': 'nt',
            'application/n-quads': 'nq',
            'application/trig': 'trig',
            'application/trix': 'trix',
            'text/turtle': 'ttl',
            'text/n3': 'n3'
        }
        return extensionMap[format] || 'txt'
    }

    /**
     * Get human-readable format name
     */
    const getFormatName = (format: RDFFormat): string => {
        const nameMap: Record<RDFFormat, string> = {
            'application/rdf+xml': 'RDF/XML',
            'application/ld+json': 'JSON-LD',
            'application/n-triples': 'N-Triples',
            'application/n-quads': 'N-Quads',
            'application/trig': 'TriG',
            'application/trix': 'TriX',
            'text/turtle': 'Turtle',
            'text/n3': 'Notation3'
        }
        return nameMap[format] || format
    }

    return {
        // Query hooks
        useDistributionQuery,
        useDatasetQuery,
        
        // Direct fetch methods
        fetchDistribution,
        fetchDataset,
        downloadDistribution,
        downloadDataset,
        
        // Utility methods
        getFileExtension,
        getFormatName,
        
        // State
        currentFormat,
    }
}