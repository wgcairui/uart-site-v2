import React, { useMemo, useState } from "react";
import "./index.css"
import { Col, Row, Tabs, Space, Tooltip, Popconfirm, message, Button, Dropdown, Menu } from "antd"
import { useSelector } from "react-redux";
import { storeUser } from "../store/user";
import { State } from "../store";
import { devTypeIcon, IconFont } from "../components/IconFont";
import { CheckCircleFilled, WarningFilled, EyeFilled, EditFilled, DeleteFilled, DownOutlined } from "@ant-design/icons";
import { DevCard } from "../components/devCard";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import moment from "moment";
import { prompt } from "../common/prompt";
import { delUserTerminal, modifyTerminal } from "../common/Fetch";

type key = "dev" | "module" | "agg"
export const UserIndex: React.FC = (props) => {

    const [seachParms, setSearchParms] = useSearchParams()

    const nav = useNavigate()

    const { terminals } = useSelector<State, storeUser>(state => state.User)

    const [defalutKey, setDefalutKey] = useState<key>(() => seachParms.get('tab') as key || 'dev')

    const mountDevs = useMemo(() => {
        return terminals ? terminals.map(({ DevMac, name, online, mountDevs }) => mountDevs.map(el2 => ({ ...el2, mac: DevMac, macName: name, macOn: online }))).flat() : []
        // return [] 
    }, [terminals])

    /**
     * 重命名设备
     * @param ter 
     */
    const renameTerminal = (ter: Uart.Terminal) => {
        prompt({
            title: `修改设备${ter.DevMac}名称`,
            value: ter.name
        }).then(el => {
            const key = ter.DevMac
            message.loading({ content: "正在修改", key })
            modifyTerminal(ter.DevMac, el!).then(result => {
                if (result.code === 200) {
                    message.success({ content: '修改成功', key })
                } else {
                    message.warn({ content: "修改失败" + result.msg, key })
                }
            })
        }).catch(() => {
            message.error("取消修改")
        })
    }

    /**
     * 删除设备
     * @param ter 
     */
    const delTermianl = (ter: Uart.Terminal) => {
        const key = ter.DevMac
        message.loading({ content: "正在删除", key })
        delUserTerminal(ter.DevMac).then(result => {
            if (result.code === 200) {
                message.success({ content: '删除成功', key })
            } else {
                message.warn({ content: "删除失败:" + result.msg, key })
            }
        })

    }

    /**
     * 切换tab
     * @param key 
     */
    const switchTab = (key: key) => {
        setDefalutKey(key)
        setSearchParms({ tab: key })
    }

    return (
        <>

            <Row>
                <Col span={24} lg={18}>
                    <Tabs activeKey={defalutKey} onTabClick={(key: any) => switchTab(key)}>
                        <Tabs.TabPane tab={<span><IconFont type="icon-shebeizhuangtai" /> 我的设备</span>} key="dev">
                            <Row>
                                {
                                    mountDevs.map(el => {
                                        return (
                                            <Col span={24} md={12} lg={8} xl={6} xxl={4} key={el.mac + el.pid}>
                                                <DevCard
                                                    img={`http://admin.ladishb.com/upload/${el.Type}.png`}
                                                    title={<Space>
                                                        <Tooltip title={el.online ? '在线' : '离线'}>
                                                            {el.online ? <CheckCircleFilled style={{ color: "#67C23A" }} /> : <WarningFilled style={{ color: "#E6A23C" }} />}
                                                        </Tooltip>
                                                        {el.mountDev}
                                                    </Space>}
                                                    avatar={devTypeIcon[el.Type]}
                                                    subtitle={el.macName + '-' + el.pid}
                                                    onClick={() => nav("/main/dev/" + el.mac + el.pid)}
                                                ></DevCard>
                                            </Col>

                                        )
                                    })
                                }
                                <Col span={24} md={12} lg={8} xl={6} xxl={4} key='addDev' className="center">
                                    {/* <Button shape="round" type="primary" onClick={() => setDefalutKey("module")}>添加设备</Button> */}
                                    <Dropdown overlay={
                                        <Menu>
                                            <Menu.Item>
                                                <Link to="/addterminal">透传网关/百事服卡</Link>
                                            </Menu.Item>
                                            <Menu.Item>
                                                <Link to="/?tab=module" onClick={() => setDefalutKey("module")}>设备</Link>
                                            </Menu.Item>
                                        </Menu>
                                    }>
                                        <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                                            添加设备<DownOutlined />
                                        </a>
                                    </Dropdown>
                                </Col>
                            </Row>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab={<span><IconFont type="icon-jichuguanli" /> 我的网关</span>} key="module">
                            <Row>
                                {
                                    terminals.map(el => {
                                        return (
                                            <Col span={24} md={12} lg={8} xl={6} xxl={4} key={el.DevMac}>
                                                <DevCard
                                                    img={`http://admin.ladishb.com/upload/${el.PID}.png`}
                                                    title={<Space>
                                                        <Tooltip title={el.online ? '在线' : '离线'}>
                                                            {el.online ? <CheckCircleFilled style={{ color: "#67C23A" }} /> : <WarningFilled style={{ color: "#E6A23C" }} />}
                                                        </Tooltip>
                                                        {el.name}
                                                    </Space>}
                                                    subtitle={moment(el.uptime).format("YY/M/D H:m:s")}
                                                    actions={[
                                                        <Tooltip title="编辑查看">
                                                            <EyeFilled style={{ color: "#67C23B" }} onClick={() => nav("/main/terminal/" + el.DevMac)} />
                                                        </Tooltip>,
                                                        <Tooltip title="重命名">
                                                            <EditFilled style={{ color: "#409EFF" }} onClick={() => renameTerminal(el)} />
                                                        </Tooltip>,
                                                        <Tooltip title="删除" >
                                                            <Popconfirm
                                                                title={`确认删除设备[${el.name}]?`}
                                                                onConfirm={() => delTermianl(el)}
                                                                onCancel={() => message.info('cancel')}
                                                            >
                                                                <DeleteFilled style={{ color: "#E6A23B" }} />
                                                            </Popconfirm>
                                                        </Tooltip>
                                                    ]}
                                                ></DevCard>
                                            </Col>

                                        )
                                    })
                                }
                                <Col span={24} md={12} lg={8} xl={6} xxl={4} key="addModule" className="center">
                                    <Button shape="round" type="primary" size="large" href="/addterminal">添加网关</Button>
                                </Col>
                            </Row>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab={<span><IconFont type="icon-changjingguanli" />聚合设备</span>} key="agg">
                            <Row></Row>
                        </Tabs.TabPane>
                    </Tabs>
                </Col>
                <Col span={24} lg={6}>

                </Col>
            </Row>
        </>
    )
}