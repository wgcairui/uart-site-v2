import { Empty, Tabs } from "antd";
import { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import { getTerminalPidProtocol } from "../common/Fetch";
import { ProtocolAlarmStatUser, ProtocolShowTagUser, ProtocolThresholdUser } from "../components/protocolData";
import { usePromise } from "../hook/usePromise";
import { State } from "../store";
import { storeUser } from "../store/user";


const UserConstant: FC = () => {

    const { user } = useSelector<State, storeUser>(state => state.User)
    /**
     * 
     */
    const [param] = useSearchParams()

    const { data: mountDev, loading } = usePromise(async () => {
        const [mac, pid] = [param.get('mac'), param.get('pid')]
        if (!mac || !pid) throw new Error('param Error')
        const { data } = await getTerminalPidProtocol(mac, pid)
        return data
    })

    return (
        mountDev ?
            <div style={{padding:30}}>
                <h2>{mountDev.protocol}</h2>
                <Tabs>
                    <Tabs.TabPane tab="显示参数" key="show">
                        <ProtocolShowTagUser protocolName={mountDev.protocol} user={user.user!}></ProtocolShowTagUser>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="阈值配置" key="Threld">
                        <ProtocolThresholdUser protocolName={mountDev.protocol} user={user.user!} ></ProtocolThresholdUser>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="状态配置" key="stat">
                        <ProtocolAlarmStatUser protocolName={mountDev.protocol} user={user.user!}></ProtocolAlarmStatUser>
                    </Tabs.TabPane>
                </Tabs>
            </div>
            :
            <Empty />
    )
}

export default UserConstant