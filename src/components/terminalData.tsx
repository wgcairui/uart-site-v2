import { Line } from "@ant-design/charts";
import { FundFilled, InfoCircleFilled, LinkOutlined, SyncOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Col, Collapse, DatePicker, Divider, Empty, Form, Input, message, Row, Select, Space, Spin, Table, Timeline, Tooltip } from "antd";
import { ColumnsType } from "antd/lib/table";
import moment from "moment";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getDtuBusy, getUseBtyes, logterminalAggs, sendATInstruct, SendProcotolInstructSet } from "../common/FecthRoot";
import { getProtocolSetup, getTerminal, getTerminalDatasV2, getTerminalPidProtocol } from "../common/Fetch";
import { generateTableKey, getColumnSearchProp, tableConfig } from "../common/tableCommon";
import { RepeatFilter } from "../common/util";
import { usePromise } from "../hook/usePromise";
import { useTerminalData } from "../hook/useTerminalData";


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
        return RepeatFilter(data)
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

/**
 * 用户设备数据
 */
export interface DevDataProps extends props {
    /**
     * 
     */
    pid: number | string
    /**
     * 设置用户,如果有用户的话,下载用户显示配置
     */
    user?: string
}

/**
 * 用户设备数据列表
 */
interface UserRunDataProps extends DevDataProps {
    /**
     * 是否关闭刷选
     */
    closeFilter?: boolean

    /**
     * 数据更新是更新数据
     */
    OnUpdate?: (result: Uart.queryResultArgument[], data?: Uart.queryResultSave) => void
}

/**
 * 设备数据
 * @param param0 
 * @returns 
 */
export const TerminalRunData: React.FC<UserRunDataProps> = ({ mac, pid, user, closeFilter, OnUpdate }) => {

    /**
     * 订阅设备数据变更
     */
    const { data, loading, fecth } = useTerminalData(mac, pid)

    /**
     * 如果有更新函数,运行
     */
    useEffect(() => {
        if (OnUpdate) {
            OnUpdate(data ? data.result : [], data)
        }
    }, [data])

    /**
     * 获取用户协议配置
     */
    const { data: ShowTag } = usePromise(async () => {
        const protocol = await getTerminalPidProtocol(mac, pid)
        const { data } = await getProtocolSetup<string>(protocol.data.protocol, 'ShowTag', user)
        return new Set([data.sys, data.user].flat())
    }, new Set())

    /**
     * 获取显示的参数
     */
    const result = useMemo(() => {
        if (data) {
            if (!closeFilter && ShowTag.size > 0) {
                return data.result.filter(el => ShowTag.has(el.name))
            } else
                return data.result
        } else {
            return []
        }
    }, [data, ShowTag])

    return (
        !data ? <Spin />
            :
            <section>
                <Space>
                    <span>
                        {
                            moment(data.time).isBefore(moment().startOf("day"))
                                ? moment(data.time).format("YYYY/M/D H:mm:ss")
                                : moment(data.time).format("H:mm:ss")
                        }
                    </span>
                    <SyncOutlined onClick={() => fecth()} />
                </Space>
                <Table dataSource={generateTableKey(result, "name")}
                    loading={loading && !data}
                    {...tableConfig}
                    columns={[
                        {
                            dataIndex: 'name',
                            title: '参数',
                            ...getColumnSearchProp("name")
                        },
                        {
                            dataIndex: 'parseValue',
                            title: '值',
                            render: (value, record) => (
                                <span>{value + (!record.issimulate ? record.unit : '')}
                                    {
                                        (record.issimulate || !record.unit)
                                            ? <a />
                                            : <Tooltip color="cyan" title={`查看[${record.name}]的历史记录`}>
                                                <Link to={`/devline/?name=${record.name}`}>
                                                    <FundFilled style={{ marginLeft: 8 }} />
                                                </Link>
                                            </Tooltip>
                                    }
                                    {
                                        record.alarm ? <InfoCircleFilled style={{ color: "#E6A23C" }} /> : <a />
                                    }

                                </span>
                            )
                        }
                    ] as ColumnsType<Uart.queryResultArgument>}
                />
            </section>
    )
}

/**
 * 用户设备数据告警约束状态
 * @param param0 
 * @returns 
 */
export const TerminalRunDataThresoldLine: React.FC<DevDataProps & { time?: string | number }> = ({ mac, pid, user, time }) => {

    const [date, setDate] = useState<[moment.Moment, moment.Moment]>([moment(time).subtract(10, "minute"), moment(time)])

    const { data, fecth, loading } = usePromise(async () => {
        const protocol = await getTerminalPidProtocol(mac, pid)
        const setup = await getProtocolSetup<Uart.Threshold>(protocol.data.protocol, 'Threshold', user)
            .then(({ data: { sys, user } }) => {
                const sMap = new Map(sys.map(el => [el.name, el]))
                if (user.length > 0) {
                    const uMap = new Map(user.map(el => [el.name, el]))
                    sMap.forEach((_, key) => {
                        if (uMap.has(key)) {
                            sMap.set(key, uMap.get(key)!)
                        }
                    })
                }
                return sMap
            })

        /**
         * 如果选择的时间间隔超过一天,把时间收束到一天
         */
        /* if (date[0].diff(date[1], "day") > 1) {
            setDate(el => {
                el[1] = el[0].add(1, "day")
                return [...el]
            })
        } */
        const { data } = await getTerminalDatasV2(mac, pid, [...setup.keys()] || [], date[0].valueOf(), date[1].valueOf())
        return data.map(el => ({ ...el, time: moment(el.time).format("M/D H:m:s"), value: parseFloat(el.value) }))
    }, [], [date])

    const max = (n: number[]) => {
        const m = Math.max(...n)
        return m > 100 ? m + 100 : 100
    }

    return (
        <>
            <Divider orientation="left" plain>展示告警约束参数的运行状态</Divider>
            <Form layout="inline">
                <Form.Item label="选择时间">
                    <DatePicker.RangePicker
                        showTime={{ format: 'HH:mm:ss' }}
                        format="YYYY-MM-DD HH:mm:ss"
                        value={date} onOk={(val: any) => setDate(val)}
                    />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" onClick={() => fecth()}>刷新</Button>
                </Form.Item>
            </Form>
            {
                data.length > 0
                    ? <Line autoFit loading={loading} xField="time" yField="value" yAxis={{ max: max(data.map(el => el.value)) }} seriesField="name" data={data} renderer="svg"></Line>
                    : <Empty description="没有数据" style={{ marginTop: 36 }}></Empty>
            }
        </>
    )
}