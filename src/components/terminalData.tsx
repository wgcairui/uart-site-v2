import { Line } from "@ant-design/charts";
import { LinkOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Col, Collapse, DatePicker, Divider, Dropdown, Form, Input, message, Row, Select, Space, Timeline } from "antd";
import moment from "moment";
import React, { useState } from "react";
import { getDtuBusy, getUseBtyes, logAggs, logterminalAggs, sendATInstruct, SendProcotolInstructSet } from "../common/FecthRoot";
import { getTerminal } from "../common/Fetch";
import { usePromise } from "../hook/usePromise";


interface props {
    mac: string
}

/**
 * 设备使用流量
 * @returns 
 */
export const TerminalUseBytes: React.FC<props> = ({ mac }) => {
    const { data, loading } = usePromise(async () => {
        const { data } = await getUseBtyes(mac)
        return data.map(el => ({ x: moment(el.date).format('M/D'), y: Number((el.useBytes / 1024 / 1024).toFixed(2)) }))
    }, [])

    return (
        <>
            <Divider plain>此流量是根据socket字节数统计,仅提供参考,运营商流量是根据宽带计算,大于此统计数据(&gt;mul(2))</Divider>
            <Line loading={loading} data={data} xField="x" yField="y"
                yAxis={{
                    title: {
                        text: '单位 MB'
                    }
                }}
                xAxis={{
                    title: {
                        text: '日期'
                    }
                }}
            ></Line>
        </>
    )
}

/**
 * 显示设备运行繁忙状态
 * @param param0 
 * @returns 
 */
export const TerminalBusyStat: React.FC<props> = ({ mac }) => {

    const [date, setDate] = useState([moment().startOf("month"), moment().endOf('day')])

    const { data, loading } = usePromise(async () => {
        const { data } = await getDtuBusy(mac, date[0].format(), date[1].format())
        let stat = false
        const arr: Uart.logDtuBusy[] = []
        data.forEach(el => {
            if (el.stat !== stat) {
                stat = el.stat
                arr.push(el)
            }
        })
        return arr
    }, [], [date])

    return (
        <>
            <Form layout="inline" style={{ marginBottom: 12 }}>
                <Form.Item label="查询时间段">
                    <DatePicker.RangePicker
                        value={[date[0], date[1]]}
                        onChange={(_, d) => setDate(d.map(el => moment(el)))}
                    ></DatePicker.RangePicker>
                </Form.Item>
            </Form>
            <Card style={{ maxHeight: 500, overflow: 'auto' }} loading={loading}>
                <Timeline mode='left'>
                    {
                        data.map(({ stat, timeStamp }, i) =>
                            <Timeline.Item
                                color={stat ? 'red' : 'green'}
                                key={timeStamp + i + (stat ? '繁忙' : '空闲')}
                                label={moment(timeStamp).format('MM-DD H:m:s:SSS')}>
                                <p>设备状态:{stat ? '繁忙' : '空闲'}</p>
                            </Timeline.Item>)
                    }
                </Timeline>
            </Card>
        </>
    )
}


/**
 * 设备at调试指令
 * @param param0 
 * @returns 
 */
export const TerminalAT: React.FC<props> = ({ mac }) => {

    const content = {
        get: {
            title: "查询",
            instructs: [
                { text: "查询主机名称", value: "HOST" },
                { text: "软件版本", value: "VER" },
                { text: "GPRS版本", value: "GVER" },
                { text: "定制软件版本号", value: "APPVER" },
                { text: "查询串口参数", value: "UART=1" },
                { text: "注册包配置", value: "NREGDT=A" },
                { text: "基站定位", value: "LOCATE=1" },
                { text: "GPS定位", value: "LOCATE=2" },
                { text: "查询 GPRS 信号强度", value: "GSLQ" },
                { text: "查询 GSM 状态", value: "GSMST" },
                { text: "查询模块 ICCID 码", value: "ICCID" },
                { text: "查询模块 IMEI 码", value: "IMEI" },
                { text: "查询 SIM 卡 IMSI 号", value: "IMSI" },
                { text: "IOT状态", value: "IOTEN" },
                { text: "UserID", value: "IOTUID" },
                { text: "模块型号", value: "PID" },
                { text: "打印调试信息输出", value: "NDBGL" },
                { text: "查询APN", value: "APN" },
                { text: "查询TCP超时", value: "TCPTO=A" },
                { text: "查询网络协议参数", value: "NETP=A" },
                { text: "前导字符", value: "CMDPW" },
                { text: "APN信息", value: "APN" },
            ],
        },
        set: {
            title: "设置",
            instructs: [
                { text: "设置波特率2400", value: "UART=1,2400,8,1,NONE,NFC" },
                { text: "设置波特率4800", value: "UART=1,4800,8,1,NONE,HD" },
                { text: "设置波特率9600", value: "UART=1,9600,8,1,NONE,HD" },
                { text: "设置波特率19200", value: "UART=1,19200,8,1,NONE,HD" },
                { text: "设置波特率115200", value: "UART=1,115200,8,1,NONE,HD" },
                { text: "关闭IOT", value: "IOTEN=off" },
                { text: "临时打开IOT 1小时", value: "IOTEN=active,60" },
                { text: "打开IOT 全天", value: "IOTEN=on,00:00,23:59" },
                { text: "固件更新(url必填)", value: "UPGRADE=url" },
                { text: "设置APN(APN必填)", value: "APN=apn" },
            ],
        },
        control: {
            title: "控制",
            instructs: [
                { text: "保存当前参数为用户默认参数", value: "CFGTF" },
                { text: "恢复用户默认参数", value: "RELD" },
                { text: "恢复出厂参数", value: "FCLR" },
                { text: "硬重启", value: "Z" },
            ],
        },
    };


    const [at, setAt] = useState('')

    const [add, setAdd] = useState(true)

    const [msg, setMsg] = useState<{ type: boolean, text: string, time: number }[]>([])

    const query = async () => {
        const key = 'queryAt'
        message.loading({ content: '正在处理', key })
        const str = "+++AT+";
        setMsg(m => [{ type: true, text: at, time: Date.now() }, ...m])
        const { data } = await sendATInstruct(mac, add ? str + at : at)
        setMsg(m => [{ type: false, text: `code:${data.ok}  msg:${data.msg}`, time: Date.now() }, ...m])
        message.info({ content: '查询完成', key })
    }

    return (
        <Row gutter={36}>
            <Col span={12}>
                <Divider plain>
                    <a href="http://admin.ladishb.com/upload/4G_2G_NB_DTU产品功能.pdf" target="_blank"><LinkOutlined />调试指令文档(仅支持4G版本)</a>
                </Divider>
                <Collapse defaultActiveKey="get" ghost accordion>
                    {
                        Object.entries(content).map(([key, val]) =>
                            <Collapse.Panel header={val.title} key={key}>

                                <Space wrap size="middle">
                                    {
                                        val.instructs.map(el => <Button
                                            shape="round"
                                            type="primary"
                                            key={el.value}
                                            onClick={() => setAt(el.value)}
                                        >
                                            {el.text}
                                        </Button>)
                                    }
                                </Space>
                                <Divider></Divider>
                            </Collapse.Panel>)
                    }
                </Collapse>
            </Col>
            <Col span={12} >
                <Divider plain>操作</Divider>
                <Form>
                    <Form.Item label="设备ID">{mac}</Form.Item>
                    <Form.Item label="指令">
                        <Input value={at} onChange={e => setAt(e.target.value)} placeholder="输入受支持的AT指令" />
                    </Form.Item>
                    <Form.Item label="Set">
                        <Checkbox checked={add} onChange={e => setAdd(e.target.checked)}>添加[+++AT+]前辍</Checkbox>
                    </Form.Item>
                    <Form.Item>
                        <Button onClick={() => query()} type="primary" disabled={!at}>发送</Button>
                    </Form.Item>
                </Form>

                {
                    msg.length > 0 && <Card>
                        <Timeline mode="left">
                            {
                                msg.map(({ type, text, time }) =>
                                    <Timeline.Item label={moment(time).format('H:mm:ss') + (type ? '发送' : '接收')} color={type ? 'green' : 'red'}>
                                        {text}
                                    </Timeline.Item>)
                            }
                        </Timeline>
                    </Card>
                }
            </Col>
        </Row>
    )
}


/**
 * 设备Oprate调试指令
 * @param param0 
 * @returns 
 */
export const TerminalOprate: React.FC<props> = ({ mac }) => {


    const [dev, setDev] = useState('')

    const [oprate, setOprate] = useState('')

    const [msg, setMsg] = useState<{ type: boolean, text: string, time: number }[]>([])

    const { data, loading } = usePromise(async () => {
        const { data } = await getTerminal(mac)
        return data.mountDevs || []
    }, [])

    const query = async () => {
        const key = 'queryOprate'
        message.loading({ content: '正在处理', key })
        const { protocol, pid } = data.find(el => el.mountDev === dev)!
        setMsg(m => [{ type: true, text: `${dev}/${protocol}/${pid}/${oprate}`, time: Date.now() }, ...m])

        const { data: r } = await SendProcotolInstructSet({ DevMac: mac, protocol, pid, content: oprate, })
        setMsg(m => [{ type: false, text: `code:${r.ok}  msg:${r.msg}`, time: Date.now() }, ...m])
        message.info({ content: '查询完成', key })
    }

    return (
        <Row gutter={36}>
            <Col span={8}>
                <Divider plain>操作</Divider>
                <Form>
                    <Form.Item label="设备ID">{mac}</Form.Item>
                    <Form.Item label="设备">
                        <Select onSelect={v => setDev(v as any)} loading={loading}>
                            {
                                data.map(dev => <Select.Option value={dev.mountDev} key={dev.mountDev}>{dev.mountDev}</Select.Option>)
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item label="指令">
                        <Input value={oprate} onChange={e => setOprate(e.target.value)} placeholder="输入受支持的指令,modbus无需输地址和校验码" />
                    </Form.Item>
                    <Form.Item>
                        <Button onClick={() => query()} type="primary" disabled={!oprate}>发送</Button>
                    </Form.Item>
                </Form>
            </Col>
            <Col span={16} >
                <Divider plain> 消息</Divider>
                {
                    msg.length > 0 && <Card>
                        <Timeline mode="left">
                            {
                                msg.map(({ type, text, time }) =>
                                    <Timeline.Item label={moment(time).format('H:mm:ss') + (type ? '发送' : '接收')} color={type ? 'green' : 'red'}>
                                        {text}
                                    </Timeline.Item>)
                            }
                        </Timeline>
                    </Card>
                }
            </Col>
        </Row>
    )
}

/**
 * 显示设备运行日志
 * @param param0 
 * @returns 
 */
export const TerminalRunLog: React.FC<props> = ({ mac }) => {

    const [date, setDate] = useState([moment().subtract(3, 'month'), moment().endOf('day')])

    const { data, loading, fecth } = usePromise(async () => {
        const { data } = await logterminalAggs(mac, date[0].format(), date[1].format())
        const t: Uart.logTerminalsType = "dtu主动断开"
        let i = false
        const arr: logAggs<number>[] = []
        data.forEach(el => {
            if (el.type) {
                if (el.type === t) {
                    if (!i) {
                        arr.push(el)
                        i = true
                    }
                } else {
                    i = false
                    arr.push(el)
                }
            }
        })
        return arr
    }, [], [date])

    return (
        <>
            <Form layout="inline" style={{ marginBottom: 12 }} >
                <Form.Item label="查询时间段">
                    <DatePicker.RangePicker
                        value={[date[0], date[1]]}
                        onChange={(_, d) => setDate(d.map(el => moment(el)))}
                    ></DatePicker.RangePicker>
                </Form.Item>
                <Form.Item>
                    <Button onClick={() => fecth()}>刷新</Button>
                </Form.Item>
            </Form>
            <Card style={{ maxHeight: 500, overflow: 'auto' }} loading={loading}>
                <Timeline mode='left'>
                    {
                        data.map(({ msg, type, timeStamp }, i) =>
                            <Timeline.Item
                                color={type ? 'blue' : 'green'}
                                key={timeStamp + i}
                                label={moment(timeStamp).format('MM-DD H:m:s:SSS')}>
                                <p>{msg || type}</p>
                            </Timeline.Item>)
                    }
                </Timeline>
            </Card>
        </>
    )
}