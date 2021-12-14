import { Divider, Spin, Table } from "antd";
import React, { useMemo, useState } from "react";
import { useAsyncRetry } from "react-use";
import { getProtocols } from "../../common/FecthRoot";
import { RootMain } from "../../components/RootMain";
import { getColumnSearchProp, tableColumnsFilter, tableConfig } from "../../common/tableCommon";
import { pieConfig } from "../../common/charts";
import { Pie } from "@ant-design/charts";

export const Protocols: React.FC = () => {

    //const protocols = useState<Uart.protocol[]>([])

    const protocols = useAsyncRetry(async () => {
        const el = await getProtocols();
        return el.data.map(p => ({ ...p, key: p.Protocol }));
    }, [])

    const status = useMemo(() => {
        if (protocols.loading) {
            return []
        } else {
            const m = new Map<string, number>()
            protocols.value!.forEach(el => {
                m.set(el.ProtocolType, (m.get(el.ProtocolType) || 0) + 1)
            })
            return [...m.entries()].map(([type, value]) => ({ type, value }))
        }

    }, [protocols])
    return (
        <RootMain>
            <Divider orientation="left">所有协议</Divider>
            <Pie data={status} {...pieConfig({ angleField: 'value', colorField: 'type', radius: .8 })} />
            {
                protocols.loading ?
                    <Spin />
                    :
                    <Table dataSource={protocols.value} {...tableConfig}>
                        <Table.Column dataIndex="Protocol" title="协议" {...getColumnSearchProp("Protocol")}></Table.Column>
                        <Table.Column dataIndex="ProtocolType" title="协议类型" {...tableColumnsFilter(protocols.value!, 'ProtocolType')}></Table.Column>
                        <Table.Column dataIndex="Type" title="串口类型"></Table.Column>
                        <Table.Column key="oprate" title="操作"></Table.Column>
                    </Table>
            }
        </RootMain>
    )
}