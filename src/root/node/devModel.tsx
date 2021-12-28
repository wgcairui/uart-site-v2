import { Pie } from "@ant-design/charts";
import { Divider, Table } from "antd";
import React, { useMemo, useState } from "react";
import { pieConfig } from "../../common/charts";
import { DevTypes } from "../../common/FecthRoot";
import { generateTableKey, getColumnSearchProp, tableColumnsFilter } from "../../common/tableCommon";
import { usePromise } from "../../hook/usePromise";

export const DevModel: React.FC = () => {

    const [fType, setType] = useState<string[]>([])
    const { data, loading, fecth } = usePromise(async () => {
        const { data } = await DevTypes()
        return data
    }, [])

    const status = useMemo(() => {
        const m = new Map<string, number>()
        data.forEach(el => {
            m.set(el.Type, (m.get(el.Type) || 0) + 1)
        })
        return [...m.entries()].map(([type, value]) => ({ type, value }))
    }, [data])

    return (
        <>
            <Divider orientation="left">节点信息</Divider>
            <Pie data={status} renderer="canvas" {...pieConfig({ angleField: 'value', colorField: 'type', radius: .8, onClick: t => setType([t]) })} />
            <Table loading={loading} dataSource={generateTableKey(data, "_id")}>
                <Table.Column dataIndex="DevModel" title="设备型号" {...getColumnSearchProp("DevModel")}></Table.Column>
                <Table.Column dataIndex="Type" title="设备类型" filteredValue={fType} {...tableColumnsFilter(data, 'Type')}></Table.Column>
                <Table.Column dataIndex="Protocols" title="协议集" render={(val: any[]) => val.map(el => el.Protocol).join(",")}></Table.Column>
                <Table.Column key="oprate" title="操作"></Table.Column>
            </Table>
        </>
    )
}