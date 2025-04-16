import React, { useEffect, useState } from "react";
import { AES } from "crypto-js";
import { Layout, Image, Menu, Dropdown, Row, Col, Card, Tabs, Form, Input, Button, message, Spin } from "antd";
import { UserOutlined, LockOutlined, WechatFilled } from "@ant-design/icons";
import "./login.css";
import { IconFont } from "./components/IconFont";
import { Get, Post } from "./common/Fetch";
import { universalResult } from "./typing";
import { useNav } from "./hook/useNav";
import { useLocalStorageState } from "ahooks";

import { ConfigProvider } from "antd";
import Zh from "antd/es/locale/zh_CN";
import En from "antd/es/locale/en_US";

const Login: React.FC = () => {
	const navi = useNav();

	const [_, setToken] = useLocalStorageState<string>("token");

	const [loading, setLoading] = useState(true);

	const [isZh, setZh] = useState(true);

	/**
	 * tab index
	 */
	const [tabdefaultActiveKey, setTabDefaultActiveKey] = useState<"wx_qr" | "login">("wx_qr");

	const [loginLoading, setLoginLoading] = useState(false);

	const checkUser = async () => {
		if (!localStorage.getItem("token")) return false;
		try {
			const {
				data: { user, userGroup },
			} = await Get<universalResult<{ user: string; userGroup: string }>>("/api/auth/user");
			// console.log({ user, code, userGroup });
			if (user) {
				navi(["user", "test"].includes(userGroup) ? "/main" : "/root");
				return true;
			} else {
				setToken("");
				return false;
			}
		} catch (error) {
			console.log(error);
			return false;
		}
	};

	/**
	 * 判断用户屏幕尺寸,如果是小尺寸屏幕,禁用微信登录
	 * 否则加载微信登录qr
	 */
	useEffect(() => {
		checkUser().then((el) => {
			setLoading(false);
			if (!el) {
				if (window.innerWidth < 476) {
					setTabDefaultActiveKey("login");
				}
				const script = document.createElement("script");
				script.src = "https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js";
				script.async = false;
				document.body.append(script);
				script.onload = () => {
					// 马上执行是找不到wx对象的,需要异步到下一次循环
					setTimeout(() => {
						window.WxLogin({
							// self_redirect: true,
							id: "wxlogin",
							appid: "wx2afee5b1777448cf",
							scope: "snsapi_login",
							redirect_uri: encodeURI("https://uart.ladishb.com/loginwx"),
							state: "e0bwU6jnO2KfIuTgBQNDVxlsy7iGtoF3A8rWpSCM5RzZ1dmYJcLHqPhXav4Ek9lIC6P4cULfktXj5Wcwa3GcCBCYRMWidUzZyJyTqu",
							href: "https://besiv-uart.oss-cn-hangzhou.aliyuncs.com/css/00137087c1c679c134236bbd38f41220.css",
						});
					}, 0);
				};
			}
		});
	}, []);

	/**
	 * 提交登录
	 * @param values
	 */
	const onFinish = async ({ username, password }: { username: string; password: string }) => {
		setLoginLoading(true);
		// 获取hash加密密码
		const { data: hash } = await Get<universalResult<{ hash?: string }>>("/api/auth/hash", { user: username }).catch((e) => {
			localStorage.clear();
			return message.error("hash获取出错, try again");
		});

		if (hash) {
			const { code, data, message: msg } = await Post<universalResult<string>>("/api/auth/login", { user: username, passwd: AES.encrypt(password, hash).toString() });
			if (code === 200) {
				setToken(data);
				checkUser();
			} else {
				let m = "";
				switch (msg) {
					case "userNan":
						m = "用户名错误";
						break;
					case "passwd Error":
						m = "用户密码错误";
						break;
					case "user null":
						m = "未知用户";
						break;
					default:
						m = "登录遇到未知错误";
						break;
				}
				message.error(m);
				setLoginLoading(false);
			}
		} else {
			message.error("hash空");
			localStorage.clear();
			setLoginLoading(false);
		}
	};

	return loading ? (
		<div className="loading">
			<Spin tip="loading" size="large" />
		</div>
	) : (
		<ConfigProvider locale={isZh ? Zh : En}>
			<Layout className="layout">
				<Layout.Header color="#000" className="header">
					{/* <Image src="https://www.ladishb.com/logo.png" preview={false}></Image> */}
					<span style={{ fontSize: 36, color: "#3a8ee6", fontFamily: "cursive" }}>百事服</span>
					<Dropdown
						overlay={
							<Menu>
								<Menu.Item icon={<IconFont type="icon-zhongwen" />} key="cn" onClick={() => setZh(true)}>
									中文
								</Menu.Item>
								<Menu.Item icon={<IconFont type="icon-yingwen" />} key="en" onClick={() => setZh(false)}>
									En
								</Menu.Item>
							</Menu>
						}
						className="header-drop"
					>
						<a href="" onClick={(e) => e.preventDefault()}>
							lauguage
						</a>
					</Dropdown>
				</Layout.Header>
				<Layout.Content className="content">
					<Row className="content-row">
						<Col span={24} md={12}>
							<div className="content-row-col1">
								<h3>物联网ITO监控服务平台</h3>
								<h4>适用于数据中心,微模块机房,单体UPS,空调等设备监控</h4>
								<div>
									<Image height={288} width={288} src="https://besiv-uart.oss-cn-hangzhou.aliyuncs.com/png/4713b946f778b3a2cdd94512eda43fa2.png" />
								</div>
								<h5>百事服云平台小程序</h5>
							</div>
						</Col>
						<Col span={24} md={12} className="content-row-col2">
							<Card className="card-login">
								<Tabs defaultActiveKey={tabdefaultActiveKey}>
									<Tabs.TabPane
										tab={
											<span>
												<WechatFilled />
												微信登录/注册
											</span>
										}
										key="wx_qr"
									>
										<div id="wxlogin" className="hidden-sm-and-down" style={{ height: 286 }}></div>
									</Tabs.TabPane>
									<Tabs.TabPane
										tab={
											<span>
												<UserOutlined />
												账号登录
											</span>
										}
										key="login"
										className=""
									>
										<Form name="normal_login" className="login-form" initialValues={{ remember: true }} onFinish={onFinish}>
											<Form.Item name="username" rules={[{ required: true, message: "输入云平台账号或百事服账号!" }]}>
												<Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="输入你的账号" />
											</Form.Item>
											<Form.Item name="password" rules={[{ required: true, message: "输入密码,密码不能为空!" }]}>
												<Input prefix={<LockOutlined className="site-form-item-icon" />} type="password" placeholder="输入密码" />
											</Form.Item>

											<Form.Item>
												<Button loading={loginLoading} type="primary" htmlType="submit" className="login-form-button">
													登录
												</Button>
												<Button
													loading={loginLoading}
													className="login-form-button"
													style={{ marginTop: 9, backgroundColor: "#E6A23B", color: "#fff" }}
													onClick={() => onFinish({ username: "test", password: "123456" })}
												>
													我要试用?
												</Button>
												{/*  Or <Link to="/">现在注册</Link>
                                                <Link to="/" className="login-form-forgot">忘记密码</Link> */}
											</Form.Item>
										</Form>
									</Tabs.TabPane>
								</Tabs>
							</Card>
						</Col>
					</Row>
				</Layout.Content>
				<Layout.Footer>
					© 2019 All Rights Reserved
					<a href="http://www.besiv.com/" target="_blank">
						百事服
					</a>
					鄂ICP备19029626号-1
				</Layout.Footer>
			</Layout>
		</ConfigProvider>
	);
};

export default Login;
