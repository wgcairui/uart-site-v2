import React from "react";
import { useSearchParams } from "react-router-dom";
import { usePromise } from "../../hook/usePromise";
import { BindDev, getUser } from "../../common/FecthRoot"
import { Spin, Tabs } from "antd";
import { UserAlarmPage, UserDes, UserLog } from "../../components/userData";
import { TerminalsTable } from "../../components/terminalsTable";
import { TerminalInfos } from "./terminalInfo";


export const UserInfo: React.FC = () => {
    const [param] = useSearchParams()

    const user = param.get('user')!

    const { data, loading, fecth } = usePromise(async () => {
        const { data } = await getUser(user)
        return data
    }, undefined, [param])

    const bindUts = usePromise(async () => {
        const { data } = await BindDev(user)
        return data.UTs as any as Uart.Terminal[]
    }, [])

    return (
        loading ? <Spin />
            :
            <>
                <h2>{data.user}/{data.name}</h2>
                <Tabs>
                    <Tabs.TabPane tab="详细信息" key="info">
                        <UserDes user={data}></UserDes>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="告警设置" key="alarm">
                        <UserAlarmPage user={data.user}></UserAlarmPage>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="挂载设备" key="mountDev">
                        <TerminalsTable user={data.user} />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="日志" key="log">
                        <UserLog user={data.user} />
                    </Tabs.TabPane>
                    {
                        bindUts.data.map(ter => <Tabs.TabPane tab={ter.name} key={ter.DevMac}>
                            <TerminalInfos mac={ter.DevMac} />
                        </Tabs.TabPane>)
                    }
                </Tabs>
            </>
    )
}