import { Divider, Table } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { RootMain } from "../../components/RootMain";
import { Nodes as getNodes } from "../../common/FecthRoot"
import { tableConfig } from "../../common/tableCommon";
import { Pie } from "@ant-design/charts";
import { pieConfig } from "../../common/charts";

export const Nodes: React.FC = () => {

    const [nodes, setNodes] = useState<Uart.NodeClient[]>([])

    useEffect(() => {
        getNodes().then(el => setNodes(el.data.map(els => ({ ...els, key: els._id }))))
    }, [])

    const status = useMemo(() => {
        return nodes.map(el => ({ type: el.Name, value: el.count || 0 }))
    }, [nodes])
    return (
        <>
            <Divider orientation="left">节点信息</Divider>
            <Pie data={status} {...pieConfig({angleField:'value',colorField:'type',radius:.8})}/>
            <Table dataSource={nodes} {...tableConfig}>
                <Table.Column dataIndex="Name" title="节点名称"></Table.Column>
                <Table.Column dataIndex="IP" title="节点IP"></Table.Column>
                <Table.Column dataIndex="Port" title="节点端口"></Table.Column>
                <Table.Column dataIndex="MaxConnections" title="最大连接数"></Table.Column>
                <Table.Column dataIndex="count" title="注册设备"></Table.Column>
                <Table.Column dataIndex="online" title="在线设备"></Table.Column>
                <Table.Column key="oprate" title="操作"></Table.Column>
            </Table>
        </>
    )
}