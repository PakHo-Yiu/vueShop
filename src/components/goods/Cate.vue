<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button class="addBtn" type="primary" @click="showAdd">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table border :show-row-hover="false" index-text="#" show-index :expand-type="false" :data="cateList" :columns="columns" :selection-type="false">
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" style="color: lightgreen" v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag size="mini" v-else type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button @click="editGoods(scope.row)" type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button @click="removeGoods(scope.row.cat_id)" type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[3,5,10,15]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加商品分类对话框 -->
    <el-dialog
      title="添加商品分类"
      @close="addDialogClosed"
      :visible.sync="addDialogVisible"
      width="50%">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <!-- 级联选择器 -->
        <el-form-item label="父级分类：">
          <el-cascader clearable change-on-select size="mini" @change="parentCateChanged" :props="cascaderProps" v-model="selectedKey" expand-trigger="hover" :options="parentCateList"></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 内容底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改商品分类对话框 -->
    <el-dialog
      title="修改商品分类"
      @close="editDialogClosed"
      :visible.sync="editDialogVisible"
      width="50%">
      <!-- 内容主体区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 内容底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类的数据列表
      cateList: [],
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 数据总数量
      total: 0,
      // 为树形table定义列
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      }, {
        label: '是否有效',
        // 是否将此列作为模板列
        type: 'template',
        // 模板名称
        template: 'isok'
      }, {
        label: '排序',
        // 是否将此列作为模板列
        type: 'template',
        // 模板名称
        template: 'order'
      }, {
        label: '操作',
        // 是否将此列作为模板列
        type: 'template',
        // 模板名称
        template: 'opt'
      }],
      // 控制添加分类对话框的显示与否
      addDialogVisible: false,
      // 添加分类表单
      addForm: {
        // 将要添加分类的名称
        cat_name: '',
        // 父级分类的 id
        cat_pid: 0,
        // 将要添加分类的层级 0-2
        cat_level: 0
      },
      // 将要添加分类表单验证规则对象
      addFormRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      // 一级二级分类列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类id
      selectedKey: '',
      // 修改分类信息表单
      editForm: {},
      // 控制修改分类对话框的显示与否
      editDialogVisible: false,
      // 修改分类表单验证规则对象
      editFormRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      this.cateList = res.data.result
      // console.log(this.cateList)
      this.total = res.data.total
    },
    // 监听 pagesize 改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听 pagenum 改变
    handleCurrentChange (newCurrent) {
      this.queryInfo.pagenum = newCurrent
      this.getCateList()
    },
    // 监听添加商品分类对话框关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
      this.selectedKey = []
      this.addForm.cat_level = 0
      this.addForm.cat_pid = 0
      this.addDialogVisible = false
    },
    // 监听点击添加分类按钮
    showAdd () {
      this.getParentCateList()
      this.addDialogVisible = true
    },
    // 获取一级二级分类列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类失败')
      this.parentCateList = res.data
      // console.log(this.parentCateList)
    },
    // 监听级联选择器改变事件
    parentCateChanged () {
      // 如果 selectedKey.length 大于 0，则选中了父级分类
      // 反之，说明没有选中
      if (this.selectedKey.length > 0) {
        // 父级分类的id
        this.addForm.cat_pid = this.selectedKey[this.selectedKey.length - 1]
        // 为当前的等级赋值
        this.addForm.cat_level = this.selectedKey.length
        return 0
      } else {
        // 父级分类的id
        this.addForm.cat_pid = 0
        // 为当前的等级赋值
        this.addForm.cat_level = 0
      }
    },
    // 点击确定按钮 添加分类
    addCate () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addDialogVisible = false
      })
    },
    // 点击修改分类按钮
    async editGoods (row) {
      console.log(row.cat_id)
      const { data: res } = await this.$http.get('categories/' + row.cat_id)
      if (res.meta.status !== 200) return this.$message.error('获取分类信息失败')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听修改分类的对话框关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
      this.editDialogVisible = false
    },
    // 点击确定后修改分类
    editCate () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写分类名称')
        console.log(this.editForm)
        const { data: res } = await this.$http.put('categories/' + this.editForm.cat_id, { cat_name: this.editForm.cat_name })
        if (res.meta.status !== 200) return this.$message.error('修改分类信息失败')
        this.$message.success('修改分类成功')
        this.getCateList()
        this.editDialogVisible = false
      })
    },
    // 点击删除按钮
    async removeGoods (id) {
      const confirmRes = await this.$confirm('此操作将永久删除此分类，是否继续？', '提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        type: 'warning'
      }).catch(err => err)
      // 用户确认删除，返回字符串confirm
      // 用户取消，返回字符串cancel
      // console.log(confirmRes)
      if (confirmRes !== 'confirm') return this.$message.info('已取消了删除')
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除分类失败')
      this.$message.success('删除分类成功')
      this.getCateList()
    }
  }
}
</script>

<style scoped>
.addBtn {
  margin-bottom: 15px;
}

.el-cascader {
  width: 100%;
}
</style>
