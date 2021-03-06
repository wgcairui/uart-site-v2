import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Layout, Menu } from "antd";
import "./UserMain.css"
import { Link, Outlet } from "react-router-dom";
import { universalProps } from "../typing";
import { setTerminals } from "../store/user";
import { IconFont, devTypeIcon } from "../components/IconFont";
import { BindDev } from "../common/Fetch";
import { useNav } from "../hook/useNav";
import { subscribeEvent, unSubscribeEvent } from "../common/socket";
import { UserDropDown } from "../components/userDropDown";
import { useToken } from "../hook/useToken";
import { AbsButton } from "../components/absButton";
import moment from "moment";

/**
 * 用户侧通用页面
 * @param props 
 * @returns 
 */
const Main: React.FC<universalProps> = (props) => {

    const nav = useNav()

    const Dispatch = useDispatch()

    const [terminals, setTer] = useState<Uart.Terminal[]>([])

    /**
     * 获取绑定设备
     * @returns 
     */
    const getBind = async (log?: string) => {
        console.log({ date: moment().format('H:m:s:sss'), log });

        const { data } = await BindDev()
        const uts = data.UTs as any as Uart.Terminal[]
        setTer([...uts])
    }

    useToken()

    useEffect(() => {
        getBind()
    }, [])

    useEffect(() => {
        Dispatch(setTerminals(terminals))
    }, [terminals])


    /**
     * 监听绑定设备变更
     */
    useEffect(() => {
        const lists: { event: string, pid: number }[] = []

        terminals.forEach(el => {
            const event = "MacUpdate" + el.DevMac
            const pid = subscribeEvent(event, () => getBind(`获取设备更新推送:${el.DevMac}`))
            lists.push({ event, pid })
        })
        return () => {
            lists.forEach(({ event, pid }) => {
                unSubscribeEvent(event, pid)
            })
        }
    }, [terminals])

    const uts = useMemo(() => {
        return terminals
            .map(el => (el.mountDevs || []).map(el2 => ({ ...el2, online: el.online, mac: el.DevMac, name: el.name }))).flat()
    }, [terminals])


    const menu = useMemo(() => {
        return <>
            <Menu.SubMenu title="所有设备" key="1" icon={<IconFont type="icon-changjingguanli" />}>
                {
                    uts.map((el, key) => {
                        return <Menu.Item key={'1-' + key} icon={devTypeIcon[el.Type]}>
                            <Link to={"/main/dev/" + el.mac + el.pid}>{`${el.name}-${el.mountDev}-${el.pid}`}</Link>
                        </Menu.Item>
                    })
                }
            </Menu.SubMenu>
            <Menu.Item key="2" icon={<IconFont type="icon-tixingshixin" />} onClick={() => nav("/main/alarm")}>告警管理</Menu.Item>
            <Menu.SubMenu key="4" title="languga" icon={<IconFont type="icon-zuzhiqunzu" />}>
                <Menu.Item key="4-1">中文</Menu.Item>
                <Menu.Item key="4-2">EN</Menu.Item>
            </Menu.SubMenu>
            {
                <>
                    <Menu.Item onClick={() => nav('/main/user')} key="info">
                        用户信息
                    </Menu.Item>
                </>
            }
        </>
    }, [uts])

    return (
        <main className="user-main">
            <Layout className="user-main">
                <Layout.Header className="user-header">
                    <Link to="/main">
                        {/* <Image src="http://admin.ladishb.com/upload/LADS_witdh.png" preview={false} height={20}></Image> */}
                        <span style={{ fontSize: 36, color: "#3a8ee6", fontFamily: "cursive" }}>百事服</span>
                    </Link>
                    <div className="user-header-menu">
                        <Menu theme="dark" mode="horizontal" className="menu-phone">
                            {
                                menu
                            }
                        </Menu>
                        <UserDropDown userPage="/main/user"></UserDropDown>
                    </div>
                </Layout.Header>
                <Layout.Content style={{ padding: 9, height: "100%", backgroundColor: "#ffffff", position: "relative" }}>
                    <Outlet />
                    <AbsButton>
                        <Menu mode="inline" openKeys={["1", "4"]}>
                            {
                                menu
                            }
                        </Menu>
                    </AbsButton>
                </Layout.Content>
            </Layout>

        </main>
    )
}

export default Main