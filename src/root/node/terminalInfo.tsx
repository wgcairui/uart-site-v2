import { Col, Row, Spin, Tabs } from "antd";
import React from "react";
import { useSearchParams } from "react-router-dom";
import { getTerminal } from "../../common/Fetch";
import { DevPosition } from "../../components/devPosition";
import { TerminalAT, TerminalBusyStat, TerminalOprate, TerminalRunData, TerminalRunLog, TerminalUseBytes } from "../../components/terminalData";
import { TerminalInfo, TerminalMountDevs } from "../../components/terminalsTable";
import { usePromise } from "../../hook/usePromise";


interface props {
    mac?: string
}

/**
 * 列出设备详细信息
 * @returns 
 */
export const TerminalInfos: React.FC<props> = (props) => {

    const [query] = useSearchParams()
    const { data, loading, fecth } = usePromise(async () => {
        const { data } = await getTerminal(query.get('mac') || props.mac || '')
        return data
    })

    return (
        loading ? <Spin />
            :
            <>
                <h2>{data.DevMac}/{data.name}</h2>
                <Tabs>
                    <Tabs.TabPane tab="详细信息" key="info">
                        <TerminalInfo terminal={data} update={fecth} ex={true} showTitle={false}></TerminalInfo>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="挂载设备" key="mountDevs">
                        <TerminalMountDevs terminal={data} update={fecth} ex={true} showTitle={false}></TerminalMountDevs>
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
                            <Row>
                                <Col span={10}>
                                    <TerminalRunData mac={data.DevMac} pid={dev.pid} />
                                </Col>
                            </Row>
                        </Tabs.TabPane>
                        )
                    }
                </Tabs>
            </>
    )
}