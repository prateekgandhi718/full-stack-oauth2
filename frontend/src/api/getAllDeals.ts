import { BE_API_ENDPOINT, authenticatedGetRequest } from "./fetch"
import { GetAllDealsResponse } from "./types/deals"

export const getAllDealsList: () => Promise<GetAllDealsResponse> = async () => {
    try {
        const rawResponse = await authenticatedGetRequest(`${BE_API_ENDPOINT}/get-all-deals?name=prateek`)
        const responseToJson = rawResponse
        return responseToJson
    } catch (err) {
        console.error(err)
        throw err
    }
}