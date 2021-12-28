import { ApartmentOutlined, HomeOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, DatePicker, Form, Pagination, Select, Space, Spin } from "antd";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { Line } from "@ant-design/charts";
import { devTypeIcon } from "../components/IconFont";
import { Main } from "../components/Main";
import { getProtocol, getTerminalDatas } from "../common/Fetch";
import { State } from "../store";
import { storeUser } from "../store/user";

export const DevLine: React.FC = () => {

    const { terminals } = useSelector<State, storeUser>(state => state.User)

    const { id } = useParams()
    /**
     * 透传网关
     */
    const termianl = useMemo(() => terminals.find(el => RegExp("^" + el.DevMac).test(id!)), [terminals, id])

    /**
     * 挂载设备
     */
    const mountDev = useMemo(() => termianl?.mountDevs.find(el => termianl.DevMac + el.pid === id), [termianl])


    const Location = useLocation()

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
     * 选择的参数
     */
    const [selects, setSelects] = useState<string[]>(() => {
        const name = new URLSearchParams(Location.search).get("name")
        return name ? [name] : []
    })

    const [protocolInstruct, setProtocolInstruct] = useState<Uart.protocolInstruct[]>([])

    useEffect(() => {
        if (mountDev) {
            getProtocol(mountDev.protocol).then(el => {
                setProtocolInstruct(el.data.instruct)
            })
        }
    }, [mountDev])



    const names = useCallback(() => {
        return protocolInstruct.map(el => el.formResize).flat().filter(el => el.unit && !el.isState).map(el => el.name)
    }, [protocolInstruct])

    const getLineData = () => {
        setLineloading(true)
        getTerminalDatas(termianl!.DevMac, mountDev!.pid, selects, date).then(({ data }) => {
            setLineData(data)
            setPage(Math.trunc(data.length / 2000))
            setLineloading(false)
        })
    }

    /**
     * 监听日期参数变化,更新约束配置数据流
     */
    useEffect(() => {
        if (selects.length > 0) {
            getLineData()
        }
    }, [date])

    const lines = useMemo(() => {
        setLineloading(true)
        const data = selects.length > 1 ?
            (
                lineDate.slice((page - 1) * 2e3, page * 2e3).map(el => el.result
                    .map(el2 => {
                        return { name: el2.name, value: Number(el2.value), time: moment(el.timeStamp).format("H:m:s") }
                    }))
                    .flat()
            )
            : (
                lineDate.map(el => el.result
                    .map(el2 => {
                        return { name: el2.name, value: Number(el2.value), time: moment(el.timeStamp).format("H:m:s") }
                    }))
                    .flat()
            )
        setLineloading(false)
        return data
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
                <Breadcrumb.Item href={'/dev/' + id}>
                    {mountDev ? devTypeIcon[mountDev!.Type] : <Spin />}
                    <span>{mountDev?.mountDev || ''}</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    {selects.length > 0 ? selects.join('+') : <Spin />}
                </Breadcrumb.Item>
            </Breadcrumb>
            <Card>
                <Space direction="vertical" style={{ display: "block" }}>
                    <Form>
                        <Form.Item label="选择日期">
                            <DatePicker defaultValue={moment(date)} onChange={value => setDate(value!.format("YYYY/MM/DD"))} disabledDate={d => d > moment().endOf("day")}></DatePicker>
                        </Form.Item>
                        <Form.Item label="选择参数">
                            <Select
                                loading={names().length === 0}
                                showSearch
                                mode="multiple"
                                autoClearSearchValue
                                defaultValue={selects}
                                filterOption={
                                    (input, option) => option!.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                onChange={(val) => setSelects(val)}
                            >
                                {
                                    names().map(el => <Select.Option value={el} key={el}>{el}</Select.Option>)
                                }
                            </Select>
                        </Form.Item>
                        <Form.Item wrapperCol={{ offset: 1 }}>
                            <Button disabled={lineloading} onClick={() => getLineData()}>确定</Button>
                        </Form.Item>
                    </Form>

                    {
                        selects.length > 1 ?
                            (
                                <div>
                                    <Line autoFit loading={lineloading} xField="time" yField="value" seriesField="name" data={lines} renderer="svg"></Line>
                                    <Pagination style={{ marginTop: 16 }} disabled={lineloading} simple defaultCurrent={page} total={lineDate.length} pageSize={2000} hideOnSinglePage showLessItems
                                        onChange={page => setPage(page)}
                                    />
                                </div>
                            ) :
                            (
                                <Line autoFit loading={lineloading} xField="time" yField="value" data={lines} renderer="svg"></Line>
                            )
                    }
                </Space>
            </Card>
        </>
    )
}