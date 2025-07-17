// Copyright 2018-2023 contributors to the Marquez project
// SPDX-License-Identifier: Apache-2.0

import { FETCH_SEARCH, FETCH_SEARCH_SUCCESS } from '../actionCreators/actionTypes'

import { GroupedSearch, GroupedSearchResult } from '../../types/api'
import { groupBy } from '../../types/util/groupBy'
import { fetchSearch, fetchSearchSuccess } from '../actionCreators'

export type ISearchState = { isLoading: boolean; data: GroupedSearchResult; init: boolean }

export const initialState: ISearchState = {
  isLoading: false,
  data: { results: new Map<string, GroupedSearch[]>(), rawResults: [] },
  init: false,
}

/**
 * Detect the best delimiter for grouping based on the data
 * Prioritizes the delimiter that appears more frequently and creates meaningful groups
 */
function detectBestDelimiter(names: string[]): string {
  const delimiters = ['.', '/']
  let bestDelimiter = '.'
  let maxMeaningfulGroups = 0

  for (const delimiter of delimiters) {
    let meaningfulGroupCount = 0
    
    for (const name of names) {
      const lastIndex = name.lastIndexOf(delimiter)
      if (lastIndex > 0 && lastIndex < name.length - 1) {
        // Has delimiter and creates meaningful group (not at start/end)
        meaningfulGroupCount++
      }
    }
    
    if (meaningfulGroupCount > maxMeaningfulGroups) {
      maxMeaningfulGroups = meaningfulGroupCount
      bestDelimiter = delimiter
    }
  }
  
  return bestDelimiter
}

/**
 * Extract group name using the specified delimiter
 */
function extractGroupName(name: string, delimiter: string): string {
  const lastIndex = name.lastIndexOf(delimiter)
  if (lastIndex === -1) {
    return '' // No delimiter found
  }
  return name.substring(0, lastIndex)
}

type IJobsAction = ReturnType<typeof fetchSearchSuccess> & ReturnType<typeof fetchSearch>

export default (state = initialState, action: IJobsAction): ISearchState => {
  const { type, payload } = action

  switch (type) {
    case FETCH_SEARCH:
      return { ...state, isLoading: true }
    case FETCH_SEARCH_SUCCESS: {
      // Detect the best delimiter for this dataset
      const names = payload.results.map(result => result.name)
      const delimiter = detectBestDelimiter(names)
      
      const groupedResult = payload.results.map((result) => {
        const groupName = extractGroupName(result.name, delimiter)
        return {
          ...result,
          group: `${encodeURIComponent(result.namespace)}:${encodeURIComponent(groupName)}`,
          delimiter, // Store delimiter for later use
        }
      })
      return {
        ...state,
        isLoading: false,
        init: true,
        data: {
          results: groupBy(groupedResult, 'group'),
          rawResults: groupedResult,
        },
      }
    }
    default:
      return state
  }
}
