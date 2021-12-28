import React, { useEffect, useState } from "react";
import { AES } from "crypto-js";
import { Layout, Image, Menu, Dropdown, Row, Col, Card, Tabs, Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined, WechatFilled } from "@ant-design/icons"
import "./login.css"
import { IconFont } from "./components/IconFont";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Get, Post, wxlogin } from "./common/Fetch";
import { universalResult } from "./typing";

const menu = (
    <Menu>
        <Menu.Item icon={<IconFont type="icon-zhongwen" />} key="cn">中文</Menu.Item>
        <Menu.Item icon={<IconFont type="icon-yingwen" />} key='en'>En</Menu.Item>
    </Menu>
)

export const Login: React.FC = () => {

    const navi = useNavigate()

    /**
     * tab index
     */
    const [tabdefaultActiveKey, setTabDefaultActiveKey] = useState<"wx_qr" | "login">("wx_qr")

    /**
     * 是否禁用微信登录
     */
    const [qrDisabled, setQrDisabled] = useState(false)

    const [loginLoading, setLoginLoading] = useState(false)

    /**
     * 判断用户屏幕尺寸,如果是小尺寸屏幕,禁用微信登录
     * 否则加载微信登录qr
     */
    useEffect(() => {
        if (window.innerWidth < 476) {
            setTabDefaultActiveKey("login")
        }
        const script = document.createElement("script")
        script.src = 'https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js'
        script.async = false
        document.body.append(script)
        script.onload = () => {
            // 马上执行是找不到wx对象的,需要异步到下一次循环
            setTimeout(() => {
                (window as any).WxLogin({
                    // self_redirect: true,
                    id: "wxlogin",
                    appid: "wx2afee5b1777448cf",
                    scope: "snsapi_login",
                    redirect_uri: encodeURI("https://uart.ladishb.com/loginwx"),
                    state: "e0bwU6jnO2KfIuTgBQNDVxlsy7iGtoF3A8rWpSCM5RzZ1dmYJcLHqPhXav4Ek9lIC6P4cULfktXj5Wcwa3GcCBCYRMWidUzZyJyTqu",
                    href: "https://uart.ladishb.com/css/openwx.css",
                });
            }, 0);
        }


    }, [])

    /**
     * 提交登录
     * @param values 
     */
    const onFinish = async ({ username, password }: { username: string, password: string }) => {
        setLoginLoading(true)
        // 获取hash加密密码
        const { hash } = await Get<universalResult<{ hash?: string }>>('/api/auth/hash', { user: username }).catch(() => message.error("hash获取出错"))

        if (hash) {
            const { code, msg, token } = await Post<universalResult<{ token: string }>>('/api/auth/login', { user: username, passwd: AES.encrypt(password, hash).toString() })
            if (code === 200) {
                localStorage.setItem('token', 'bearer%20' + token)
                const { userGroup } = await Get<universalResult<{ userGroup: string }>>("/api/auth/userGroup")
                navi(userGroup === 'user' ? '/' : '/root')
            } else {
                let m = ''
                switch (msg) {
                    case "userNan":
                        m = "用户名错误"
                        break;
                    case "passwd Error":
                        m = "用户密码错误"
                        break;
                    case "user null":
                        m = "未知用户"
                        break
                    default:
                        console.log({ code, msg, token });
                        m = "登录遇到未知错误"
                        break
                }
                message.error(m)
                setLoginLoading(false)
            }

        } else {
            message.error("hash空")
            setLoginLoading(false)
        }

    };


    return (
        <Layout className="layout">
            <Layout.Header color="#000" className="header">
                <Image src="https://www.ladishb.com/logo.png" preview={false}></Image>
                <Dropdown overlay={menu} className="header-drop">
                    <a href="" onClick={e => e.preventDefault()}>lauguage</a>
                </Dropdown>
            </Layout.Header>
            <Layout.Content className="content">
                <Row className="content-row">
                    <Col span={24} md={12}>
                        <div className="content-row-col1">
                            <h3>物联网ITO监控服务平台</h3>
                            <h4>适用于数据中心,微模块机房,单体UPS,空调等设备监控</h4>
                            <div>
                                <Image height={288} width={288} src="https://www.ladishb.com/upload/3312021__LADS_Uart.5df2cc6.png" />
                            </div>
                            <h5>LADS透传平台小程序</h5>
                        </div>
                    </Col>
                    <Col span={24} md={12} className="content-row-col2">
                        <Card className="card-login">
                            <Tabs defaultActiveKey={tabdefaultActiveKey}>
                                <Tabs.TabPane tab={<span><WechatFilled />微信登录</span>} key="wx_qr" disabled={qrDisabled}>
                                    <div id="wxlogin" className="hidden-sm-and-down" style={{ height: 286 }}></div>
                                </Tabs.TabPane>
                                <Tabs.TabPane tab={<span><UserOutlined />账号登录</span>} key="login" className="">
                                    <Form
                                        name="normal_login"
                                        className="login-form"
                                        initialValues={{ remember: true }}
                                        onFinish={onFinish}
                                    >
                                        <Form.Item
                                            name="username"
                                            rules={[{ required: true, message: '输入云平台账号或百事服账号!' }]}
                                        >
                                            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="输入你的账号" />
                                        </Form.Item>
                                        <Form.Item
                                            name="password"
                                            rules={[{ required: true, message: '输入密码,密码不能为空!' }]}
                                        >
                                            <Input
                                                prefix={<LockOutlined className="site-form-item-icon" />}
                                                type="password"
                                                placeholder="输入密码"
                                            />
                                        </Form.Item>
                                        <Form.Item>
                                            <Link to="/" className="login-form-forgot">忘记密码</Link>
                                        </Form.Item>

                                        <Form.Item>
                                            <Button loading={loginLoading} type="primary" htmlType="submit" className="login-form-button">
                                                登录
                                            </Button>
                                            Or <Link to="/">现在注册</Link>
                                        </Form.Item>
                                    </Form>
                                </Tabs.TabPane>
                            </Tabs>
                        </Card>
                    </Col>
                </Row>
            </Layout.Content>
            <Layout.Footer >
                © 2019 All Rights Reserved 百事服 鄂ICP备19029626号-1
            </Layout.Footer>
        </Layout>
    )
}



export const LoginWx: React.FC = () => {

    const nav = useNavigate()

    const [param] = useSearchParams()

    const [code, state] = [param.get("code"), param.get("state")]

    if (!code || !state) {
        nav("/login")
    }
    wxlogin(code!, state!).then(el => {
        localStorage.setItem('token', 'bearer%20' + (el as any).token)
        nav("/")
    })

    return (<></>)
}