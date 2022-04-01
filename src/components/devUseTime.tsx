import { Line } from "@ant-design/charts";
import { Divider } from "antd";
import moment from "moment";
import React, { useState } from "react";
import { logDevUseTime } from "../common/FecthRoot";
import { usePromise } from "../hook/usePromise";
import { MyDatePickerRange } from "./myDatePickerRange";


interface props {
    /**
     * mac or terminal
     */
    terminal: Uart.Terminal
}


interface d {
    pid: number;
    name: string;
    data: {
        value: number
        time: string
        category: string
    }[];
}
/**
 * 设备模糊定位
 */
export const DevUseTime: React.FC<props> = ({ terminal }) => {

    const [date, setDate] = useState([moment().subtract(1, 'day'), moment()])

    const { data, loading } = usePromise(async () => {
        const { data } = await logDevUseTime(terminal.DevMac, date[0].format(), date[1].format());
        const mountDevMap = new Map<number, d>((terminal?.mountDevs || []).map(({ pid, mountDev }) => [pid, { pid, name: mountDev, data: [] }]));
        data.forEach(({ pid, useTime, Interval, timeStamp }) => {
            const dev = mountDevMap.get(pid)
            if (dev) {
                const time = moment(timeStamp).format("H:m:s")
                dev.data.push({value:useTime,time,category:'耗时'})
                dev.data.push({value:Interval,time,category:'间隔'})
            }
        })
        return [...mountDevMap.values()]
    }, [], date)

    return (
        <>
            <Divider plain>统计设备每天查询的间隔和查询耗时</Divider>
            <MyDatePickerRange onChange={setDate}>
            </MyDatePickerRange>
            {
                data.map(({ name, pid, data }) => <>
                    <Divider plain>{name + pid}</Divider>
                    <Line loading={loading} data={data} xField="time" yField="value" seriesField ='category'
                        /* yAxis={{
                            title: {
                                text: 'useTime'
                            }
                        }} */
                        xAxis={{
                            title: {
                                text: '日期'
                            }
                        }}
                    ></Line>
                </>)
            }
        </>
    )
}