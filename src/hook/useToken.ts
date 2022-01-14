import { useLocalStorageState } from "ahooks"
import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"

/**
 * 设置token
 * @param token 
 * @returns 
 */
export const useToken = (token?: string) => {
    const [search] = useSearchParams()

    const [_, setToken] = useLocalStorageState<string>('token')

    useEffect(() => {
        const token2 = token || search.get('token')
        console.log(token , search.get('token'));
        
        if (token2) {
            setToken('bearer '+token2)
        }
    }, [search])

    return _
}