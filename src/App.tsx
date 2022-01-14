import React from "react"
import "./App.css"
import { Login, LoginWx } from "./login"
import { UserIndex } from "./user"
import { Routes, Route } from "react-router-dom"
import { Alarm } from "./user/alarm"
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
import { TerminalAddDTU, Terminals } from "./root/node/terminal"
import { User } from "./root/node/user"
import { WxUser } from "./root/wx/user"
import { WxMaterials_list } from "./root/wx/materials_list"
import { ClientResult, ClientResultSingle } from "./root/data/clientResult"
import { Redis } from "./root/data/redis"
import { LogDataClean, LogMail, LogNode, LogSms, LogTerminal, LogUartTerminalDatatransfinites, LogUserlogins, LogUserrequsts, LogWxEvent, LogWxSubscribe } from "./root/log/log"
import { TerminalInfos } from "./root/node/terminalInfo"
import { UserInfo as RootUserInfo } from "./root/node/userInfo"
import { ProtocolInfo } from "./root/node/protocolInfo"
import { RootMain } from "./root/RootMain"
import { Main } from "./user/UserMain"
import { OssUpload } from "./root/data/oss"
import { RootDevLine } from "./root/node/devline"
import { disableReactDevTools } from "./common/util"

export const App: React.FC = () => {

    if (process.env.NODE_ENV == 'production') {
        disableReactDevTools();
    }

    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/loginwx" element={<LoginWx />} />

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

                <Route path="wx/users" element={<WxUser />} />
                <Route path="wx/materials_list" element={<WxMaterials_list />} />

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
                <Route path="log/wxEvent" element={<LogWxEvent />} />
                <Route path="log/wxSubscribe" element={<LogWxSubscribe />} />
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

        </Routes>
    )
}

