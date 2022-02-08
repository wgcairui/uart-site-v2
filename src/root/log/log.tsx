import { Button, Col, Descriptions, Divider, Empty, Row, Space, Table } from "antd";
import { ColumnsType, TableProps } from "antd/lib/table";
import moment from "moment";
import React, { useMemo, useState } from "react";
import { generateTableKey } from "../../common/tableCommon";
import { MyCopy } from "../../components/myCopy";
import { usePromise } from "../../hook/usePromise";
import { Pie, Plot } from "@ant-design/charts";
import { pieConfig, pieData } from "../../common/charts";
import { MyDatePickerRange } from "../../components/myDatePickerRange";

export interface pieArg {
    key: string
    event: (data: pieData, plot: Plot<any>) => void
}

export interface log<T = any> extends TableProps<T> {
    /**
     * 天数间隔,之前N天至今天
     */
    lastDay?: number
    /**
     * 数据获取函数,只能用于log api,参数已配置
     */
    dataFun: Function
    /**
     * 开启参数刷选的字段
     */
    // cfilter?: string[]
    /**
     * pie饼图参数显示
     */
    cPie?: (string | pieArg)[]
}

/**
 * 日志组件通用页面配置
 * @param props 
 * @returns 
 */
export const Log: React.FC<log> = (props) => {

    const [date, setDate] = useState([moment().subtract(props.lastDay || 1, 'day'), moment()])

    const [filter, setFilter] = useState<Record<string, string[] | null>>(() => {
        return props.cPie ?
            Object.assign({}, ...props.cPie.map(el => {
                const key = typeof el === 'string' ? el : el.key
                return { [key]: [] }
            }))
            : {}
    })

    const list = usePromise(async () => {
        const { data } = await props.dataFun(date[0].format(), date[1].format())
        return data
    }, [], [date])

    /**
     * 合并传入的col
     * @returns 
     */
    const columns = useMemo(() => {
        /**
         * 合并col
         */
        const arr = [
            props.columns ? props.columns : [],
            {
                dataIndex: 'timeStamp',
                title: '时间',
                render: (val: string) => moment(val).format('YYYY-MM-DD HH:mm:ss'),
                defaultSortOrder: 'descend',
                sorter: (a: any, b: any) => a.timeStamp - b.timeStamp
            },
        ].flat() as any

        /**
         * 检查是否包含饼图配置,包含的话给相关字段添加filter配置
         */
        /*  if (props.cPie) {
             const fSet = new Set(props.cPie?.map(el => typeof el === 'string' ? el : el.key))
             arr.forEach((el: any) => {
                 if (fSet.has(el.dataIndex)) {
                     Object.assign(el, { filteredValue: filter[el.dataIndex], ...tableColumnsFilter(list.data, el.dataIndex) })
                 }
             })
         } */

        /**
         * 检查是否包含刷选配置
         */
        /* const s = new Set([...props.cfilter || [], ...props.cPie?.map(el => typeof el === 'string' ? el : el.key) || []])

        console.log({arr,s,props});
        
        arr.forEach((el: any) => {
            if (s.has(el.dataIndex)) {
                Object.assign(el, { filteredValue: filter[el.dataIndex], ...tableColumnsFilter(list.data, el.dataIndex) })
            }
        }) */

        return arr
    }, [filter])

    /**
     * 获取饼图配置
     */
    const pies = useMemo(() => {
        if (props.cPie && list.data.length > 0) {
            const hasPies = props.cPie.filter(el => ((typeof el === 'string') ? el : el.key) in list.data[0])
            if (hasPies.length !== props.cPie.length) console.log('piekey有未包含的键');

            return hasPies.map(el => {
                const m = new Map<string, number>();
                const [k, event] = typeof el === 'string' ? [el, undefined] : [el.key, el.event];
                (list.data as Record<string, any>[]).forEach(li => {
                    const key = li[k]
                    m.set(key, (m.get(key) || 0) + 1)
                })

                return {
                    data: [...m.entries()].map(([type, value]) => ({ type, value })),
                    key: k,
                    event
                }
            })

        } else {
            return []
        }
    }, [list.data])


    /**
     * 响应pie图点击事件,修改filterValue
     * @param type 
     * @param key 
     */
    const target = (type: string, key: string) => {
        setFilter(filter => ({ ...filter, [type]: [key] }))
    }

    const clearFilter = () => {
        setFilter(() => {
            return props.cPie ?
                Object.assign({}, ...props.cPie.map(el => {
                    const key = typeof el === 'string' ? el : el.key
                    return { [key]: [] }
                }))
                : {}
        })
    }

    return (
        <>
            <MyDatePickerRange lastDay={props.lastDay} onChange={setDate}>
                <Space>
                    <Button type="primary" onClick={() => list.fecth()}>刷新</Button>
                    <Button type="default" onClick={() => clearFilter()}>清除刷选配置</Button>
                </Space>
            </MyDatePickerRange>

            <Row >
                {
                    pies.map(el =>
                        <Col span={24 / pies.length} key={el.data[0].type} style={{ padding: 12 }}>
                            <Pie
                                data={el.data}
                                {...pieConfig({ angleField: 'value', colorField: 'type', radius: .6 })}
                                onReady={(p) => {
                                    p.on('plot:click', (e: any) => {
                                        if (el.event) el.event!(e.data.data, p)
                                        else {
                                            target(el.key, e.data.data.type)
                                        }
                                    })
                                }}
                            ></Pie>
                        </Col>)
                }
            </Row>
            <Table
                {...props}
                loading={list.loading}
                dataSource={generateTableKey(list.data, '_id')}
                columns={columns}
                pagination={{ defaultPageSize: 30 }}
            ></Table>
        </>
    )
}

/**
 * 展示数据
 * @param param0 
 * @returns 
 */
export const DesList: React.FC<{ title: string, data: Record<string, any> | undefined }> = ({ title, data }) => {
    return (
        <>
            <Divider orientation="center">{title}</Divider>
            {
                data ?
                    <Descriptions column={1}>
                        {
                            Object.entries(data).map(([key, val]) =>
                                <Descriptions.Item label={key} key={key}>
                                    <MyCopy value={typeof val === 'string' ? val : JSON.stringify(val)} />
                                </Descriptions.Item>
                            )
                        }
                    </Descriptions>
                    : <Empty />
            }
        </>
    )
}