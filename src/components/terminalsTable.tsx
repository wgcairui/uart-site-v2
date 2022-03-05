import { CheckCircleFilled, WarningFilled, EyeFilled, DeleteFilled, LoadingOutlined, ReloadOutlined, MoreOutlined, SyncOutlined, DownOutlined } from "@ant-design/icons";
import { Table, Tooltip, Button, Card, Descriptions, Tag, Divider, Row, Col, Space, Popconfirm, message, TableProps, Modal, Spin, Dropdown, Menu, notification, ColProps } from "antd";
import { ColumnsType } from "antd/lib/table";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { devType } from "../common/devImgSource";
import { BindDev, deleteRegisterTerminal, delUserTerminal, getNodeInstructQueryMac, getTerminals, getTerminalUser, initTerminal, IotQueryCardFlowInfo, IotQueryCardInfo, IotQueryIotCardOfferDtl, iotRemoteUrl, modifyTerminalRemark } from "../common/FecthRoot";
import { delTerminalMountDev, getTerminal, modifyTerminal, refreshDevTimeOut } from "../common/Fetch";
import { prompt } from "../common/prompt";
import { generateTableKey, getColumnSearchProp, tableColumnsFilter } from "../common/tableCommon";
import { CopyClipboard } from "../common/util";
import { useNav } from "../hook/useNav";
import { usePromise } from "../hook/usePromise";
import { useTerminalUpdate } from "../hook/useTerminalData";
import { DevCard } from "./devCard";
import { DevPosition } from "./devPosition";
import { IconFont, devTypeIcon } from "./IconFont";
import { MyCopy } from "./myCopy";
import { MyInput } from "./myInput";
import { TerminalAddMountDev } from "./TerminalDev";



/**
 * 显示设备查询间隔
 * @param param0 
 * @returns 
 */
const InterValToop: React.FC<{ mac: string, pid: number, show: boolean }> = ({ mac, pid, show }) => {
    const { data: Interval, loading, fecth } = usePromise(async () => {
        const { data } = await getNodeInstructQueryMac(mac, pid)
        return data
    }, 0, [mac, pid])


    useEffect(() => {
        const i = setInterval(() => {
            show && fecth()
        }, 3e4)
        return () => clearInterval(i)
    }, [show])

    /**
     * 刷新设备查询间隔
     * @param mac 
     * @param pid 
     */
    const refreshInterval = () => {
        prompt({
            title: '设置设备查询间隔',
            placeholder: '输入间隔毫秒数,(值为x500的倍数),未设置则为默认值',
            onOk(val) {
                const n = Number(val)
                if (val && !Number.isNaN(n)) {
                    if (n < 500) {
                        val = undefined
                    } else if (n % 500 > 0) {
                        val = String(n - n % 500)
                    }
                }
                refreshDevTimeOut(mac, pid, Number(val)).then(() => {
                    message.success("重置完成,等待数据刷新")
                })
                return true
            }
        })
    }


    return (
        loading ? <LoadingOutlined /> :
            <Tooltip title="查询间隔">
                <Dropdown overlay={<Menu>
                    <Menu.Item onClick={() => fecth()} key="refresh">刷新</Menu.Item>
                    <Menu.Item danger onClick={() => refreshInterval()} key="reset">重置</Menu.Item>
                </Menu>}>
                    <a>{Interval / 1000}秒<DownOutlined /></a>
                </Dropdown>
            </Tooltip>
    )
}


interface infoProps {
    /**
     * 设备数据
     */
    terminal: Uart.Terminal & { user?: string }
    /**
     * 是否一直展开
     */
    ex: boolean
    /**
     * 是否显示标题
     */
    showTitle?: boolean

    /**
     * 是否显示查询间隔
     */
    InterValShow?: boolean

    /**
     * 
     */
    col?: ColProps

    onChange?: (item?: Uart.Terminal) => void
}

/**
 * 列出设备下挂载的子设备
 * @param param0 
 * @returns 
 */
export const TerminalMountDevs: React.FC<infoProps> = (props) => {

    const nav = useNavigate()

    const { terminal, ex, showTitle } = { showTitle: true, ...props, }


    const [visible, setVisible] = useState(false)

    /**
     * 删除挂载设备
     * @param mac 
     * @param pid 
     */
    const delMountDev = (mac: string, pid: number) => {
        Modal.confirm({
            content: `确认删除挂载设备:${mac}/${pid} ?`,
            onOk() {
                const key = 'delTerminalMountDev' + mac + pid
                message.loading({ key })
                delTerminalMountDev(mac, pid)
                    .then(() => {
                        message.success({ content: '删除成功', key })
                        props.onChange && props.onChange(terminal)
                    })
            }
        })
    }

    return (
        <Row>
            {
                terminal?.mountDevs && terminal.mountDevs.map(el =>
                    <Col span={24} md={8} {...props.col} key={terminal.DevMac + el.pid}>
                        <DevCard
                            img={devType[el.Type]}
                            title={<Space>
                                <Tooltip title={el.online ? '在线' : '离线'}>
                                    {el.online ? <CheckCircleFilled style={{ color: "#67C23A" }} /> : <WarningFilled style={{ color: "#E6A23C" }} />}
                                </Tooltip>
                                {el.mountDev}
                            </Space>}
                            avatar={devTypeIcon[el.Type]}
                            subtitle={terminal.DevMac + '-' + el.pid}
                            actions={[
                                <Tooltip title="编辑查看">
                                    <EyeFilled style={{ color: "#67C23B" }} onClick={() => nav("/dev/" + terminal.DevMac + el.pid)} />
                                </Tooltip>,

                                <Tooltip title="删除" >
                                    <Popconfirm
                                        title={`确认删除设备[${el.mountDev}]?`}
                                        onConfirm={() => delMountDev(terminal.DevMac, el.pid)}
                                        onCancel={() => message.info('cancel')}
                                    >
                                        <DeleteFilled style={{ color: "#E6A23B" }} />
                                    </Popconfirm>
                                </Tooltip>,
                                props.InterValShow && <InterValToop mac={terminal.DevMac} pid={el.pid} show={ex} />
                            ]}></DevCard>
                    </Col>
                )
            }
            <Col>
                <Button onClick={() => setVisible(true)} shape="round" type="primary">添加设备</Button>
                <TerminalAddMountDev mac={terminal.DevMac} visible={visible} onCancel={() => setVisible(false)} onChange={props.onChange} />
            </Col>
        </Row>
    )
}


/**
 * 显示mac绑定用户
 * @param param0 
 * @returns 
 */
const TerminalUser: React.FC<{ mac: string }> = ({ mac }) => {

    const nav = useNav()

    const { data, loading } = usePromise(async () => {
        const { data } = await getTerminalUser(mac)
        return data
    })
    return (
        loading ? <Spin /> : <Button type="link" onClick={() => nav("/root/node/user/userInfo", { user: data })}>
            <MyCopy value={data}></MyCopy>
        </Button>
    )
}


/**
 * 展示设备信息
 * @param param0 
 * @returns 
 */
export const TerminalInfo: React.FC<infoProps> = (props) => {

    const { terminal } = props

    /**
     * 更新别名
     * @param mac 
     * @param name 
     */
    const rename = (name?: string) => {
        const mac = terminal.DevMac

        console.log(name, mac);

        if (name) {
            modifyTerminal(mac, name).then(el => {
                if (el.code) {
                    message.success('更新成功')
                }
                else message.error("更新失败")
            })
        } else {
            message.error("名称不能为空")
        }
    }


    /**
     * 更新设备备注
     * @param mac 
     * @param remark 
     */
    const remark = (remark: string) => {
        const mac = terminal.DevMac
        modifyTerminalRemark(mac, remark).then(el => {
            if (el.code) {
                message.success('更新成功')
            }
            else message.error("更新失败")
        })
    }




    return (
        <Card>
            <Descriptions title={terminal.name}>
                <Descriptions.Item label="别名">
                    <MyInput value={terminal.name} onSave={rename}></MyInput>
                </Descriptions.Item>
                <Descriptions.Item label="用户">
                    <TerminalUser mac={terminal.DevMac} />
                </Descriptions.Item>
                <Descriptions.Item label="mac">{terminal.DevMac}</Descriptions.Item>
                <Descriptions.Item label="AT支持">
                    <Tag color="cyan">{terminal.AT ? '支持' : '不支持'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="ICCID">{terminal.ICCID}</Descriptions.Item>
                <Descriptions.Item label="PID">{terminal.PID}</Descriptions.Item>
                <Descriptions.Item label="设备IP">{terminal.ip}</Descriptions.Item>
                <Descriptions.Item label="设备定位">{terminal.jw}</Descriptions.Item>
                <Descriptions.Item label="挂载节点">{terminal.mountNode}</Descriptions.Item>
                <Descriptions.Item label="TCP端口">{terminal.port}</Descriptions.Item>
                <Descriptions.Item label="串口参数">{terminal.uart}</Descriptions.Item>
                <Descriptions.Item label="iot">{terminal.iotStat}</Descriptions.Item>
                <Descriptions.Item label="Gver">{terminal.Gver}</Descriptions.Item>
                <Descriptions.Item label="ver">{terminal.ver}</Descriptions.Item>
                <Descriptions.Item label="共享状态">{terminal.share ? '开启' : '关闭'}</Descriptions.Item>
                <Descriptions.Item label="更新时间" span={3}>{moment(terminal.uptime).format('YYYY-MM-DD H:m:s')}</Descriptions.Item>
                <Descriptions.Item label="备注" span={3}>
                    <MyInput
                        textArea
                        value={terminal.remark}
                        onSave={remark}
                    ></MyInput>
                </Descriptions.Item>
            </Descriptions>
            {
                terminal.iccidInfo &&
                <>
                    <Divider orientation="left" plain>SIM卡</Divider>
                    <Descriptions>
                        <Descriptions.Item label="物联卡版本">{terminal.iccidInfo?.version || 'ali_1'}</Descriptions.Item>
                        {/* <Descriptions.Item label="起始时间">{terminal.iccidInfo.validDate}</Descriptions.Item> */}
                        <Descriptions.Item label="套餐名称">{terminal.iccidInfo.resName}</Descriptions.Item>
                        <Descriptions.Item label="终止时间">{terminal.iccidInfo.expireDate}/ 
                            {
                                moment(terminal.iccidInfo.expireDate).diff(new Date(), 'day')
                            }天
                        </Descriptions.Item>
                        <Descriptions.Item label="全部流量">{terminal.iccidInfo.flowResource / 1024}MB</Descriptions.Item>
                        <Descriptions.Item label="使用流量" >{(terminal.iccidInfo.flowUsed / 1024).toFixed(0)}MB</Descriptions.Item>
                        <Descriptions.Item label="使用比例" >{((terminal.iccidInfo.flowUsed / terminal.iccidInfo.flowResource) * 100).toFixed(0)}%</Descriptions.Item>
                    </Descriptions>
                </>
            }


        </Card>
    )
}


interface props {
    title?: string
    /**
     * 如果有用户信息,就检索用户所属mac
     */
    user?: string
    /**
     * 数据下载完成
     */
    readyData?: (data: Uart.Terminal[]) => void
}

/**
 * 格式化表格显示设备
 * @param props 
 * @returns 
 */
export const TerminalsTable: React.FC<Omit<TableProps<Uart.Terminal>, 'dataSource'> & props> = props => {

    const nav = useNav()

    const { data: terminals, loading, fecth, setData } = usePromise<(Uart.Terminal)[]>(async () => {
        return props.user ? await BindDev(props.user).then(el => el.data.UTs as any) : await getTerminals().then(el => el.data)
    }, [])

    useEffect(() => {
        if (props.readyData) props.readyData(terminals)
    }, [terminals])

    /**
     * 监听设备状态变更,有变更则更新列表
     */
    useTerminalUpdate(terminals.map(el => el.DevMac), setData, t => {
        notification.open({
            message: `设备状态变更`,
            description: `设备${t.name}状态:${t.online ? '在线' : '离线'}`,
            onClick: () => {
                CopyClipboard(t.DevMac)
                message.success(`已复制mac:${t.DevMac}到粘贴板`)
            }
        })
    }
    )

    /* useEffect(() => {
        if (MacUpdate.data) {
            const ter = MacUpdate.data
            const i = terminals.findIndex(el => el.DevMac === ter.DevMac)
            if (terminals[i].user) (ter as any).user = terminals[i].user
            terminals.splice(i, 1, ter as any)
            setData([...terminals])
        }
    }, [MacUpdate.data]) */


    /**
     * 更新设备信息
     */
    /* const updateDev = async (mac: string) => {
        const loading = message.loading({ content: 'loading' })
        const i = terminals.findIndex(el => el.DevMac === mac)
        const { data } = await getTerminal(mac)
        if (terminals[i].user) (data as any).user = terminals[i].user
        terminals.splice(i, 1, data as any)
        setData([...terminals])
        loading()
    } */

    const itoRemoteUrl = (mac: string) => {
        iotRemoteUrl(mac).then(el => {
            if (el.code) {
                if (/remote_code=$/.test(el.data)) {
                    message.error('远程调试地址获取失败,请确认设备是否联网和iot设置是否打开')
                } else
                    window.open(el.data, "_blank");
            }
        })
    }

    const deleteRegisterTerminalm = (DevMac: string) => {
        Modal.confirm({
            content: `是否确定删除DTU:${DevMac} ??`,
            onOk: async () => {
                const key = 'deleteRegisterTerminalm'
                message.loading({ key })
                const { code, data } = await deleteRegisterTerminal(DevMac)

                if (code) {
                    message.success({ content: '删除成功', key })
                    const index = terminals.findIndex(el => el.DevMac === DevMac)
                    terminals.splice(index, 1)
                    setData([...terminals])
                } else {
                    message.error({ content: `用户:${data} 已绑定设备`, key, duration: 3 })
                }
            }
        })
    }

    /**
     * 初始化设备
     */
    const initTerminalm = (DevMac: string) => {
        Modal.confirm({
            content: `是否确定初始化DTU:${DevMac} ??`,
            onOk: async () => {
                const key = 'initTerminalm'
                const { code, data, msg } = await initTerminal(DevMac)
                if (code) {
                    message.success({ content: `删除成功,耗时${data}ms`, key })
                } else {
                    message.error({ content: msg, key })
                }
            }
        })
    }

    /**
     * 更新单个设备iccid信息
     * @param iccid 
     */
    const iccdInfo = async (iccid: string, mac: string) => {
        const key = 'iccdInfo' + Math.random()
        message.loading({ key })
        await IotQueryCardInfo(iccid)
        await IotQueryCardFlowInfo(iccid)
        await IotQueryIotCardOfferDtl(iccid)
        setTimeout(() => {
            message.info({ content: 'ok', key })
        }, 5000);
    }


    /**
     * 解绑用户设备
     * @param mac 
     * @param user 
     */
    const unbindDev = (mac: string, user?: string) => {
        if (user) {
            Modal.confirm({
                content: `是否删除用户[${user}]绑定设备{${mac}}?`,
                onOk() {
                    delUserTerminal(user, mac).then((el) => {
                        message.success("解绑成功");
                        fecth()
                    });
                }
            })
        }
    }

    return (
        <>
            <Space style={{ marginBottom: 16 }}>
                <Button type="primary" size="small" onClick={() => fecth()} icon={<SyncOutlined />}>更新信息</Button>
            </Space>
            <Table
                loading={loading}
                dataSource={generateTableKey(terminals, "DevMac")}
                size="small"
                scroll={{ x: 1000 }}
                columns={[
                    {
                        dataIndex: 'online',
                        title: '状态',
                        width: 70,
                        filters: [
                            {
                                text: '在线',
                                value: true
                            },
                            {
                                text: '离线',
                                value: false
                            }
                        ],
                        onFilter: (val, re) => re.online === val,
                        defaultSortOrder: "descend",
                        sorter: (a: any, b: any) => a.online - b.online,
                        render: (val) => <Tooltip title={val ? '在线' : '离线'}>
                            <IconFont
                                type={val ? 'icon-zaixianditu' : 'icon-lixian'}
                                style={{ fontSize: 22 }}
                            />
                        </Tooltip>
                    },
                    {
                        dataIndex: 'name',
                        title: '名称',
                        ellipsis: true,
                        width: 180,
                        ...getColumnSearchProp<Uart.Terminal>('name')
                    },
                    {
                        dataIndex: 'DevMac',
                        title: 'mac',
                        width: 140,
                        ...getColumnSearchProp<Uart.Terminal>('DevMac'),
                        render: val => <MyCopy value={val}></MyCopy>
                    },
                    {
                        dataIndex: 'user',
                        title: '用户',
                        width: 140,
                        ellipsis: true,
                        ...getColumnSearchProp<any>('user')
                    },
                    {
                        dataIndex: 'ICCID',
                        title: 'ICCID',
                        ellipsis: true,
                        width: 120,
                        ...getColumnSearchProp<Uart.Terminal>("ICCID"),
                        render: val => val && <MyCopy value={val}></MyCopy>
                    },
                    {
                        dataIndex: 'mountNode',
                        title: '节点',
                        width: 80,
                        ...tableColumnsFilter(terminals, 'mountNode')
                    },
                    {
                        dataIndex: 'PID',
                        title: '型号',
                        width: 80,
                        ...tableColumnsFilter(terminals, 'PID')
                    },
                    {
                        title: '挂载设备',
                        dataIndex: 'mountDevs',
                        width: 180,
                        filters: [...new Set(terminals.filter(el => el.mountDevs).map(el => el.mountDevs.map(e => e.mountDev)).flat())].map(value => ({ value, text: value })),
                        onFilter: (val: any, re: Uart.Terminal) => re.mountDevs && re.mountDevs.some(el => el.mountDev === val),
                        render: (val: Uart.TerminalMountDevs[]) => <>
                            {
                                val && val.map(el => <Tag color={el.online ? 'green' : 'warning'} key={el.pid}>{el.mountDev}</Tag>)
                            }
                        </>


                    },
                    {
                        dataIndex: 'uptime',
                        title: '更新时间',
                        width: 165,
                        render: val => moment(val || "1970-01-01").format("YYYY-MM-DD H:m:s"),
                        sorter: {
                            compare: (a: any, b: any) => new Date(a.uptime).getDate() - new Date(b.uptime).getDate()
                        }
                    },

                    {
                        key: 'oprate',
                        title: '操作',
                        width: 120,
                        render: (_, t) => <Space size={0} wrap>
                            <Button type="link" onClick={() => nav('/root/node/Terminal/info?mac=' + t.DevMac)}>查看</Button>
                            {/* <Button type="link" onClick={() => updateDev(t.DevMac)}>更新</Button> */}
                            <Dropdown overlay={
                                <Menu>
                                    <Menu.Item onClick={() => itoRemoteUrl(t.DevMac)} key={1}>远程配置</Menu.Item>
                                    <Menu.Item onClick={() => deleteRegisterTerminalm(t.DevMac)} key={2}>delete</Menu.Item>
                                    <Menu.Item onClick={() => initTerminalm(t.DevMac)} key={3}>初始化</Menu.Item>
                                    {t.ICCID && <Menu.Item onClick={() => iccdInfo(t.ICCID!, t.DevMac)} key={4}>ICCID更新</Menu.Item>}
                                    {
                                        props.user && <Menu.Item onClick={() => unbindDev(t.DevMac, props.user)} key={5}>解绑设备</Menu.Item>
                                    }
                                </Menu>
                            }>
                                <MoreOutlined />
                            </Dropdown>
                        </Space>
                    }
                ] as ColumnsType<Uart.Terminal>}

                expandable={{
                    expandedRowRender: (re, _, __, ex) => <>
                        <TerminalInfo terminal={re} ex={ex} />
                        <TerminalMountDevs terminal={re} ex={ex} showTitle={false} InterValShow onChange={fecth}></TerminalMountDevs>

                       {/*  <TerminalMountDevs terminal={re} ex={ex}></TerminalMountDevs> */}
                        <DevPosition terminal={re} />
                    </>,
                    fixed: "left"
                }}
            >
            </Table>
        </>
    )
}