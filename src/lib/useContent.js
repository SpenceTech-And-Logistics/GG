import { createContext, useContext } from 'react'
import { defaults } from '../data/content.js'

export const ContentContext = createContext({ ...defaults, live: false, refresh: () => {} })
export const useContent = () => useContext(ContentContext)
