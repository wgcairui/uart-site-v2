import React from "react"
import { useLocalStorageState } from "ahooks"
import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { wxlogin } from "./common/Fetch"
import { useNav } from "./hook/useNav"

/**
 * 微信登录跳转页面
 * @returns 
 */
const LoginWx: React.FC = () => {

    const nav = useNav()

    const [param] = useSearchParams()

    useEffect(() => {
        const [code, state] = [param.get("code"), param.get("state")]

        console.log({code, state});
        
        if (!code || !state) {
            nav("/login")
        }
        wxlogin(code!, state!).then(el => {
            const [_, setToken] = useLocalStorageState<string>('token')
            setToken((el as any).token)
            console.log({ el });

            nav("/")
        })
    }, [])

    return (<></>)
}

export default LoginWx