import { Spin, Table, Form } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { materials_list } from "../../common/FecthRoot";
import { MyCopy } from "../../components/myCopy";

export const WxMaterials_list: React.FC = () => {

    const [list, setList] = useState<Uart.WX.materials_list>()

    useEffect(() => {
        materials_list('news', 0, 20).then(el => {
            setList(el.data)
        })
    }, [])

    return (
        <>
            {
                list ?
                    <Table dataSource={list.item.map(el => ({ ...el, key: el.media_id }))}
                        columns={[
                            {
                                dataIndex: 'media_id',
                                title: '素材ID',
                                render: val => <MyCopy value={val} />
                            },
                            {
                                dataIndex: 'content',
                                title: 'title',
                                render: (_, l) => l.content?.news_item[0].title
                            },
                            {
                                dataIndex: 'update_time',
                                title: '发布时间',
                                render: val => moment(val * 1000).format('YYYY-MM-DD H:m:s')
                            }
                        ]}
                        expandable={{
                            expandedRowRender: (li) => {
                                return (
                                    <Form>
                                        {
                                            Object.entries(li.content?.news_item[0] || {}).map(([key, val]) =>
                                                <Form.Item key={key} label={key}>
                                                    <MyCopy value={val} />
                                                </Form.Item>)
                                        }
                                    </Form>
                                )
                            }
                        }}
                    />
                    : <Spin />
            }


        </>
    )
}