import moment from "moment"
import { logdataclean } from "../../common/FecthRoot"
import { Log } from "./log"

export const LogDataClean: React.FC = () => {
    return (
        <Log
            lastDay={120}
            dataFun={logdataclean}
            columns={[
                {
                    dataIndex: 'timeStamp',
                    title: '日期',
                    render: val => moment(val).format('MM/DD')
                },
                {
                    dataIndex: 'CleanClientresultsTimeOut',
                    title: '超期数据'
                },
                {
                    dataIndex: 'NumClientresults',
                    title: '重复设备数据'
                },
                {
                    dataIndex: 'NumUserRequst',
                    title: '重复请求数据'
                },
                {
                    dataIndex: 'useTime',
                    title: '耗时'
                }
            ]}
        />
    )
}


export default LogDataClean