import React, { useMemo } from "react"
import { Layout, Menu, Breadcrumb, Image, BackTop } from "antd"
import "./RootMain.css"
import { Link, Outlet, useLocation } from "react-router-dom"
import { UserDropDown } from "../components/userDropDown"
import { AbsButton } from "../components/absButton"

interface navi {
  title: string
  ico: string;
  child: {
    to: {
      name: string
    }
    text: string;
    ico?: string;
  }[]
}

/**
 * root页面通用布局
 * @param props 
 * @returns 
 */
const RootMain: React.FC = props => {

  const nav: navi[] =
    [{
      title: "基础数据",
      ico: "el-icon-menu",
      child: [
        {
          to: {
            name: "root/node/Secret",
          },
          text: "Secret",
        },
        {
          to: {
            name: "root/node/Protocols",
          },
          text: "协议",
        },
        {
          to: {
            name: "root/node/addDev",
          },
          text: "设备类型",
        },
        {
          to: {
            name: "root/node/addNode",
          },
          text: "节点",
        },
        {
          to: {
            name: "root/node/Terminal",
          },
          text: "终端",
          ico: "\uEB63",
        },
        {
          to: {
            name: "root/node/user",
          },
          text: "用户",
          ico: "\uEB6f",
        }
      ],
    },
    {
      title: "微信数据",
      ico: "el-icon-chat-round",
      child: [
        {
          to: {
            name: "root/wx/users",
          },
          text: "公众号用户",
          ico: "\uEB64",
        },
        {
          to: {
            name: "root/wx/materials_list",
          },
          text: "素材列表",
          ico: "\uEB6f",
        },
      ],
    },
    {
      title: '设备数据',
      ico: "el-icon-coin",
      child: [
        {
          to: {
            name: "root/data/ClientResultSingle",
          },
          text: "单例数据",
          ico: "\uEB64",
        },
        {
          to: {
            name: "root/data/ClientResult",
          },
          text: "解析数据",
          ico: "\uEB64",
        },
        {
          to: {
            name: "root/data/redis",
          },
          text: "redis",
          ico: "\uEB64",
        },
        {
          to: {
            name: "root/data/oss",
          },
          text: "OSS",
          ico: "\uEB64",
        },
      ],
    },
    {
      title: "日志记录",
      ico: "el-icon-coin",
      child: [
        {
          to: {
            name: "root/log/node",
          },
          text: "节点日志",
          ico: "\uEB64",
        },
        {
          to: {
            name: "root/log/terminal",
          },
          text: "终端日志",
          ico: "\uEB64",
        },
        {
          to: {
            name: "root/log/sms",
          },
          text: "短信日志",
          ico: "\uEB8b",
        },
        {
          to: {
            name: "root/log/mail",
          },
          text: "邮件日志",
          ico: "\uEB8b",
        },
        {
          to: {
            name: "root/log/uartterminaldatatransfinites",
          },
          text: "告警日志",
          ico: "\uEB68",
        },
        {
          to: {
            name: "root/log/userlogins",
          },
          text: "用户登陆日志",
          ico: "\uEB6b",
        },
        {
          to: {
            name: "root/log/userrequsts",
          },
          text: "用户请求日志",
          ico: "\uEB8c",
        },
        {
          to: {
            name: "root/log/dataClean",
          },
          text: "数据清洗日志",
          ico: "\uEB8c",
        },
        {
          to: {
            name: "root/log/wEvent",
          },
          text: "微信推送事件日志",
          ico: "\uEB8c",
        },
        {
          to: {
            name: "root/log/wSubscribe",
          },
          text: "微信告警事件日志",
          ico: "\uEB8c",
        },
      ]
    }]

  const navMap = new Map(nav.map(el => el.child).flat().map(el => ['/' + el.to.name, el.text]))

  const loacl = useLocation()

  const path = useMemo(() => {
    const pathName = loacl.pathname.replace(/^\//, '').split("/")
    return pathName
  }, [loacl])


  const routers = useMemo(() => {
    return <>
      {
        nav.map(el =>
          <Menu.SubMenu key={el.title} title={el.title}>
            {
              el.child.map(child =>
                <Menu.Item key={child.text + el.title} >
                  <Link to={'/' + child.to.name}>{child.text}</Link>
                </Menu.Item>)
            }
          </Menu.SubMenu>)
      }
    </>
  }, [nav])

  const titles = useMemo(() => {
    return nav.map(el => el.title)
  }, [nav])

  return (
    <Layout className="layout" style={{ height: "100%" }}>
      <Layout.Sider width={200} className="site-layout-background" style={{ backgroundColor: "#011529", marginRight: 24 }}>
        <div style={{ padding: 12 }}>
          <Link to="/">
            <h2 color="#fff" style={{ color: "#fff" }}>百事服管理后台</h2>
            {/* <Image src="http://admin.ladishb.com/upload/LADS_witdh.png" preview={false} height={30}></Image> */}
          </Link>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          style={{ borderRight: 0 }}
        >
          {
            routers
          }
        </Menu>
      </Layout.Sider>
      <Layout style={{ height: "100%",overflow:"auto" }}>
        <section style={{ display: "flex", alignItems: 'center' }}>
          <Breadcrumb style={{ margin: '16px 0', marginLeft: 24 }}>
            {
              path.map((el, i) => <Breadcrumb.Item key={el + i}>{el}</Breadcrumb.Item>)
            }
          </Breadcrumb>
          <span style={{ marginLeft: 'auto', marginRight: 22 }}>
            <UserDropDown />
          </span>
        </section>
        <div className="content"
        >
          <Outlet />
        </div>
        <AbsButton>
          <Menu
            mode="inline"
            style={{ borderRight: 0 }}
            openKeys={titles}
          >
            {
              routers
            }
          </Menu>
        </AbsButton>
      </Layout>
    </Layout>
  )
}

export default RootMain