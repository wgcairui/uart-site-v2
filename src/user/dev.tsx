import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Col, Row, Table, Spin, Card, DatePicker, Space, Form, Breadcrumb, Pagination, Tooltip, Tag, Divider } from "antd";
import { useParams, Link } from "react-router-dom";
import { State } from "../store";
import { storeUser } from "../store/user";
import { getAlarmProtocol, getTerminalData, getUserAlarmProtocol, getTerminalDatas } from "../common/Fetch"
import { getColumnSearchProp } from "../common/tableCommon";
import { devTypeIcon } from "../components/IconFont";
import { Line } from "@ant-design/charts";
import moment from "moment";
import { ApartmentOutlined, FundFilled, HomeOutlined, InfoCircleFilled } from '@ant-design/icons';

export const Dev: React.FC = () => {



    const { terminals } = useSelector<State, storeUser>(state => state.User)

    /**
     * 设备id
     */
    const { id } = useParams()

    /**
     * 透传网关
     */
    const termianl = useMemo(() => terminals.find(el => RegExp("^" + el.DevMac).test(id!)), [terminals, id])

    /**
     * 挂载设备
     */
    const mountDev = useMemo(() => termianl?.mountDevs.find(el => termianl.DevMac + el.pid === id), [termianl])

    /**
     * 运行数据
     */
    const [runData, setRunData] = useState<Uart.queryResultSave | undefined>(() => undefined)

    /**
     * 图表loading状态
     */
    const [tableloding, setTableloading] = useState(false)

    /**
     * 通用及告警配置
     */
    const [showTag, setShowTag] = useState<string[]>(() => [])
    const [alarmStat, setAlarmStat] = useState<Uart.ConstantAlarmStat[]>(() => [])
    const [threshold, setThreshold] = useState<Uart.Threshold[]>(() => [])
    const [oprate, setOprate] = useState<Uart.OprateInstruct[]>(() => [])
    const [contant, setContant] = useState<Uart.DevConstant>()

    /**
     * 约束参数数据
     */
    const [lineDate, setLineData] = useState<Uart.queryResultSave[]>([])

    /**
     * 约束图表参数日期
     */
    const [date, setDate] = useState(new Date().toLocaleDateString())

    /**
     * 约束参数图表loading状态
     */
    const [lineloading, setLineloading] = useState(false)

    const [page, setPage] = useState(1)
    /**
     * 获取数据更新
     * 保存运行数据map副本
     * 刷选出需要的数据
     */
    const getRunData = async () => {
        await getTerminalData(termianl!.DevMac, mountDev!.pid).then(({ code, data }) => {
            setRunData(data)
        })
        return
    }


    /**
     * 挂载设备更新之后获取设备最新数据
     * 页面卸载清理数据
     */
    useEffect(() => {
        setTableloading(true)
        if (mountDev) {
            Promise.all([getUserAlarmProtocol(mountDev.protocol), getAlarmProtocol(mountDev.protocol)])
                .then(([user, sys]) => {
                    setShowTag((user.data.ShowTag && user.data.ShowTag.length > 0) ? user.data.ShowTag : sys.data.ShowTag)
                    setContant(sys.data.Constant)
                    setOprate(sys.data.OprateInstruct)

                    const alarmMap = new Map(sys.data.AlarmStat.map(el => [el.name, el]))
                    if (user.data.AlarmStat) {
                        user.data.AlarmStat.forEach(el => alarmMap.set(el.name, el))
                    }
                    setAlarmStat([...alarmMap.values()])

                    const threMap = new Map(sys.data.Threshold.map(el => [el.name, el]))
                    if (user.data.Threshold) {
                        user.data.Threshold.forEach(el => threMap.set(el.name, el))
                    }
                    setThreshold([...threMap.values()])
                    getRunData().then(() => setTableloading(false))
                })

        }

        return () => {
            setRunData(undefined)
        }
    }, [mountDev])

    /**
     * 监听日期参数变化,更新约束配置数据流
     */
    useEffect(() => {
        if (threshold.length > 0) {
            setLineloading(true)
            getTerminalDatas(termianl!.DevMac, mountDev!.pid, threshold.map(el => el.name), date).then(({ data }) => {
                setLineData(data)
                setPage(Math.trunc(data.length / 2000))
                setLineloading(false)
            })

        }
    }, [threshold, date])

    /**
     * 计算需要显示的表格参数
     */
    const tableData = useMemo(() => {
        const showtagSet = new Set(showTag)
        return runData ? runData.result.filter(el => showtagSet.has(el.name)).map((el, key) => ({ ...el, key })) : []
    }, [runData])

    /**
     * 计算约束配置参数的结果,转换成line图表格式
     */
    const lines = useMemo(() => {
        setLineloading(true)
        const slice = lineDate.slice((page - 1) * 2e3, page * 2e3)
        const start = slice.length > 1 ? moment(slice[0].timeStamp).format('H:m:s') : "--:--:--"
        const end = slice.length > 1 ? moment(slice[slice.length - 1].timeStamp).format('H:m:s') : "--:--:--"
        const data = slice.map(el => el.result
            .map(el2 => {
                return { name: el2.name, value: Number(el2.value), time: moment(el.timeStamp).format("H:m:s") }
            }))
            .flat()
        setLineloading(false)
        return {
            start,
            end,
            data
        }
    }, [lineDate, page])


    return (
        <>
            <Breadcrumb>
                <Breadcrumb.Item href="/">
                    <HomeOutlined />
                </Breadcrumb.Item>
                <Breadcrumb.Item href={'/terminal/' + termianl?.DevMac}>
                    <ApartmentOutlined />
                    <span>{termianl?.name}</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    {mountDev ? devTypeIcon[mountDev!.Type] : <Spin />}
                    <span>{mountDev?.mountDev || ''}</span></Breadcrumb.Item>
                <Breadcrumb.Item>
                    {runData?.time ? moment(runData.time).format("YY-M-D H:m:s") : <Spin />}</Breadcrumb.Item>
            </Breadcrumb>
            <Row>
                <Col span={24}>
                    <Row>
                        <Col span={24} xs={8} style={{ padding: 12 }}>
                            <Table dataSource={tableData} loading={tableloding} pagination={{ position: ["bottomCenter"] }}>
                                <Table.Column title="名称" dataIndex="name" key="name" {...getColumnSearchProp<Uart.queryResultArgument>("name")}></Table.Column>
                                <Table.Column title="值" dataIndex="parseValue" key="parseValue"
                                    render={(value, record: Uart.queryResultArgument) => (
                                        <span>{value + (!record.issimulate ? record.unit : '')}
                                            {
                                                (record.issimulate || !record.unit)
                                                    ? <a />
                                                    : <Tooltip color="cyan" title={`查看[${record.name}]的历史记录`}>
                                                        <Link to={`/devline/${id}?name=${record.name}`}>
                                                            <FundFilled style={{ marginLeft: 8 }} />
                                                        </Link>
                                                    </Tooltip>
                                            }
                                            {
                                                record.alarm ? <InfoCircleFilled style={{ color: "#E6A23C" }} /> : <a />
                                            }

                                        </span>
                                    )}
                                ></Table.Column>

                            </Table>
                        </Col>
                        <Col span={24} xs={16} style={{ padding: 12 }}>
                            <Card>
                                <Space direction="vertical" style={{ display: "block" }}>
                                    <Form>
                                        <Form.Item label="选择日期">
                                            <DatePicker defaultValue={moment(date)} onChange={value => setDate(value!.format("YY/MM/DD"))} disabledDate={d => d > moment().endOf("day")}></DatePicker>
                                        </Form.Item>
                                    </Form>
                                    <Divider orientation="left">展示告警约束参数的运行状态</Divider>
                                    <Line autoFit loading={lineloading} xField="time" yField="value" seriesField="name" data={lines.data} renderer="svg"></Line>
                                    <Space style={{ marginTop: 16 }}>
                                        <span>
                                            <Tag color="#55acee">{lines.start}</Tag>
                                            至
                                            <Tag color="#55acee">{lines.end}</Tag>
                                        </span>
                                        <Pagination disabled={lineloading} simple defaultCurrent={page} total={lineDate.length} pageSize={2000} hideOnSinglePage showLessItems
                                            onChange={page => setPage(page)}
                                        />
                                    </Space>
                                </Space>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </>
    )
}