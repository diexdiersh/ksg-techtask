import {AxiosInstance} from 'axios'

import {ItemParam, SkinportItem} from '../interfaces/index.js'
import {convertCase} from '../utils/index.js'

export class SkinportApi {
  constructor(
    private readonly _url: string,
    private readonly _axios: AxiosInstance
  ) {}

  async getItems(params: ItemParam): Promise<SkinportItem[]> {
    const snakeParams = convertCase(params, 'snake')

    const response = await this._axios.get<SkinportItem[]>(
      `${this._url}/items`,
      {
        params: snakeParams,
      }
    )

    return response.data
  }
}
