import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Dropdown, Layout, Menu, Avatar, Image } from "antd";
import { storeUser } from "../store/user"
import "./Main.css"
import { State } from "../store";
import { devTypeIcon, IconFont } from "./IconFont";
import { Link, useNavigate } from "react-router-dom";
import { universalProps } from "../typing";

/**
 * 用户侧通用页面
 * @param props 
 * @returns 
 */
export const Main: React.FC<universalProps> = (props) => {

    const nav = useNavigate()

    const { user, terminals } = useSelector<State, storeUser>(state => state.User)

    const uts = useMemo(() => {
        return terminals
            .map(el => (el.mountDevs || []).map(el2 => ({ ...el2, online: el.online, mac: el.DevMac, name: el.name }))).flat()
    }, [terminals])

    const exit = () => {
        localStorage.removeItem("token")
        nav("/login")
    }

    const menu = (
        <Menu>
            <Menu.Item key="userInfo" onClick={()=>nav("/user")}>用户信息</Menu.Item>
            <Menu.Item key="logout" onClick={() => exit()}>退出</Menu.Item>
        </Menu>
    )
    return (
        <main className="user-main">
            <Layout className="user-main">
                <Layout.Header className="user-header">
                    <Link to="/">
                        <Image src="http://admin.ladishb.com/upload/LADS_witdh.png" preview={false} height={20}></Image>
                    </Link>
                    <div className="user-header-menu">
                        <Menu theme="dark" mode="horizontal">
                            <Menu.SubMenu title="所有设备" key="1" icon={<IconFont type="icon-changjingguanli" />}>
                                {
                                    uts.map((el, key) => {
                                        return <Menu.Item key={'1-' + key} icon={devTypeIcon[el.Type]}>
                                            <Link to={"/dev/" + el.mac + el.pid /*new URLSearchParams({ id: el.mac + el.pid }).toString() */}>{`${el.name}-${el.mountDev}-${el.pid}`}</Link>
                                        </Menu.Item>
                                    })
                                }
                            </Menu.SubMenu>
                            <Menu.Item key="2" icon={<IconFont type="icon-tixingshixin" />} onClick={() => nav("/alarm")}>告警管理</Menu.Item>
                           {/*  <Menu.Item key="3" icon={<IconFont type="icon-zuzhiqunzu" />} onClick={() => nav("/devmanage")}>设备管理</Menu.Item> */}
                            <Menu.SubMenu key="4" title="languga" icon={<IconFont type="icon-zuzhiqunzu" />}>
                                <Menu.Item key="4-1">中文</Menu.Item>
                                <Menu.Item key="4-2">EN</Menu.Item>
                            </Menu.SubMenu>
                        </Menu>
                        <Dropdown overlay={menu}><Avatar src={user.avanter} size="large"></Avatar>
                        </Dropdown>
                    </div>
                </Layout.Header>
                <Layout.Content style={{ padding: 9, height: "100%", backgroundColor: "#ffffff" }}>
                    {
                        props.children
                    }
                </Layout.Content>
            </Layout>

        </main>
    )
}