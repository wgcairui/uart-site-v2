import { Pie } from "@ant-design/charts";
import { Divider, Table } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { pieConfig } from "../../common/charts";
import { DevTypes } from "../../common/FecthRoot";
import { getDevTypes } from "../../common/Fetch";
import { getColumnSearchProp, tableColumnsFilter } from "../../common/tableCommon";
import { RootMain } from "../../components/RootMain";

export const DevModel: React.FC = () => {

    const [models, setModels] = useState<Uart.DevsType[]>([])

    const upDevTypes = () => {
        DevTypes().then(el => setModels(el.data.map(el => ({ ...el, key: el._id }))))
    }

    useEffect(() => upDevTypes(), [])

    const status = useMemo(() => {
        const m = new Map<string, number>()
        models.forEach(el => {
            m.set(el.Type, (m.get(el.Type) || 0) + 1)
        })
        return [...m.entries()].map(([type, value]) => ({ type, value }))
    }, [models])

    return (
        <RootMain>
            <Divider orientation="left">节点信息</Divider>
            <Pie data={status} {...pieConfig({ angleField: 'value', colorField: 'type', radius: .8 })} />
            <Table dataSource={models}>
                <Table.Column dataIndex="DevModel" title="设备型号" {...getColumnSearchProp("DevModel")}></Table.Column>
                <Table.Column dataIndex="Type" title="设备类型" {...tableColumnsFilter(models, 'Type')}></Table.Column>
                <Table.Column dataIndex="Protocols" title="协议集" render={(val: any[]) => val.map(el => el.Protocol).join(",")}></Table.Column>
                <Table.Column key="oprate" title="操作"></Table.Column>
            </Table>

        </RootMain>
    )
}