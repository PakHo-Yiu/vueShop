import Vue from 'vue'
import { MessageBox, Dialog, Pagination, Tooltip, Switch, Table, TableColumn, Row, Col, Card, Button, Form, FormItem, Input, Message, Container, Header, Aside, Main, Menu, Submenu, MenuItem, Breadcrumb, BreadcrumbItem } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(TableColumn)
Vue.use(Table)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)

Vue.prototype.$confirm = MessageBox
Vue.prototype.$message = Message