import React from "react"
import { useLocalStorageState } from "ahooks"
import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { wxlogin } from "./common/Fetch"
import { useNav } from "./hook/useNav"
import { Spin } from "antd"

/**
 * 微信登录跳转页面
 * @returns 
 */
const LoginWx: React.FC = () => {

    const nav = useNav()
    const [param] = useSearchParams()
    const [_, setToken] = useLocalStorageState<string>('token')

    useEffect(() => {
        (async () => {
            const [code, state] = [param.get("code"), param.get("state")]
            if (!code || !state) {
                nav("/login")
            }
            const data = await wxlogin(code!, state!) as any
            console.log(data);
            setToken(data.token)
            nav("/login")
        })()
    }, [])


    return (<Spin />)
}

export default LoginWx