import { Card, Collapse, Divider, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { socketClient } from "../common/socket";
import { addListenMac } from "../common/FecthRoot";
import * as dayjs from "dayjs";
import { JSONTree } from 'react-json-tree';
import "./devRealTimeLog.css"

interface props {
    /**
     * mac or terminal
     */
    terminal: Uart.Terminal
}

interface eventData {
    type: string,
    time: string,
    data: any
}
export const DevRealTimeLog: React.FC<props> = ({ terminal }) => {

    const [logs, setLogs] = useState<eventData[]>([])
    useEffect(() => {
        addListenMac(terminal.DevMac);
    }, [])

    useEffect(() => {
        socketClient.io.once('mac_log', (data: eventData) => {
            if (!data.time) {
                data.time = dayjs().format('YYYY-MM-DD H:m:s');
            }
            const newLogs = [...logs, data]
            if (newLogs.length > 100) {
                newLogs.shift();
            }
            console.log(newLogs);

            setLogs(newLogs)
        })
    }, [logs])

    return (
        <>
            <Divider plain>显示mac设备日志(需要等待一段时间才会有数据, 一般在n秒左右)</Divider>

            {
                logs.length === 0 ? <div className="example">
                    <Spin />
                </div> : <div>
                    {
                        logs.map((log, i) => <Card title={log.type} key={i} style={{ marginBottom: 10 }}>
                            <p>time: {log.time}</p>
                            <p>data: </p>

                            <Collapse bordered={false}>
                                <Collapse.Panel header={JSON.stringify(log.data).slice(0, 100)} key="1">
                                    <JSONTree data={log.data} />
                                </Collapse.Panel>
                            </Collapse>
                        </Card>)
                    }
                </div>
            }

        </>
    )
}