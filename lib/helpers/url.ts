import qs from "query-string";

export type UrlQueryParams = { params: string; key: string; value: string }
export type RemoveUrlQueryParams = { params: string; keys: string[] }

export const formUrlQuery = ({ params, key, value }: UrlQueryParams) => {
    const currentUrl = qs.parse(params)
    currentUrl[key] = value
    return qs.stringify(currentUrl)
}

export const removeKeysFromQuery = ({ params, keys }: RemoveUrlQueryParams) => {
    const currentUrl = qs.parse(params)

    keys.forEach((key) => {
        delete currentUrl[key]
    })

    return qs.stringify(currentUrl, { skipNull: true, skipEmptyString: true })
}
