import { Divider, Table } from "antd";
import React, { useMemo, useState } from "react";
import { getProtocols } from "../../common/FecthRoot";
import { generateTableKey, getColumnSearchProp, tableColumnsFilter, tableConfig } from "../../common/tableCommon";
import { pieConfig } from "../../common/charts";
import { Pie } from "@ant-design/charts";
import { usePromise } from "../../use/usePromise";

export const Protocols: React.FC = () => {

    const [fProtocolType, setProtocolType] = useState<string[]>([])

    const { data, loading, fecth } = usePromise(async () => {
        const el = await getProtocols();
        return el.data
    }, [])

    const status = useMemo(() => {
        const m = new Map<string, number>()
        data.forEach(el => {
            m.set(el.ProtocolType, (m.get(el.ProtocolType) || 0) + 1)
        })
        return [...m.entries()].map(([type, value]) => ({ type, value }))
    }, [data])
    return (
        <>
            <Divider orientation="left">所有协议</Divider>
            <Pie data={status}
                {...pieConfig({ angleField: 'value', colorField: 'type', radius: .8, onClick: t => setProtocolType([t]) })}
            />
            <Table loading={loading} dataSource={generateTableKey(data, '_id')} {...tableConfig}>
                <Table.Column dataIndex="Protocol" title="协议" {...getColumnSearchProp("Protocol")}></Table.Column>
                <Table.Column dataIndex="ProtocolType" title="协议类型" filteredValue={fProtocolType} {...tableColumnsFilter(data, 'ProtocolType')}></Table.Column>
                <Table.Column dataIndex="Type" title="串口类型"></Table.Column>
                <Table.Column key="oprate" title="操作"></Table.Column>
            </Table>
        </>
    )
}