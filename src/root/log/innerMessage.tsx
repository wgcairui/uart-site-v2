import { Card } from "antd"
import moment from "moment"
import { loginnerMessages } from "../../common/FecthRoot"
import { DesList, Log } from "./log"

export const LogInnerMessage: React.FC = () => {

   
    return (
        <Log
            lastDay={120}
            dataFun={loginnerMessages}
            columns={[
                {
                    dataIndex: 'timeStamp',
                    title: '日期',
                    render: val => moment(val).format('MM/DD')
                },
                {
                    dataIndex: 'user',
                    title: '用户'
                },
                {
                    dataIndex: 'nikeName',
                    title: '用户昵称'
                },
                {
                    dataIndex: 'mac',
                    title: '设备mac'
                },
                {
                    dataIndex: 'pid',
                    title: 'pid'
                },
                {
                    dataIndex: 'message',
                    title: 'message'
                }
            ]}

            expandable={{
                expandedRowRender: (li: any) =>
                    <Card>
                        <DesList title="data" data={li.data} />
                    </Card>
            }}
        />
    )
}


export default LogInnerMessage