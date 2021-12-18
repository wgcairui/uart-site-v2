import React, { useEffect, useState } from "react"
import "./App.css"
import { Login } from "./login"
import { BindDev, Get, userInfo } from "./common/Fetch"
import { Spin } from "antd"
import { UserIndex } from "./user"
import { useDispatch } from "react-redux"
import { setUser, setTerminals } from "./store/user"
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { Alarm } from "./user/alarm"
import { universalResult } from "./typing"
import { DevManage } from "./user/devManage"
import { Dev } from "./user/dev"
import { Terminal } from "./user/terminal"
import { DevLine } from "./user/devline"
import { AddTerminal } from "./user/addTerminal"
import { UserInfo } from "./user/userInfo"
import { RootIndex } from "./root"
import { Secret } from "./root/node/secret"
import { Protocols } from "./root/node/protocols"
import { DevModel } from "./root/node/devModel"
import { Nodes } from "./root/node/nodes"
import { Terminals } from "./root/node/terminal"
import { User } from "./root/node/user"
import { WxUser } from "./root/wx/user"
import { WxMaterials_list } from "./root/wx/materials_list"
import { ClientResult, ClientResultSingle } from "./root/data/clientResult"
import { Redis } from "./root/data/redis"
import { LogMail, LogNode, LogSms, LogTerminal, LogUartTerminalDatatransfinites } from "./root/log/log"

export const App: React.FC = () => {

    const [userGroup, setUserGroup] = useState<string>()

    const Dispatch = useDispatch()

    const nav = useNavigate()

    const local = useLocation()

    useEffect(() => {
        /**
         * 获取用户信息
         */
        Get<universalResult<{ user: string, userGroup: string }>>('/api/auth/user').then(data => {
            /**
             * 成功获取到信息则添加数据到store
             */
            if (data.code === 200 && data.user) {
                userInfo().then(el => {
                    Dispatch(setUser(el.data))
                    setUserGroup(data.userGroup)

                    if (['user', 'test'].includes(data.userGroup)) {
                        BindDev().then(el => {
                            Dispatch(setTerminals(el.data.UTs))
                        })
                    } else {
                        // if (!/^\/root/.test(local.pathname)) nav("/root")
                        if (local.pathname === '/') nav("/root")
                    }
                })


            } else {
                localStorage.removeItem("token")
                setUserGroup("login")
            }
        }).catch(() => {
            localStorage.removeItem("token")
            setUserGroup("login")
        })
    }, [])

    if (userGroup) {
        switch (userGroup) {
            case "user":
            case "test":
            case "admin":
            case "root":
                return (
                    <Routes>
                        <Route path="/" element={<UserIndex />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/alarm" element={<Alarm />} />
                        <Route path="/devmanage" element={<DevManage />} />
                        <Route path="/dev/:id" element={<Dev />} />
                        <Route path="/devline/:id" element={<DevLine />} />
                        <Route path="/terminal/:id" element={<Terminal />} />
                        <Route path="/addterminal" element={<AddTerminal />} />
                        <Route path="/user" element={<UserInfo />} />

                        <Route path="/root" element={<RootIndex />} />
                        <Route path="/user" element={<UserInfo />} />
                        <Route path="/root/node/Secret" element={<Secret />} />
                        <Route path="/root/node/Protocols" element={<Protocols />} />
                        <Route path="/root/node/addDev" element={<DevModel />} />
                        <Route path="/root/node/addNode" element={<Nodes />} />
                        <Route path="/root/node/Terminal" element={<Terminals />} />
                        <Route path="/root/node/user" element={<User />} />

                        <Route path="/root/wx/users" element={<WxUser />} />
                        <Route path="/root/wx/materials_list" element={<WxMaterials_list />} />

                        <Route path="/root/data/ClientResultSingle" element={<ClientResultSingle />} />
                        <Route path="/root/data/ClientResult" element={<ClientResult />} />
                        <Route path="/root/data/redis" element={<Redis />} />

                        <Route path="/root/log/node" element={<LogNode />} />
                        <Route path="/root/log/terminal" element={<LogTerminal />} />
                        <Route path="/root/log/sms" element={<LogSms />} />
                        <Route path="/root/log/mail" element={<LogMail />} />
                        <Route path="/root/log/uartterminaldatatransfinites" element={<LogUartTerminalDatatransfinites />} />
                    </Routes>
                )
            default:
                return (<Login></Login>)
        }

    } else {
        return (
            <div className='loading'>
                <Spin tip="loading" size="large" />
            </div>
        )
    }
}
