import { apiClient } from './api-clients'
import { WineSKU, WineSKUBase } from './wines-api-types'

export const winesApiService = {
  createWine: async (wineData: WineSKUBase, token: string): Promise<WineSKU> => {
    return apiClient<WineSKU>('/wines', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(wineData),
    })
  },
  getWine: async (wineId: string, token: string): Promise<WineSKU> => {
    return apiClient<WineSKU>(`/wines/${wineId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
} 