import React, { useMemo, useState } from "react";
import { getAlarm, confrimAlarm } from "../common/Fetch";
import { Card, Row, Col, DatePicker, Table, Space, Button, Form, Popconfirm, message, Divider } from "antd"
import { Line, Pie } from "@ant-design/charts";
import moment from "moment"
import { generateTableKey, getColumnSearchProp, tableColumnsFilter } from "../common/tableCommon";
import { usePromise } from "../hook/usePromise";

interface alarms extends Uart.uartAlarmObject {
    _id?: string
}

export const Alarm: React.FC = () => {

    const [dates, setDates] = useState<[moment.Moment, moment.Moment]>([moment().subtract(6, "month"), moment()])

    const { data: alarms, fecth, loading, setData } = usePromise(async () => {
        const { data } = await getAlarm(dates[0].format("YYYY/MM/DD H:m:s"), dates[1].format("YYYY/MM/DD H:m:s"))
        return data
    }, [], [dates])



    const lineData = useMemo(() => {
        const maps: Map<string, alarms[]> = new Map()
        alarms.forEach(el => {
            const date = new Date(el.timeStamp).toLocaleDateString()
            if (!maps.has(date)) maps.set(date, [])
            maps.get(date)!.push(el)
        })
        return [...maps.entries()].map(([date, u]) => ({ date, count: u.length }))
    }, [alarms])

    const pieData = useMemo(() => {
        const maps: Map<string, alarms[]> = new Map()
        alarms.forEach(el => {
            const tag = el.tag || 'other'
            if (!maps.has(tag)) maps.set(tag, [])
            maps.get(tag)!.push(el)
        })
        return [...maps.entries()].map(([tag, u]) => ({ tag, count: u.length }))
    }, [alarms])

    /**
     * 确认告警,然后变更数据
     * @param _id 
     * @returns 
     */
    const confirm = async (_id?: string) => {
        await confrimAlarm(_id);
        if (_id) {
            const a = alarms.find(el_1 => el_1._id === _id);
            if (a)
                a.isOk = true;

            setData([...alarms])
        } else fecth()
        message.success("操作成功")
    }



    return (
        <>
            <Form layout="inline" style={{ margin: 8 }}>
                <Form.Item label="选择时间区间">
                    <DatePicker.RangePicker defaultValue={dates} onChange={(value) => setDates(value as any)} />
                </Form.Item>
                <Form.Item>
                    <Popconfirm title="是否确认全部告警,操作无法取消" onCancel={() => message.warn("取消操作")} onConfirm={() => {
                        confirm().then(() => message.success("操作成功!!!"))
                    }}>
                        <Button shape="round" type="primary">确认全部告警</Button>
                    </Popconfirm>
                </Form.Item>
            </Form>
            <Card>
                <Row>
                    <Col span={24} md={8} sm={0} key="chart">
                        <Card>
                            <Space direction="vertical" style={{ width: "100%" }}>
                                <Divider orientation="left" plain>告警类型占比</Divider>
                                <Pie height={200} data={pieData} angleField="count" colorField="tag" radius={0.6} label={{ type: "outer", content: '{name} {percentage}' }}></Pie>
                                <Divider orientation="left" plain>告警数量</Divider>
                                <Line yAxis={{ max: Math.max(...lineData.map(el => el.count)) * 2 }} height={200} data={lineData} xField="date" yField="count" point={{ size: 5 }} label={{}}></Line>
                            </Space>
                        </Card>
                    </Col>
                    <Col span={24} md={16} key="table">
                        <Table dataSource={generateTableKey(alarms, '_id')} size="small" sticky>
                            <Table.Column title='网关' dataIndex='mac' key="mac" ellipsis {...tableColumnsFilter(alarms, 'mac')} ></Table.Column>
                            <Table.Column title='设备' dataIndex='devName' key="devName" {...tableColumnsFilter(alarms, 'devName')}></Table.Column>
                            <Table.Column title='消息' dataIndex='msg' key="msg" ellipsis  {...getColumnSearchProp('msg')}></Table.Column>
                            <Table.Column title='类型' dataIndex='tag' key="tag" {...tableColumnsFilter(alarms, "tag")}></Table.Column>
                            <Table.Column title='时间' dataIndex='timeStamp' key="timeStamp"
                                defaultSortOrder='descend'
                                sorter={(a: any, b: any) => a.timeStamp - b.timeStamp}
                                render={
                                    (value: number) => (
                                        <p>{moment(value).format('MM-DD H:M:s')}</p>
                                    )
                                }></Table.Column>
                            <Table.Column title='操作' key="oprate" render={(_, record: alarms) => {
                                return (
                                    record.isOk ? <a >已确认</a> : <Button type="primary" danger size="small" onClick={() => confirm(record._id)}>确认告警</Button>
                                )
                            }}></Table.Column>
                        </Table>
                    </Col>
                </Row>
            </Card>

        </>
    )
}