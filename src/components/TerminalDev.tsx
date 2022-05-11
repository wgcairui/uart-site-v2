import { Liquid } from "@ant-design/charts";
import { DownOutlined } from "@ant-design/icons";
import { Button, Card, Col, Descriptions, Divider, Dropdown, Form, Image, Menu, message, Modal, Progress, Row, Select, Space, Spin, Switch, Tabs } from "antd";
import React, { useMemo, useState } from "react";
import { addTerminalMountDev, getProtocolSetup, getTerminal, getTerminalPidProtocol } from "../common/Fetch";
import { sendOprateInstruct } from "../common/util";
import { usePromise } from "../hook/usePromise";
import { DevTypesCascader } from "./Selects";
import { IconFontSpin } from "./IconFont";
import { DevDataProps, TerminalRunData, TerminalRunDataThresoldLine } from "./terminalData";
import "./TerminalDev.css"
import { devAir, devUpsStat } from "../common/devImgSource";
import { useNav } from "../hook/useNav";

interface result extends DevDataProps {
    result: Uart.queryResultArgument[]
}

/**
 * 设备操作指令
 * @param param0 
 * @returns 
 */
export const TerminalOprate: React.FC<result> = ({ mac, pid }) => {

    const { data } = usePromise(async () => {
        const { data: mountDev } = await getTerminalPidProtocol(mac, pid)
        const { data: { sys } } = await getProtocolSetup<Uart.OprateInstruct>(mountDev.protocol, "OprateInstruct")
        return sys
    }, [])

    return (
        data.length === 0 ? <></>
            :
            <Dropdown
                overlay={<Menu>
                    {
                        data.map(el => <Menu.Item key={el.name} onClick={() => sendOprateInstruct(mac, pid, el.tag)}>
                            {el.name}
                        </Menu.Item>)
                    }
                </Menu>}>
                <a className="ant-dropdown-link">
                    操作指令<DownOutlined />
                </a>
            </Dropdown>
    )
}


/**
 * 设备状态-温湿度
 * @returns 
 */
export const TerminalDevTH: React.FC<result> = ({ mac, pid, result }) => {

    const { data: Constant } = usePromise(async () => {
        const mountDev = await getTerminalPidProtocol(mac, pid)
        const constant = await getProtocolSetup<Uart.DevConstant_TH>(mountDev.data.protocol, 'Constant')
        return constant.data.sys as any as Uart.DevConstant_TH
    })

    const th = useMemo(() => {
        const th = {
            t: 0,
            h: 0
        }
        if (Constant && result) {
            const rMap = new Map(result.map(el => [el.name, el]))
            th.t = Number(rMap.get(Constant.Temperature)?.parseValue) || 0
            th.h = Number(rMap.get(Constant.Humidity)?.parseValue) || 0
        }
        return th
    }, [result, Constant])

    return (
        <Row>
            <Col span={12} md={12}>
                <Liquid radius={0.6} height={250} statistic={{ content: { content: `温度:${th.t}℃`, style: "fontSize:22px" } }} percent={th.t / 100} />
            </Col>
            <Col span={12} md={12}>
                <Liquid radius={0.6} height={250} statistic={{ content: { content: `湿度:${th.h}%RH`, style: "fontSize:42px" } }} percent={th.h / 100} />
            </Col>
        </Row>
    )
}


interface ios {
    r: Uart.queryResultArgument,
    disable?: boolean,
    onChange?: (r: Uart.queryResultArgument, v: boolean) => void
}
const IoSwicth: React.FC<ios> = ({ r, disable, onChange }) => {

    return (
        <>
            <Switch
                checked={Boolean(Number(r.value))}
                size="default"
                disabled={disable}
                checkedChildren={r.parseValue}
                unCheckedChildren={r.parseValue}
                onChange={v => onChange && onChange(r, v)}
            ></Switch>
        </>
    )
}


/**
 * 设备状态-IO
 * @returns 
 */
export const TerminalDevIO: React.FC<result> = ({ mac, pid, result }) => {

    const { data: Constant } = usePromise(async () => {
        const mountDev = await getTerminalPidProtocol(mac, pid)
        const constant = await getProtocolSetup<Uart.DevConstant_IO>(mountDev.data.protocol, 'Constant')
        return constant.data.sys as any as Uart.DevConstant_IO
    })

    const io = useMemo(() => {
        const io: Record<'in' | 'out', Uart.queryResultArgument[]> = {
            in: [],
            out: []
        }
        if (Constant && result) {
            const rMap = new Map(result.map(el => [el.name, el]))
            Constant.di.forEach(el => {
                io.in.push(rMap.get(el)!)
            })
            io.in = io.in.filter(el => el)
            Constant.do.forEach(el => {
                io.out.push(rMap.get(el)!)
            })
            io.out = io.out.filter(el => el)
        }
        return io
    }, [result, Constant])


    /**
     * 变更设备状态
     * @param item 
     */
    const changeDo = async (item: Uart.queryResultArgument, v: boolean) => {
        const tag = Boolean(Number(item.value)) ? '断开' : '闭合'
        Modal.confirm({
            content: `确认操作${item.name} [${tag}]?`,
            onOk() {
                // 获取index
                const index = io.out.findIndex(el => el.name === item.name)
                sendOprateInstruct(mac, pid, tag, index + 1)
            }
        })
    }

    return (

        <Row>
            <Col span={12} md={24}>
                <Divider plain>DI</Divider>
                <Form layout="inline" style={{ justifyContent: "center" }}>
                    {
                        io.in.map(i => <Form.Item label={i.name} key={i.name}>
                            <IoSwicth r={i} disable></IoSwicth>
                        </Form.Item>)
                    }
                </Form>
            </Col>
            <Col span={12} md={24}>
                <Divider plain>DO</Divider>
                <Form layout="inline" style={{ justifyContent: "center" }}>
                    {
                        io.out.map(i => <Form.Item label={i.name} key={i.name}>
                            <IoSwicth r={i} onChange={changeDo}></IoSwicth>
                        </Form.Item>)
                    }
                </Form>
            </Col>
        </Row>
    )
}


/**
 * 展示空调页面
 * @param param0 
 * @returns 
 */
export const TerminalDevAir: React.FC<result> = ({ mac, pid, result }) => {

    const { data: Constant } = usePromise(async () => {
        const mountDev = await getTerminalPidProtocol(mac, pid)
        const constant = await getProtocolSetup<Uart.DevConstant_Air>(mountDev.data.protocol, 'Constant')
        return constant.data.sys as any as Uart.DevConstant_Air
    })

    const air = useMemo(() => {
        const stat: Record<keyof Uart.DevConstant_Air, string> = {
            Switch: '',
            WorkMode: '',
            ColdChannelHumidity: '0',
            ColdChannelTemperature: '0',
            HeatChannelHumidity: '0',
            HeatChannelTemperature: '0',
            RefrigerationHumidity: '0',
            RefrigerationTemperature: '0',
            Speed: '0'
        }

        if (Constant && result.length > 0) {
            const rMap = new Map(result.map(el => [el.name, el]))
            for (const key in stat) {
                const value = rMap.get(Constant[key as keyof Uart.DevConstant_Air])
                if (value) {
                    stat[key as keyof Uart.DevConstant_Air] = value.parseValue
                }
            }
        }
        return stat
    }, [result, Constant])

    /**
     * 开关机
     * @param val 
     */
    const OnOff = (val: boolean) => {
        Modal.confirm({
            content: `确定${!val ? '关闭' : '打开'}空调??`,
            onOk: () => {
                sendOprateInstruct(mac, pid, !val ? '关机' : '开机')
            }
        })
    }

    return (
        <Row style={{ padding: 12 }}>
            <Col span={24} md={12} style={{ backgroundColor: "black", padding: 12 }}>
                <Image src={devAir} preview={false} />
            </Col>
            <Col span={24} md={12}>
                <Row>
                    <Col span={24} md={12}>
                        <Row>
                            <Col span={12} >
                                <Switch
                                    checked={air.Switch === '运行'}
                                    checkedChildren={air.Switch}
                                    unCheckedChildren={air.Switch}
                                    onChange={OnOff}
                                ></Switch>
                            </Col>

                            <Col span={12}>


                            </Col>

                        </Row>
                    </Col>
                    <Col span={24} md={12} style={{ height: "100%" }}>
                        <Row gutter={32} style={{ height: "100%" }}>
                            <Col span={8}>
                                <section style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <span>送风</span>
                                    {
                                        air.WorkMode.includes('风') ?
                                            <IconFontSpin type="icon-a-28tongfengfengshan" animationDuration="4s" color="#1296db" />
                                            : <IconFontSpin type="icon-a-28tongfengfengshan" />
                                    }
                                </section>
                            </Col>
                            <Col span={8}>
                                <section style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <span>制热</span>
                                    {
                                        air.WorkMode.includes('制热') ?
                                            <IconFontSpin type="icon-zhire" animationDuration="4s" color="#d4237a" />
                                            : <IconFontSpin type="icon-zhire" />
                                    }
                                </section>
                            </Col>
                            <Col span={8}>
                                <section style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <span>制冷</span>
                                    {
                                        air.WorkMode.includes('制冷') ?
                                            <IconFontSpin type="icon-kongdiao" animationDuration="4s" color="#1296db" />
                                            : <IconFontSpin type="icon-kongdiao" />

                                    }
                                </section>
                            </Col>
                            <Col span={8}>
                                <section style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <span>除湿</span>
                                    {
                                        air.WorkMode.includes('除湿') ?
                                            <IconFontSpin type="icon-chushi" color="#1296db" />
                                            : <IconFontSpin type="icon-chushi" />
                                    }
                                </section>
                            </Col>
                            <Col span={8}>
                                <section style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <span>加湿</span>
                                    {
                                        air.WorkMode.includes('加湿') ?
                                            <IconFontSpin type="icon-jiashi" color="#1296db" />
                                            : <IconFontSpin type="icon-jiashi" />
                                    }
                                </section>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Col>
        </Row>
    )
}



/**
 * 展示ups页面
 * @param param0 
 * @returns 
 */
export const TerminalDevUps: React.FC<result> = ({ mac, pid, result }) => {

    const { data: Constant } = usePromise(async () => {
        const mountDev = await getTerminalPidProtocol(mac, pid)
        const constant = await getProtocolSetup<Uart.DevConstant_Ups>(mountDev.data.protocol, 'Constant')
        return constant.data.sys as any as Uart.DevConstant_Ups
    })

    const ups = useMemo(() => {
        const stat: Record<keyof Uart.DevConstant_Ups, string | Uart.queryResultArgument[]> = {
            Switch: '',
            WorkMode: '',
            UpsStat: [],
            BettyStat: [],
            InputStat: [],
            OutStat: []

        }

        if (Constant && result.length > 0) {
            const rMap = new Map(result.map(el => [el.name, el]))
            stat.Switch = rMap.get(Constant.Switch)?.parseValue || ''
            stat.WorkMode = rMap.get(Constant.WorkMode)?.parseValue || ''
            stat.UpsStat = result.filter(el => Constant.UpsStat?.includes(el.name))
            stat.BettyStat = result.filter(el => Constant.BettyStat?.includes(el.name))
            stat.InputStat = result.filter(el => Constant.InputStat?.includes(el.name))
            stat.OutStat = result.filter(el => Constant.OutStat?.includes(el.name))
        }
        return stat
    }, [result, Constant])

    const workPic = useMemo<string>(() => {
        switch (ups.WorkMode) {
            case "在线模式":
                return devUpsStat[3]
            case "旁路模式":
                return devUpsStat[2]
            case "电池模式":
                return devUpsStat[1]
            default:
                return devUpsStat[0]
        }
    }, [ups.WorkMode])


    /**
     * 开关机
     * @param val 
     */
    const OnOff = (val: boolean) => {
        Modal.confirm({
            content: `确定${!val ? '关闭' : '打开'}UPS??`,
            onOk: () => {
                sendOprateInstruct(mac, pid, !val ? '关机' : '开机')
            }
        })
    }
    return (
        <Row gutter={24}>
            <Col span={24} md={12}>
                <div>
                    <span>{ups.WorkMode}</span>
                    {
                        ups.Switch && <Switch
                            style={{ marginLeft: 12 }}
                            checked={ups.Switch === '开机'}
                            checkedChildren={ups.Switch}
                            unCheckedChildren={ups.Switch}
                            onChange={OnOff}
                        ></Switch>
                    }
                </div>
                <Image src={workPic} preview={false} />
            </Col>
            <Col span={24} md={12}>
                <Tabs>
                    <Tabs.TabPane tab="ups状态" key="upsStat">
                        <Descriptions>
                            {
                                (ups.UpsStat as Uart.queryResultArgument[]).map(el =>
                                    <Descriptions.Item label={el.name} key={el.name}>
                                        {el.parseValue}
                                    </Descriptions.Item>)
                            }
                        </Descriptions>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="电池信息" key="betty">
                        <section className="upsTabStat">
                            {
                                (ups.BettyStat as Uart.queryResultArgument[]).map(el =>
                                    <div key={el.name}>
                                        <span>{el.name}</span>
                                        <Progress
                                            percent={Number(el.parseValue)}
                                            format={_ => el.parseValue + el.unit}
                                            key={el.name}
                                            size="small"
                                        >
                                        </Progress>
                                    </div>
                                )
                            }
                        </section>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="输入状态" key="input">
                        <section className="upsTabStat">
                            {
                                (ups.InputStat as Uart.queryResultArgument[]).map(el =>
                                    <div key={el.name}>
                                        <span>{el.name}</span>
                                        <Progress
                                            percent={Number(el.parseValue) * 100 / (Number(el.parseValue) < 300 ? ((Number(el.parseValue)) <= 100 ? 100 : 250) : 420)}
                                            format={_ => el.parseValue + el.unit}
                                            key={el.name}
                                            size="small"
                                        >
                                        </Progress>
                                    </div>
                                )
                            }
                        </section>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="输出状态" key="out">
                        <section className="upsTabStat">
                            {
                                (ups.OutStat as Uart.queryResultArgument[]).map(el =>
                                    <div key={el.name}>
                                        <span>{el.name}</span>
                                        <Progress
                                            percent={Number(el.parseValue) * 100 / (Number(el.parseValue) < 300 ? ((Number(el.parseValue)) <= 100 ? 100 : 250) : 420)}
                                            format={_ => el.parseValue + el.unit}
                                            size="small"
                                        >
                                        </Progress>
                                    </div>)
                            }
                        </section>

                    </Tabs.TabPane>
                </Tabs>
            </Col>
        </Row>
    )

}

/**
 * 设备数据状态页面
 * @param param0 
 * @returns 
 */
export const TerminalDevPage: React.FC<DevDataProps> = ({ mac, pid, user }) => {

    const nav = useNav()
    /**
     * 数据运行参数
     */
    const [result, setResult] = useState<Uart.queryResultArgument[]>([])

    /**
     * 设备运行数据 U result
     */
    const [data, setData] = useState<Uart.queryResultSave>()

    const { data: mountDev, loading } = usePromise(async () => {
        const { data } = await getTerminalPidProtocol(mac, pid)
        return data
    }, undefined, [mac, pid])

    const updateData = (results: Uart.queryResultArgument[], data?: Uart.queryResultSave) => {
        setResult([...results])
        setData(data)
    }

    const devType = useMemo(() => {
        return mountDev?.Type || ''
    }, [mountDev])

    return (
        <Space direction="vertical">
            {
                !devType && <Spin />
            }
            {
                devType === '温湿度' && <TerminalDevTH mac={mac} pid={pid} user={user} result={result} key="th" />
            }
            {
                devType === 'IO' && <TerminalDevIO mac={mac} pid={pid} user={user} result={result} key="io" />
            }
            {
                devType === '空调' && <TerminalDevAir mac={mac} pid={pid} user={user} result={result} key="air" />
            }
            {
                devType === 'UPS' && <TerminalDevUps mac={mac} pid={pid} user={user} result={result} key="ups" />
            }
            <div>
                <span style={{ float: "right" }}>
                    <TerminalOprate mac={mac} pid={pid} result={[]} />
                    <Button type='link' onClick={()=>nav("/main/constant",{mac, pid: String(pid)})}>告警配置</Button>
                </span>
            </div>

            <Row gutter={22}>
                <Col span={24} md={8}>
                    <TerminalRunData mac={mac} pid={pid} user={user} OnUpdate={updateData} />
                </Col>
                <Col span={24} md={16} xs={0}>
                    <TerminalRunDataThresoldLine mac={mac} pid={pid} time={data?.time}></TerminalRunDataThresoldLine>
                </Col>
            </Row>
        </Space>
    )
}


interface addMountDev {
    /**
     * 是否显示
     */
    visible: boolean
    /**
     * 
     */
    mac: string

    onCancel?: () => void;

    onChange?: () => void;
}

/**
 * 添加挂载设备
 * @returns 
 */
export const TerminalAddMountDev: React.FC<addMountDev> = ({ visible, mac, onCancel, onChange }) => {

    /**
         * 新的挂载
         */
    const [mountDev, setMountDev] = useState<Uart.TerminalMountDevs>({
        pid: 1,
        protocol: '',
        mountDev: '',
        Type: "UPS"
    })


    /**
     * 获取设备挂载下已使用的pids
     */
    const { data: mountDevPids } = usePromise(async () => {
        const { data } = await getTerminal(mac)
        return data.mountDevs ? data.mountDevs.map(el => el.pid) : []
    }, [])




    const pids = useMemo(() => {
        const ns: number[] = []
        const pidSet = new Set(mountDevPids)
        for (let index = 0; index < 255; index++) {
            if (!pidSet.has(index)) ns.push(index)
        }
        return ns
    }, [mountDevPids])

    const postMountDev = () => {
        if (mountDev.protocol) {
            Modal.confirm({
                content: `确认添加地址[${mountDev.pid}]设备[${mountDev.mountDev}/${mountDev.protocol}]?`,
                onOk: () => {
                    const key = mac + mountDev.pid
                    message.loading({ content: '正在添加', key })
                    addTerminalMountDev(mac, mountDev).then(result => {
                        if (result.code === 200) {
                            message.success({ content: '添加成功', key })
                            onCancel && onCancel()
                            onChange && onChange()
                        } else {
                            message.warn({ content: "添加失败:" + result.msg, key })
                        }
                    })
                }
            })
        }
    }

    return (
        <Modal title="添加设备" visible={visible} confirmLoading={!mountDev.protocol} onCancel={onCancel} onOk={postMountDev}>
            <Form>
                {<Form.Item label="设备协议">
                    <DevTypesCascader onChange={([Type, mountDe, protocol]) => {
                        setMountDev({ ...mountDev, Type: Type as string, protocol: protocol as string, mountDev: mountDe as string })
                    }}></DevTypesCascader>
                </Form.Item>}
                <Form.Item label="设备地址">
                    <Select defaultValue={mountDev.pid} onSelect={(pid: any) => setMountDev({ ...mountDev, pid })}>
                        {
                            pids.map(n => <Select.Option value={n} key={n}>{n}</Select.Option>)
                        }
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    )
}