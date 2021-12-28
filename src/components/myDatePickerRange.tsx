import { Form, DatePicker } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";

interface props {
    /**
     * 开始时间
     */
    start?: moment.Moment

    /**
     * 结束时间
     */
    end?: moment.Moment
    /**
     * 距今最后日期,设置过开始时间则此配置无效
     */
    lastDay?: number

    /**
     * 
     */
    onChange?: (range: [moment.Moment, moment.Moment], str: [string, string]) => void
}

export const MyDatePickerRange: React.FC<props> = ({ children, start, end, lastDay, onChange }) => {

    const [date, setDate] = useState<[moment.Moment, moment.Moment]>([start || moment().subtract(lastDay || 1, 'day'), end || moment()])



    useEffect(() => {
        return onChange && onChange(date, date.map(el => el.toString()) as any);
    }, [])
    return (
        <Form layout="inline" style={{ marginBottom: 12 }}>
            <Form.Item label="查询时间段">
                <DatePicker.RangePicker
                    value={date}
                    onChange={(_: any, __: any) => {
                        setDate(_)
                        onChange && onChange(_, __)
                    }}
                    ranges={{
                        "一周": [moment().subtract(7, 'day'), moment()],
                        '一个月': [moment().subtract(1, "month"), moment()],
                        '三个月': [moment().subtract(3, "month"), moment()],
                        '六个月': [moment().subtract(6, "month"), moment()],
                        '一年': [moment().subtract(1, "year"), moment()],
                    }}
                ></DatePicker.RangePicker>
            </Form.Item>
            <Form.Item>
                {
                    children
                }
            </Form.Item>
        </Form>
    )
}