import {
	CheckCircleFilled,
	WarningFilled,
	EyeFilled,
	DeleteFilled,
	LoadingOutlined,
	ReloadOutlined,
	MoreOutlined,
	SyncOutlined,
	DownOutlined,
	CloudUploadOutlined,
	CloudDownloadOutlined,
} from "@ant-design/icons";
import {
	Table,
	Tooltip,
	Button,
	Card,
	Descriptions,
	Tag,
	Divider,
	Row,
	Col,
	Space,
	Popconfirm,
	message,
	TableProps,
	Modal,
	Spin,
	Dropdown,
	Menu,
	notification,
	ColProps,
	Switch,
	Empty,
	Avatar,
} from "antd";
import { ColumnsType } from "antd/lib/table";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { devType } from "../common/devImgSource";
import {
	BindDev,
	changeShareApi,
	deleteRegisterTerminal,
	delUserTerminal,
	getNodeInstructQueryMac,
	getTerminalBindUsers,
	getTerminals,
	getTerminalUser,
	initTerminal,
	IotQueryCardFlowInfo,
	IotQueryCardInfo,
	IotQueryIotCardOfferDtl,
	iotRemoteUrl,
	IotUpdateIccidInfo,
	modifyTerminalRemark,
	setTerminalOnline,
	setTerminalOwner,
} from "../common/FecthRoot";
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
const InterValToop: React.FC<{ mac: string; pid: number; show: boolean; minQueryLimit?: number }> = ({ mac, pid, show, minQueryLimit }) => {
	const {
		data: Interval,
		loading,
		fecth,
	} = usePromise(
		async () => {
			const { data } = await getNodeInstructQueryMac(mac, pid);
			return data;
		},
		0,
		[mac, pid]
	);

	useEffect(() => {
		const i = setInterval(() => {
			show && fecth();
		}, 3e4);
		return () => clearInterval(i);
	}, [show]);

	/**
	 * 刷新设备查询间隔
	 * @param mac
	 * @param pid
	 */
	const refreshInterval = () => {
		prompt({
			title: "设置设备查询间隔",
			placeholder: "输入间隔毫秒数,(值为x1000的倍数),未设置则为默认值",
			value: minQueryLimit ? minQueryLimit.toString() : undefined,
			onOk(val) {
				const n = Number(val);
				if (val && !Number.isNaN(n)) {
					if (n < 1000) {
						val = undefined;
					} else if (n % 1000 > 0) {
						val = String(n - (n % 1000));
					}
				}
				refreshDevTimeOut(mac, pid, Number(val)).then(() => {
					message.success("重置完成,等待数据刷新");
				});
				return true;
			},
		});
	};

	return loading ? (
		<LoadingOutlined />
	) : (
		<Tooltip title="查询间隔">
			<Dropdown
				overlay={
					<Menu>
						<Menu.Item onClick={() => fecth()} key="refresh">
							刷新
						</Menu.Item>
						<Menu.Item danger onClick={() => refreshInterval()} key="reset">
							重置
						</Menu.Item>
					</Menu>
				}
			>
				<a>
					{Interval / 1000}秒<DownOutlined />
				</a>
			</Dropdown>
		</Tooltip>
	);
};

interface infoProps {
	/**
	 * 设备数据
	 */
	terminal: Uart.Terminal & { user?: string };
	/**
	 * 是否一直展开
	 */
	ex: boolean;
	/**
	 * 是否显示标题
	 */
	showTitle?: boolean;

	/**
	 * 是否显示查询间隔
	 */
	InterValShow?: boolean;

	/**
	 *
	 */
	col?: ColProps;

	onChange?: (item?: Uart.Terminal) => void;
}

/**
 * 列出设备下挂载的子设备
 * @param param0
 * @returns
 */
export const TerminalMountDevs: React.FC<infoProps> = (props) => {
	const nav = useNavigate();

	const { terminal, ex, showTitle } = { showTitle: true, ...props };

	const [visible, setVisible] = useState(false);

	/**
	 * 删除挂载设备
	 * @param mac
	 * @param pid
	 */
	const delMountDev = (mac: string, pid: number) => {
		Modal.confirm({
			content: `确认删除挂载设备:${mac}/${pid} ?`,
			onOk() {
				const key = "delTerminalMountDev" + mac + pid;
				message.loading({ key });
				delTerminalMountDev(mac, pid).then(() => {
					message.success({ content: "删除成功", key });
					props.onChange && props.onChange(terminal);
				});
			},
		});
	};

	return (
		<Row>
			{terminal?.mountDevs &&
				terminal.mountDevs.map((el) => (
					<Col span={24} md={10} {...props.col} key={terminal.DevMac + el.pid}>
						<DevCard
							img={devType[el.Type]}
							title={
								<Space>
									<Tooltip title={el.online ? "在线" : "离线"}>{el.online ? <CheckCircleFilled style={{ color: "#67C23A" }} /> : <WarningFilled style={{ color: "#E6A23C" }} />}</Tooltip>
									{`${el.mountDev} - PID: ${el.pid}`}
								</Space>
							}
							avatar={devTypeIcon[el.Type]}
							subtitle={
								<Descriptions size="small" column={1}>
									<Descriptions.Item label="protocol">{el.protocol}</Descriptions.Item>
									{"minQueryLimit" in el && <Descriptions.Item label="minQueryLimit">{(el as any).minQueryLimit}</Descriptions.Item>}
									{"lastEmit" in el && <Descriptions.Item label={<CloudUploadOutlined />}>{moment((el as any).lastEmit).format("YYYY-MM-DD HH:mm:ss")}</Descriptions.Item>}
									{"lastRecord" in el && <Descriptions.Item label={<CloudDownloadOutlined />}>{moment((el as any).lastRecord).format("YYYY-MM-DD HH:mm:ss")}</Descriptions.Item>}
								</Descriptions>
							}
							actions={[
								<Tooltip title="编辑查看">
									<EyeFilled style={{ color: "#67C23B" }} onClick={() => nav("/dev/" + terminal.DevMac + el.pid)} />
								</Tooltip>,

								<Tooltip title="删除">
									<Popconfirm title={`确认删除设备[${el.mountDev}]?`} onConfirm={() => delMountDev(terminal.DevMac, el.pid)} onCancel={() => message.info("cancel")}>
										<DeleteFilled style={{ color: "#E6A23B" }} />
									</Popconfirm>
								</Tooltip>,
								props.InterValShow && <InterValToop mac={terminal.DevMac} pid={el.pid} show={ex} />,
							]}
						></DevCard>
					</Col>
				))}
			<Col>
				<Button onClick={() => setVisible(true)} shape="round" type="primary">
					添加设备
				</Button>
				<TerminalAddMountDev mac={terminal.DevMac} visible={visible} onCancel={() => setVisible(false)} onChange={props.onChange} />
			</Col>
		</Row>
	);
};

/**
 * 列出设备下挂载的子设备
 * @param param0
 * @returns
 */
export const TerminalIccidInfo: React.FC<{ iccid: string }> = (props) => {
	const { data, loading } = usePromise(
		async () => {
			const result = (await IotQueryIotCardOfferDtl(props.iccid)) as any;
			return result.data;
		},
		[],
		[props.iccid]
	);
	return (
		<Table
			loading={loading}
			dataSource={generateTableKey(data, "offerId")}
			columns={[
				{
					dataIndex: "offerId",
					key: "offerId",
					title: "订单Id",
				},
				{
					dataIndex: "orderTime",
					key: "orderTime",
					title: "订单时间",
				},
				{
					dataIndex: "offerName",
					key: "offerName",
					title: "订单名称",
				},
				{
					dataIndex: "effectiveTime",
					key: "effectiveTime",
					title: "起始时间",
					defaultSortOrder: "ascend",
					sorter: (a: any, b: any) => new Date(a.effectiveTime).getTime() - new Date(b.effectiveTime).getTime(),
				},
				{
					dataIndex: "expireTime",
					key: "expireTime",
					title: "结束时间",
				},
			]}
		></Table>
	);
};

const TerminalBindUsers: React.FC<{ mac: string; share: boolean; ownerId: string; update: () => void }> = (prop) => {
	const nav = useNav();
	const {
		data: users,
		loading,
		setData,
		fecth,
	} = usePromise(async () => {
		const { data } = await getTerminalBindUsers(prop.mac);
		return data;
	}, []);

	/**
	 * 更新单个用户信息
	 * @param user
	 */
	const updateOwner = async (user: string) => {
		setTerminalOwner(prop.mac, user).then(async (el) => {
			prop.update();
			fecth();
		});
	};

	/**
	 * 解绑用户设备
	 * @param mac
	 * @param user
	 */
	const unbindDev = (user: string) => {
		Modal.confirm({
			content: `是否删除设备设备{${prop.mac}}的绑定用户[${user}]?`,
			onOk() {
				delUserTerminal(user, prop.mac).then((el) => {
					message.success("解绑成功");
					fecth();
				});
			},
		});
	};
	return (
		<>
			<Divider orientation="left">设备绑定用户 / {users.length}</Divider>
			<Table
				loading={loading}
				dataSource={generateTableKey(users, "user")}
				scroll={{ x: 1000 }}
				columns={
					[
						{
							dataIndex: "avanter",
							title: "头像",
							width: 40,
							render: (img?: string) => <Avatar src={img} alt="i"></Avatar>,
						},
						{
							dataIndex: "user",
							title: "用户",
							width: 150,
							ellipsis: true,
							...getColumnSearchProp("user"),
							render: (val) => <MyCopy value={val} />,
						},
						{
							dataIndex: "name",
							title: "昵称",
							width: 120,
							ellipsis: true,
							...getColumnSearchProp("name"),
							render: (val) => <MyCopy value={val} />,
						},
						{
							dataIndex: "tel",
							title: "手机",
							width: 120,
							ellipsis: true,
							...getColumnSearchProp("tel"),
							render: (val) => <MyCopy value={val} />,
						},
						{
							dataIndex: "mail",
							title: "邮箱",
							width: 120,
							ellipsis: true,
							...getColumnSearchProp("mail"),
							render: (val) => <MyCopy value={val} />,
						},
						{
							dataIndex: "rgtype",
							title: "注册类型",
							width: 70,
							...tableColumnsFilter(users, "rgtype"),
							render: (val) => <Tag>{val}</Tag>,
						},
						{
							dataIndex: "userGroup",
							title: "用户组",
							width: 50,
							render: (val) => <Tag>{val}</Tag>,
						},
						{
							key: "gz",
							title: "wx状态",
							width: 60,
							render: (_, user) => (
								<>
									{user.wxId && <Tag color="blue">公众号</Tag>}
									{user.wpId && <Tag color="cyan">小程序</Tag>}
								</>
							),
						},
						{
							title: "操作",
							key: "operate",
							width: 120,
							render: (_, user) => (
								<>
									<Button type="link" onClick={() => nav("/root/node/user/userInfo", { user: user.user })}>
										查看
									</Button>
									{prop?.share && prop?.ownerId !== user.user && (
										<>
											<Button type="link" onClick={() => updateOwner(user.user)}>
												设为所有者
											</Button>
											<Button type="link" onClick={() => unbindDev(user.user)}>
												删除
											</Button>
										</>
									)}
								</>
							),
						},
					] as ColumnsType<Uart.UserInfo>
				}
			/>
		</>
	);
};

/**
 * 显示mac绑定用户
 * @param param0
 * @returns
 */
const TerminalUser: React.FC<{ mac: string }> = ({ mac }) => {
	const nav = useNav();

	const { data, loading } = usePromise(async () => {
		const { data } = await getTerminalUser(mac);
		return data;
	});
	return loading ? (
		<Spin />
	) : (
		<Button type="link" onClick={() => nav("/root/node/user/userInfo", { user: data })}>
			<MyCopy value={data}></MyCopy>
		</Button>
	);
};

/**
 * 展示设备信息
 * @param param0
 * @returns
 */
export const TerminalInfo: React.FC<infoProps> = (props) => {
	const {
		data: terminal,
		loading,
		fecth,
	} = usePromise(async () => {
		const { data } = await getTerminal(props.terminal.DevMac);
		return data;
	});

	/**
	 * 更新别名
	 * @param mac
	 * @param name
	 */
	const rename = (name?: string) => {
		const mac = terminal.DevMac;

		console.log(name, mac);

		if (name) {
			modifyTerminal(mac, name).then((el) => {
				if (el.code) {
					message.success("更新成功");
				} else message.error("更新失败");
			});
		} else {
			message.error("名称不能为空");
		}
	};

	/**
	 * 更新设备备注
	 * @param mac
	 * @param remark
	 */
	const remark = (remark: string) => {
		const mac = terminal.DevMac;
		modifyTerminalRemark(mac, remark).then((el) => {
			if (el.code) {
				message.success("更新成功");
			} else message.error("更新失败");
		});
	};

	const updateIccidInfo = async (mac: string) => {
		await IotUpdateIccidInfo(mac);
		fecth();
	};

	return loading ? (
		<Empty>loading</Empty>
	) : (
		<Card>
			<Descriptions title={terminal.name}>
				<Descriptions.Item label="别名">
					<MyInput value={terminal.name} onSave={rename}></MyInput>
				</Descriptions.Item>
				<Descriptions.Item label="用户">
					<TerminalUser mac={terminal.DevMac} />
				</Descriptions.Item>
				<Descriptions.Item label="状态">
					<Switch checked={terminal.online}></Switch>
				</Descriptions.Item>
				<Descriptions.Item label="mac">{terminal.DevMac}</Descriptions.Item>
				<Descriptions.Item label="AT支持">
					<Tag color="cyan">{terminal.AT ? "支持" : "不支持"}</Tag>
				</Descriptions.Item>
				<Descriptions.Item label="ICCID">{terminal.ICCID}</Descriptions.Item>
				<Descriptions.Item label="PID">{terminal.PID}</Descriptions.Item>
				<Descriptions.Item label="设备IP">{terminal.ip}</Descriptions.Item>
				<Descriptions.Item label="设备定位">{terminal.jw}</Descriptions.Item>
				<Descriptions.Item label="挂载节点">{terminal.mountNode}</Descriptions.Item>
				<Descriptions.Item label="TCP端口">{terminal.port}</Descriptions.Item>
				<Descriptions.Item label="串口参数">{terminal.uart}</Descriptions.Item>
				<Descriptions.Item label="信号强度">{terminal.signal ?? 0}</Descriptions.Item>

				<Descriptions.Item label="iot">{terminal.iotStat}</Descriptions.Item>
				<Descriptions.Item label="Gver">{terminal.Gver}</Descriptions.Item>
				<Descriptions.Item label="ver">{terminal.ver}</Descriptions.Item>
				<Descriptions.Item label="共享状态">{terminal.share ? "开启" : "关闭"}</Descriptions.Item>
				<Descriptions.Item label="更新时间" span={3}>
					{moment(terminal.uptime).format("YYYY-MM-DD H:m:s")}
				</Descriptions.Item>
				<Descriptions.Item label="备注" span={3}>
					<MyInput textArea value={terminal.remark} onSave={remark}></MyInput>
				</Descriptions.Item>
			</Descriptions>
			<TerminalBindUsers mac={terminal.DevMac} share={terminal?.share ?? false} ownerId={(terminal as any)?.ownerId} update={fecth}></TerminalBindUsers>
		</Card>
	);
};

interface props {
	title?: string;
	/**
	 * 如果有用户信息,就检索用户所属mac
	 */
	user?: string;
	/**
	 * 数据下载完成
	 */
	readyData?: (data: Uart.Terminal[]) => void;
}

/**
 * 格式化表格显示设备
 * @param props
 * @returns
 */
export const TerminalsTable: React.FC<Omit<TableProps<Uart.Terminal>, "dataSource"> & props> = (props) => {
	const nav = useNav();

	const {
		data: terminals,
		loading,
		fecth,
		setData,
	} = usePromise<Uart.Terminal[]>(async () => {
		return props.user ? await BindDev(props.user).then((el) => el.data.UTs as any) : await getTerminals().then((el) => el.data);
	}, []);

	useEffect(() => {
		if (props.readyData) props.readyData(terminals);
	}, [terminals]);

	/**
	 * 监听设备状态变更,有变更则更新列表
	 */
	useTerminalUpdate(
		terminals.map((el) => el.DevMac),
		setData,
		(t) => {
			notification.open({
				message: `设备状态变更`,
				description: `设备${t.name}状态:${t.online ? "在线" : "离线"}`,
				onClick: () => {
					CopyClipboard(t.DevMac);
					message.success(`已复制mac:${t.DevMac}到粘贴板`);
				},
			});
		}
	);

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

	const setOnlineSataus = async (mac: string, online: boolean) => {
		setTerminalOnline(mac, online).then(() => {
			fecth();
		});
	};

	const itoRemoteUrl = (mac: string) => {
		iotRemoteUrl(mac).then((el) => {
			if (el.code) {
				if (/remote_code=$/.test(el.data)) {
					message.error("远程调试地址获取失败,请确认设备是否联网和iot设置是否打开");
				} else window.open(el.data, "_blank");
			}
		});
	};

	const changeShare = (mac: string) => {
		changeShareApi(mac).then((el) => {
			if (el.code) {
				message.info("切换成功");
				fecth();
			} else {
				message.error(el.message);
			}
		});
	};

	const deleteRegisterTerminalm = (DevMac: string) => {
		Modal.confirm({
			content: `是否确定删除DTU:${DevMac} ??`,
			onOk: async () => {
				const key = "deleteRegisterTerminalm";
				message.loading({ key });
				const { code, data } = await deleteRegisterTerminal(DevMac);

				if (code) {
					message.success({ content: "删除成功", key });
					const index = terminals.findIndex((el) => el.DevMac === DevMac);
					terminals.splice(index, 1);
					setData([...terminals]);
				} else {
					message.error({ content: `用户:${data} 已绑定设备`, key, duration: 3 });
				}
			},
		});
	};

	/**
	 * 初始化设备
	 */
	const initTerminalm = (DevMac: string) => {
		Modal.confirm({
			content: `是否确定初始化DTU:${DevMac} ??`,
			onOk: async () => {
				const key = "initTerminalm";
				const { code, data, message: msg } = await initTerminal(DevMac);
				if (code) {
					message.success({ content: `删除成功,耗时${data}ms`, key });
				} else {
					message.error({ content: msg, key });
				}
			},
		});
	};

	/**
	 * 更新单个设备iccid信息
	 * @param iccid
	 */
	const iccdInfo = async (iccid: string, mac: string) => {
		const key = "iccdInfo" + Math.random();
		message.loading({ key });
		await IotQueryCardInfo(iccid);
		await IotQueryCardFlowInfo(iccid);
		await IotQueryIotCardOfferDtl(iccid);
		setTimeout(() => {
			message.info({ content: "ok", key });
		}, 5000);
	};

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
						fecth();
					});
				},
			});
		}
	};

	return (
		<>
			<Space style={{ marginBottom: 16 }}>
				<Button type="primary" size="small" onClick={() => fecth()} icon={<SyncOutlined />}>
					更新信息
				</Button>
			</Space>
			<Table
				loading={loading}
				dataSource={generateTableKey(terminals, "DevMac")}
				size="small"
				scroll={{ x: 1000 }}
				pagination={{ defaultPageSize: 20 }}
				columns={
					[
						{
							dataIndex: "online",
							title: "状态",
							width: 70,
							filters: [
								{
									text: "在线",
									value: true,
								},
								{
									text: "离线",
									value: false,
								},
							],
							onFilter: (val, re) => re.online === val,
							defaultSortOrder: "descend",
							sorter: (a: any, b: any) => a.online - b.online,
							render: (val) => (
								<Tooltip title={val ? "在线" : "离线"}>
									<IconFont type={val ? "icon-zaixianditu" : "icon-lixian"} style={{ fontSize: 22 }} />
								</Tooltip>
							),
						},
						// {
						// 	dataIndex: "share",
						// 	title: "共享状态",
						// 	width: 70,
						// 	filters: [
						// 		{
						// 			text: "打开",
						// 			value: true,
						// 		},
						// 		{
						// 			text: "未打开",
						// 			value: false,
						// 		},
						// 	],
						// 	onFilter: (val, re) => re.share === val,
						// 	sorter: (a: any, b: any) => a.share - b.share,
						// 	render: (val) => (
						// 		<Tooltip title={val ? "" : "未打开"}>
						// 			<p>{val ? "open" : "unOpen"}</p>
						// 		</Tooltip>
						// 	),
						// },
						{
							dataIndex: "name",
							title: "名称",
							ellipsis: true,
							width: 180,
							...getColumnSearchProp<Uart.Terminal>("name"),
						},
						{
							dataIndex: "DevMac",
							title: "mac",
							width: 140,
							...getColumnSearchProp<Uart.Terminal>("DevMac"),
							render: (val) => <MyCopy value={val}></MyCopy>,
						},
						{
							dataIndex: "user",
							title: "用户",
							width: 140,
							ellipsis: true,
							...getColumnSearchProp<any>("user"),
						},
						{
							dataIndex: "ICCID",
							title: "ICCID",
							ellipsis: true,
							width: 120,
							...getColumnSearchProp<Uart.Terminal>("ICCID"),
							render: (val) => val && <MyCopy value={val}></MyCopy>,
						},
						{
							dataIndex: "mountNode",
							title: "节点",
							width: 80,
							...tableColumnsFilter(terminals, "mountNode"),
						},
						{
							dataIndex: "PID",
							title: "型号",
							width: 80,
							...tableColumnsFilter(terminals, "PID"),
						},
						{
							title: "挂载设备",
							dataIndex: "mountDevs",
							width: 180,
							filters: [
								...new Set(
									terminals
										.filter((el) => el.mountDevs)
										.map((el) => el.mountDevs.map((e) => e.mountDev))
										.flat()
								),
							].map((value) => ({ value, text: value })),
							onFilter: (val: any, re: Uart.Terminal) => re.mountDevs && re.mountDevs.some((el) => el.mountDev === val),
							render: (val: Uart.TerminalMountDevs[]) => (
								<>
									{val &&
										val.map((el) => (
											<Tag color={el.online ? "green" : "warning"} key={el.pid}>
												{el.mountDev}
											</Tag>
										))}
								</>
							),
						},
						{
							dataIndex: "uptime",
							title: "更新时间",
							width: 165,
							render: (val) => moment(val || "1970-01-01").format("YYYY-MM-DD H:m:s"),
							sorter: {
								compare: (a: any, b: any) => new Date(a.uptime).getDate() - new Date(b.uptime).getDate(),
							},
						} /* 
                    {
                        dataIndex: 'iccidInfo',
                        title: '剩余流量/天数',
                        width: 165,
                        render: (iccidInfo: Uart.iccidInfo) => iccidInfo ? (iccidInfo.restOfFlow / 1024).toFixed(1) : 'lan',
                        sorter: {
                            compare: (a: Uart.iccidInfo, b: Uart.iccidInfo) => (a?.restOfFlow || 1e9) - (b?.restOfFlow || 1e9)
                        }
                    }, */,

						{
							key: "oprate",
							title: "操作",
							width: 120,
							render: (_, t) => (
								<Space size={0} wrap>
									<Button type="link" onClick={() => nav("/root/node/Terminal/info?mac=" + t.DevMac)}>
										查看
									</Button>
									{/* <Button type="link" onClick={() => updateDev(t.DevMac)}>更新</Button> */}
									<Dropdown
										overlay={
											<Menu>
												<Menu.Item onClick={() => setOnlineSataus(t.DevMac, !t.online)} key={1}>
													设置{t.online ? "离" : "在"}线
												</Menu.Item>
												<Menu.Item onClick={() => itoRemoteUrl(t.DevMac)} key={1}>
													远程配置
												</Menu.Item>
												<Menu.Item onClick={() => changeShare(t.DevMac)} key={11}>
													切换共享状态
												</Menu.Item>
												<Menu.Item onClick={() => deleteRegisterTerminalm(t.DevMac)} key={2}>
													delete
												</Menu.Item>
												<Menu.Item onClick={() => initTerminalm(t.DevMac)} key={3}>
													初始化
												</Menu.Item>
												{t.ICCID && (
													<Menu.Item onClick={() => iccdInfo(t.ICCID!, t.DevMac)} key={4}>
														ICCID更新
													</Menu.Item>
												)}
												{props.user && (
													<Menu.Item onClick={() => unbindDev(t.DevMac, props.user)} key={5}>
														解绑设备
													</Menu.Item>
												)}
											</Menu>
										}
									>
										<MoreOutlined />
									</Dropdown>
								</Space>
							),
						},
					] as ColumnsType<Uart.Terminal>
				}
				expandable={{
					expandedRowRender: (re, _, __, ex) => (
						<>
							<TerminalInfo terminal={re} ex={ex} />
							<TerminalMountDevs terminal={re} ex={ex} showTitle={false} InterValShow onChange={fecth}></TerminalMountDevs>

							{/*  <TerminalMountDevs terminal={re} ex={ex}></TerminalMountDevs> */}
							<DevPosition terminal={re} />
						</>
					),
					fixed: "left",
				}}
			></Table>
		</>
	);
};
