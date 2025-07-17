// Copyright 2018-2023 contributors to the Marquez project
// SPDX-License-Identifier: Apache-2.0

import { faDatabase } from '@fortawesome/free-solid-svg-icons'
import { faCog } from '@fortawesome/free-solid-svg-icons/faCog'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Box, darken } from '@mui/material'
import moment from 'moment'
import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { encodeNode } from '../../helpers/nodes'
import { theme } from '../../helpers/theme'
import { SearchResult } from '../../types/api'
import { JobOrDataset } from '../../types/lineage'
import MqText from '../core/text/MqText'

interface OwnProps {
  searchResult: SearchResult & { delimiter?: string }
  search: string
  onClick: (nodeName: string) => void
}

const searchResultIcon: { [key in JobOrDataset]: JSX.Element } = {
  JOB: <FontAwesomeIcon icon={faCog} color={theme.palette.primary.main} />,
  DATASET: <FontAwesomeIcon icon={faDatabase} color={theme.palette.info.main} />,
}

type DkSearchListItemProps = OwnProps

/**
 * Extract display name using the specified delimiter
 * Falls back to '.' if no delimiter is specified
 */
function extractDisplayName(fullName: string, delimiter?: string): string {
  const delim = delimiter || '.'
  const lastIndex = fullName.lastIndexOf(delim)
  
  if (lastIndex === -1) {
    // No delimiter found, return full name
    return fullName
  }
  
  return fullName.substring(lastIndex + 1)
}

const SearchListItem: React.FC<DkSearchListItemProps> = ({ searchResult, search, onClick }) => {
  const name = extractDisplayName(searchResult.name, searchResult.delimiter)
  const searchMatchIndex = name.toLowerCase().indexOf(search.toLowerCase())
  return (
    <RouterLink
      style={{
        textDecoration: 'none',
      }}
      onClick={() => onClick(searchResult.name)}
      to={`/lineage/${encodeNode(searchResult.type, searchResult.namespace, searchResult.name)}`}
    >
      <Box
        sx={{
          display: 'block',
          color: 'inherit',
          textDecoration: 'none',
          margin: 0,
          cursor: 'pointer',
          padding: `${theme.spacing(1)} ${theme.spacing(3)}`,
          '&:not(:last-child)': {
            borderBottom: `1px solid ${theme.palette.secondary.main}`,
          },
          '&:last-child': {
            borderBottomLeftRadius: '2px',
            borderBottomRightRadius: '2px',
          },
          '&:hover': {
            backgroundColor: darken(theme.palette.background.paper, 0.02),
          },
          '&:nth-pf-type(even)': {
            backgroundColor: darken(theme.palette.background.paper, 0.2),
            '&:hover': {
              backgroundColor: darken(theme.palette.background.paper, 0.02),
            },
          },
        }}
      >
        <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
          <Box display={'flex'} alignItems={'center'}>
            <Box display={'inline'} mr={1}>
              {searchResultIcon[searchResult.type]}
            </Box>
            <Box
              sx={{
                display: 'inline',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '370px',
              }}
            >
              {searchMatchIndex === -1 ? (
                <MqText inline font={'mono'} bold small>
                  {name}
                </MqText>
              ) : (
                <>
                  <MqText inline font={'mono'} bold small>
                    {name.substring(0, searchMatchIndex)}
                  </MqText>
                  <MqText inline font={'mono'} bold highlight small>
                    {name.substring(searchMatchIndex, searchMatchIndex + search.length)}
                  </MqText>
                  <MqText inline font={'mono'} bold small>
                    {name.substring(searchMatchIndex + search.length, searchResult.name.length)}
                  </MqText>
                </>
              )}
            </Box>
          </Box>
          <Box>
            <MqText subdued small>
              {moment(searchResult.updatedAt).fromNow()}
            </MqText>
          </Box>
        </Box>
      </Box>
    </RouterLink>
  )
}

export default SearchListItem
