import { Spin, Tabs } from "antd";
import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getTerminalUser } from "../../common/FecthRoot";
import { getTerminal } from "../../common/Fetch";
import { DevPosition } from "../../components/devPosition";
import { TerminalAT, TerminalBusyStat, TerminalOprate, TerminalRunLog, TerminalUseBytes } from "../../components/terminalData";
import { TerminalDevPage } from "../../components/TerminalDev";
import { TerminalInfo, TerminalMountDevs } from "../../components/terminalsTable";
import { usePromise } from "../../hook/usePromise";
import { useTerminalUpdate } from "../../hook/useTerminalData";
import { UserInfo } from "./userInfo";


interface props {
    mac?: string
}

/**
 * 列出设备详细信息
 * @returns 
 */
export const TerminalInfos: React.FC<props> = (props) => {

    const [query] = useSearchParams()

    const mac = query.get('mac') || props.mac || ''
    const { data, loading, setData, fecth } = usePromise(async () => {
        const { data } = await getTerminal(mac)
        return data
    })

    const ter = useTerminalUpdate([mac])

    useEffect(() => {
        if (ter.data) {
            setData(ter.data)
        }
    }, [ter.data])

    return (
        loading ? <Spin />
            :
            <>
                <h2>{data.DevMac}/{data.name}</h2>
                <Tabs>
                    <Tabs.TabPane tab="详细信息" key="info">
                        <TerminalInfo terminal={data} ex={true} showTitle={false}></TerminalInfo>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="挂载设备" key="mountDevs">
                        <TerminalMountDevs terminal={data} ex={true} showTitle={false} InterValShow onChange={fecth}></TerminalMountDevs>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="设备定位" key="position">
                        <DevPosition terminal={data}></DevPosition>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="使用流量" key="use">
                        <TerminalUseBytes mac={data.DevMac} />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="工作状态" key="workstat">
                        <TerminalBusyStat mac={data.DevMac} />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="AT调试" key="at">
                        <TerminalAT mac={data.DevMac} />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="指令调试" key="query">
                        <TerminalOprate mac={data.DevMac} />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="日志" key="log">
                        <TerminalRunLog mac={data.DevMac} ></TerminalRunLog>
                    </Tabs.TabPane>
                    {
                        data.mountDevs && data.mountDevs.map(dev => <Tabs.TabPane tab={dev.mountDev + dev.pid} key={dev.mountDev + dev.pid}>
                            <TerminalDevPage mac={data.DevMac} pid={dev.pid}></TerminalDevPage>
                        </Tabs.TabPane>
                        )
                    }
                </Tabs>
            </>
    )
}

export default TerminalInfos