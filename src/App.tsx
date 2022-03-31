import React, { lazy, Suspense } from "react"
import "./App.css"

import { Routes, Route } from "react-router-dom"
import { Spin } from "antd"
//import { disableReactDevTools } from "./common/util"


const LogUartTerminalDatatransfinites = lazy(() => import("./root/log/alarm"))
const LogDataClean = lazy(() => import("./root/log/dataClean"))
const LogUserlogins = lazy(() => import("./root/log/logins"))
const LogMail = lazy(() => import("./root/log/mail"))
const LogNode = lazy(() => import("./root/log/nodes"))
const LogUserrequsts = lazy(() => import("./root/log/request"))
const LogSms = lazy(() => import("./root/log/sms"))
const LogTerminal = lazy(() => import("./root/log/terminal"))
const LogWxEvent = lazy(() => import("./root/log/wxEvent"))
const LogWxSubscribe = lazy(() => import("./root/log/wxSubscribe"))
const LoginnerMessage = lazy(() => import("./root/log/innerMessage"))
const LogBull = lazy(() => import("./root/log/bull"))

const TerminalAddDTU = lazy(() => import("./root/node/terminalRegister"))
const Login = lazy(() => import("./login"))
const LoginWx = lazy(() => import("./wxLogin"))
const UserIndex = lazy(() => import("./user"))
const Alarm = lazy(() => import("./user/alarm"))
const Dev = lazy(() => import("./user/dev"))
const Terminal = lazy(() => import("./user/terminal"))
const DevLine = lazy(() => import("./user/devline"))
const AddTerminal = lazy(() => import("./user/addTerminal"))
const UserInfo = lazy(() => import("./user/userInfo"))
const RootIndex = lazy(() => import("./root"))
const Secret = lazy(() => import("./root/node/secret"))
const Protocols = lazy(() => import("./root/node/protocols"))
const DevModel = lazy(() => import("./root/node/devModel"))
const Nodes = lazy(() => import("./root/node/nodes"))
const Terminals = lazy(() => import("./root/node/terminal"))
const User = lazy(() => import("./root/node/user"))
const UserWx = lazy(() => import("./root/wx/user"))
const Materials_listWx = lazy(() => import("./root/wx/materials_list"))
const ClientResultSingle = lazy(() => import("./root/data/clientResult"))
const ClientResult = lazy(() => import("./root/data/clientResultColltion"))
const Redis = lazy(() => import("./root/data/redis"))
const TerminalInfos = lazy(() => import("./root/node/terminalInfo"))
const RootUserInfo = lazy(() => import("./root/node/userInfo"))
const ProtocolInfo = lazy(() => import("./root/node/protocolInfo"))
const RootMain = lazy(() => import("./root/RootMain"))
const Main = lazy(() => import("./user/UserMain"))
const OssUpload = lazy(() => import("./root/data/oss"))
const RootDevLine = lazy(() => import("./root/node/devline"))
const LineWx = lazy(() => import("./user/wxLine"))
const Tool = lazy(() => import("./tool"))

export const App: React.FC = () => {
    /* 
        if (process.env.NODE_ENV == 'production') {
            disableReactDevTools();
        }
     */
    return (
        <Suspense fallback={<div className="loading"><Spin /></div>}>
            <Routes>

                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/loginwx" element={<LoginWx />} />

                <Route path="/tool" element={<Tool />} />

                <Route path="/root" element={<RootMain />}>
                    <Route index element={<RootIndex />}></Route>
                    <Route path="node/Secret" element={<Secret />} />
                    <Route path="node/Protocols" element={<Protocols />} />
                    <Route path="node/Protocols/info" element={<ProtocolInfo />} />
                    <Route path="node/addDev" element={<DevModel />} />
                    <Route path="node/addNode" element={<Nodes />} />
                    <Route path="node/Terminal" element={<Terminals />} />
                    <Route path="node/Terminal/info" element={<TerminalInfos />} />
                    <Route path="node/terminal/devline" element={<RootDevLine />} />
                    <Route path="node/Terminal/RegisterTerminal" element={<TerminalAddDTU />} />
                    <Route path="node/user" element={<User />} />
                    <Route path="node/user/userInfo" element={<RootUserInfo />} />

                    <Route path="wx/users" element={<User />} />
                    <Route path="wx/materials_list" element={<Materials_listWx />} />

                    <Route path="data/ClientResultSingle" element={<ClientResultSingle />} />
                    <Route path="data/ClientResult" element={<ClientResult />} />
                    <Route path="data/redis" element={<Redis />} />

                    <Route path="data/oss" element={<OssUpload />} />

                    <Route path="log/node" element={<LogNode />} />
                    <Route path="log/terminal" element={<LogTerminal />} />
                    <Route path="log/sms" element={<LogSms />} />
                    <Route path="log/mail" element={<LogMail />} />
                    <Route path="log/uartterminaldatatransfinites" element={<LogUartTerminalDatatransfinites />} />
                    <Route path="log/userlogins" element={<LogUserlogins />} />
                    <Route path="log/userrequsts" element={<LogUserrequsts />} />
                    <Route path="log/dataClean" element={<LogDataClean />} />
                    <Route path="log/wEvent" element={<LogWxEvent />} />
                    <Route path="log/wSubscribe" element={<LogWxSubscribe />} />
                    <Route path="log/innerMessage" element={<LoginnerMessage />} />
                    <Route path="log/bull" element={<LogBull />} />
                </Route>

                <Route path="/main" element={< Main />}>
                    <Route index element={<UserIndex />} />
                    <Route path="alarm" element={<Alarm />} />
                    <Route path="dev/:id" element={<Dev />} />
                    <Route path="devline/:id" element={<DevLine />} />
                    <Route path="terminal/:id" element={<Terminal />} />
                    <Route path="addterminal" element={<AddTerminal />} />
                    <Route path="user" element={<UserInfo />} />
                </Route>

                <Route path="/wline" element={<LineWx />} ></Route>
                <Route path="*" element={<Login />} />
            </Routes>
        </Suspense>
    )
}

