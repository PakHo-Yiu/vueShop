<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 警告消息 -->
      <el-alert show-icon="" type="warning" :closable="false" title="注意：只允许为第三级分类设置相关参数!"></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader clearable size="mini" @change="cateChanged" :props="cateProps" v-model="selectedKey" expand-trigger="hover" :options="cateList"></el-cascader>
          <!-- 标签页区域 -->
          <el-tabs v-model="activeName" @tab-click="handleTabClick">
            <!-- 添加动态参数面板 -->
            <el-tab-pane label="动态参数" name="many">
              <el-button @click="addDialogVisible = true" :disabled="isBtnDisabled" type="primary" size="mini">添加参数</el-button>
              <!-- 动态参数表格 -->
              <el-table :data="manyTableData" border stripe>
                <!-- 展开行 -->
                <el-table-column type="expand">
                  <template slot-scope="scope">
                    <el-tag @close="handleClose(i, scope.row)" closable v-for="(item, i) in scope.row.attr_vals" :key="i">
                      {{item}}
                    </el-tag>
                    <!-- 输入框 -->
                    <el-input
                      class="input-new-tag"
                      v-if="scope.row.inputVisible"
                      v-model="scope.row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)"
                    >
                    </el-input>
                    <!-- 添加按钮 -->
                    <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                  </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button @click="showEditDialog(scope.row.attr_id)" size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                    <el-button @click="removeParams(scope.row.att_id)" size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <!-- 添加静态属性面板 -->
            <el-tab-pane label="静态属性" name="only">
              <el-button @click="addDialogVisible = true" :disabled="isBtnDisabled" type="primary" size="mini">添加属性</el-button>
              <!-- 静态属性表格 -->
              <el-table :data="onlyTableData" border stripe>
                <!-- 展开行 -->
                <el-table-column type="expand">
                  <template slot-scope="scope">
                    <el-tag @close="handleClose(i, scope.row)" closable v-for="(item, i) in scope.row.attr_vals" :key="i">
                      {{item}}
                    </el-tag>
                    <!-- 输入框 -->
                    <el-input
                      class="input-new-tag"
                      v-if="scope.row.inputVisible"
                      v-model="scope.row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)"
                    >
                    </el-input>
                    <!-- 添加按钮 -->
                    <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                  </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button @click="showEditDialog(scope.row.attr_id)" size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                    <el-button @click="removeParams(scope.row.att_id)" size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      @close="addDialogClosed"
      :visible.sync="addDialogVisible"
      width="50%">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 内容底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      @close="editDialogClosed"
      :visible.sync="editDialogVisible"
      width="50%">
      <!-- 内容主体区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 内容底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择框的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框绑定的数据
      selectedKey: '',
      // 被激活的标签页名称
      activeName: 'many',
      // 动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      // 控制添加参数对话框的显示与否
      addDialogVisible: false,
      // 添加参数表单
      addForm: {},
      // 添加参数表单验证规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ]
      },
      // 控制修改参数对话框的显示与否
      editDialogVisible: false,
      // 修改参数表单
      editForm: {},
      // 修改参数表单验证规则对象
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ]
      },
      // 控制按钮和文本框的显示与否
      inputVisible: false,
      // 文本框的值
      inputValue: ''
    }
  },
  computed: {
    // 如果按钮需要被禁用，返回true，反之返回false
    isBtnDisabled () {
      if (this.selectedKey.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的分类id
    cateId () {
      if (this.selectedKey.length === 3) {
        return this.selectedKey[2]
      }
      return null
    },
    // 当前打开的对话框文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  },
  created () {
    // 获取商品分类
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取分类列表失败')
      this.cateList = res.data
    },
    // 监听级联选择框改变事件
    cateChanged () {
      this.getParamsData()
    },
    // 获取参数列表数据
    async getParamsData () {
      // 所选分类不为三级分类
      if (this.selectedKey.length !== 3) {
        this.selectedKey = []
        this.manyTableData = []
        this.onlyTableData = []
        return false
      }
      // 所选分类为三级分类 获取数据
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: { sel: this.activeName }
      })
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
      res.data.forEach(item => {
        // 将标签存入数组中渲染
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : ''
        // 控制文本框的显示与否
        item.inputVisible = false
        // 文本框的值
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 标签页被点击事件
    handleTabClick () {
      this.getParamsData()
    },
    // 监听对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定后添加参数
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请输入参数名称')
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, { attr_name: this.addForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 201) return this.$message.error('添加参数失败')
        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 点击修改按钮 展示对话框
    async showEditDialog (id) {
      // 查询当前参数信息
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, {
        params: { attr_sel: this.activeName }
      })
      if (res.meta.status !== 200) return this.$message.error('获取参数失败')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听修改参数对话框的关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 点击确定后 修改参数
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请输入参数名称')
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, { attr_name: this.editForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 200) return this.$message.error('添加参数失败')
        this.$message.success('修改参数成功')
        this.editDialogVisible = false
        this.getParamsData()
      })
    },
    // 点击删除按钮
    async removeParams (id) {
      const confirmRes = await this.$confirm('此操作将永久删除此用户，是否继续？', '提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        type: 'warning'
      }).catch(err => err)
      // 用户确认删除，返回字符串confirm
      // 用户取消，返回字符串cancel
      // console.log(confirmRes)
      if (confirmRes !== 'confirm') return this.$message.info('已取消了删除')
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除参数失败')
      this.$message.success('删除参数成功')
      this.getParamsData()
    },
    // 文本框失去焦点或键盘enter触发事件
    handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return false
      }
      // 如果没有返回出去 则进行数据处理
      if (row.attr_vals === '') row.attr_vals = []
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    // 将对 attr_vals 的操作保存到数据库
    async saveAttrVals (row) {
      // 发起请求 保存数据
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, { attr_name: row.attr_name, attr_sel: this.activeName, attr_vals: row.attr_vals.join(' ') })
      if (res.meta.status !== 200) return this.$message.error('修改参数项失败')
      this.$message.success('修改参数项成功')
    },
    // 点击按钮 显示文本框
    showInput (row) {
      row.inputVisible = true
      // 文本框自动获得焦点
      // nextTick 当页面上元素被更新渲染后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除相应的参数项
    handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  }
}
</script>

<style scoped>
.cat_opt {
  margin: 10px 0;
}

.el-tag {
  margin: 10px;
}

.input-new-tag{
  width: 30px;
}
</style>
