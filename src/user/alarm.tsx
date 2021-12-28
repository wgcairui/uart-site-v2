import React, { useEffect, useMemo, useState } from "react";
import { Main } from "../components/Main";
import { getAlarm, confrimAlarm } from "../common/Fetch";
import { Card, Row, Col, DatePicker, Table, Space, Button, Form, Popconfirm, message, Divider } from "antd"
import { Line, Pie } from "@ant-design/charts";
import moment from "moment"
import { getColumnSearchProp } from "../common/tableCommon";

interface alarms extends Uart.uartAlarmObject {
    _id?: string
}

export const Alarm: React.FC = () => {

    const [alarms, setAlarms] = useState<alarms[]>([])

    const [dates, setDates] = useState(() => {
        const d = new Date()
        const end = d.toLocaleDateString()
        d.setDate(d.getDate() - 180)
        return [d.toLocaleDateString(), end]
    })

    useEffect(() => {
        getAlarm(dates[0] + ' 0:0:0', dates[1] + ' 23:59:59').then(el => {
            setAlarms(el.data.map((el, key) => ({ ...el, key })))
        })
    }, [dates])

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
        }
        setAlarms(_id ? alarms : alarms.map(el_2 => ({ ...el_2, isOk: true })));
        return
    }



    return (
        <>
            <Form layout="inline" style={{ margin: 8 }}>
                <Form.Item label="选择时间区间">
                    <DatePicker.RangePicker defaultValue={[moment(dates[0], 'YYYY-MM-DD'), moment(dates[1], 'YYYY-MM-DD')]} onChange={(value, dates) => setDates(dates)} />
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
                    <Col span={24} md={8} key="chart">
                        <Card>
                            <Space direction="vertical" style={{ width: "100%" }}>
                                <Divider orientation="left">告警类型占比</Divider>
                                <Pie data={pieData} angleField="count" colorField="tag" radius={0.6} label={{ type: "outer", content: '{name} {percentage}' }}></Pie>
                                <Divider orientation="left">告警数量</Divider>
                                <Line data={lineData} xField="date" yField="count" point={{ size: 5 }} label={{}}></Line>
                            </Space>
                        </Card>
                    </Col>
                    <Col span={24} md={16} key="table">
                        <Table dataSource={alarms} size="small" sticky key="sss">
                            <Table.Column title='mac' dataIndex='mac' key="mac" ellipsis {...getColumnSearchProp('mac')} ></Table.Column>
                            <Table.Column title='设备' dataIndex='devName' key="devName" {...getColumnSearchProp('devName')}></Table.Column>
                            <Table.Column title='消息' dataIndex='msg' key="msg" ellipsis  {...getColumnSearchProp('msg')}></Table.Column>
                            <Table.Column title='类型' dataIndex='tag' key="tag"></Table.Column>
                            <Table.Column title='时间' dataIndex='timeStamp' key="timeStamp" render={
                                (value: number) => (
                                    <p>{moment(value).format('MM-DD H:M:s')}</p>
                                )
                            }></Table.Column>
                            <Table.Column title='操作' key="oprate" render={(_, record: alarms) => {
                                return (
                                    record.isOk ? <a >已确认</a> : <Button onClick={() => confirm(record._id)}>确认告警</Button>
                                )
                            }}></Table.Column>
                        </Table>
                    </Col>
                </Row>
            </Card>

        </>
    )
}