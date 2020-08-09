<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRolesBtn">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom vcenter', i1 === 0 ? 'bdtop' : '']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag @close="removeRightById(scope.row, item1.id)" closable>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级三级权限 -->
              <el-col :span="19">
                <!-- 通过for 循环渲染二级权限 -->
                <el-row :class="['bdbottom', i2 === 0 ? 'bdtop' : 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag @close="removeRightById(scope.row, item2.id)" closable type="success">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag @close="removeRightById(scope.row, item3.id)" closable type="warning" v-for="item3 in item2.children" :key="item3.id">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column labe="角色名称" prop="roleName"></el-table-column>
        <el-table-column labe="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column labe="操作" width="300px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" @click="showEdit(scope.row.id)" size="mini" icon="el-icon-edit">编辑</el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" @click="removeRolesById(scope.row.id)" icon="el-icon-delete" size="mini">删除</el-button>
            <!-- 分配角色按钮 -->
            <el-button @click="showSetRightDialog(scope.row)" type="warning" icon="el-icon-setting" size="mini">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      @close="addDialogClosed"
      :visible.sync="addDialogVisible"
      width="50%">
      <!-- 内容主体区域 -->
      <el-form label-position="right" :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 内容底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色的对话框-->
    <el-dialog
      title="添加用户"
      @close="editDialogClosed"
      :visible.sync="editDialogVisible"
      width="50%">
      <!-- 内容主体区域 -->
      <el-form label-position="right" :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 内容底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      @close="rightClosed"
      :visible.sync="rightDialogVisible"
      width="50%">
      <!-- 树形控件区域 -->
      <el-tree ref="treeRef" :default-checked-keys="defKeys" default-expand-all node-key="id" show-checkbox :data="rightsList" :props="treeProps"></el-tree>
      <!-- 内容底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有角色列表数据
      roleList: [],
      // 控制角色对话框的显示与否
      addDialogVisible: false,
      // 添加角色数据表单
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色表单验证规则对象
      addFormRules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
      },
      // 控制修改角色对话框的显示与隐藏
      editDialogVisible: false,
      // 修改角色信息表单
      editForm: '',
      // 修改角色表单验证规则对象
      editFormRules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
      },
      // 控制分配权限对话框的展示与否
      rightDialogVisible: false,
      // 所有权限列表
      rightsList: [],
      // 树形控件的参数
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 树形控件的id默认选中值
      defKeys: [],
      // 当前选中的角色ID
      roleId: ''
    }
  },
  created () {
    // 获取角色列表数据
    this.getRolesList()
  },
  methods: {
    // 获取角色列表函数
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.roleList = res.data
    },
    // 点击添加用户按钮事件
    addRolesBtn () {
      this.addDialogVisible = true
    },
    // 监听添加角色对话框关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加角色
    addRoles () {
      this.$refs.addFormRef.validate(async vaild => {
        if (!vaild) return
        // 可以发起角色添加请求
        const { data: res } = await this.$http.post('/roles', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加角色失败')
        this.$message.success('添加角色成功')
        // 隐藏添加角色对话框 刷新页面
        this.addDialogVisible = false
        this.getRolesList()
      })
    },
    // 展示修改用户的对话框
    async showEdit (id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('获取角色信息失败')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 修改角色信息
    editRoles () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, { roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc })
        if (res.meta.status !== 200) return this.$message.error('修改角色信息失败')
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新页面
        this.getRolesList()
        this.$message.success('修改角色信息成功')
        this.$refs.editFormRef.resetFields()
      })
    },
    // 监听修改角色对话框关闭事件
    editDialogClosed () {
      this.editDialogVisible = false
    },
    // 点击删除按钮，提示用户是否删除
    async removeRolesById (id) {
      const confirmRes = await this.$confirm('此操作将永久删除此角色，是否继续？', '提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        type: 'warning'
      }).catch(err => err)
      // 用户确认删除，返回字符串confirm
      // 用户取消，返回字符串cancel
      // console.log(confirmRes)
      if (confirmRes !== 'confirm') return this.$message.info('已取消了删除')
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败')
      this.$message.success('删除角色成功')
      this.getRolesList()
    },
    // 移除权限
    async removeRightById (row, id) {
      const confirmRes = await this.$confirm('此操作将永久删除此权限，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        showCancelButton: true,
        type: 'warning'
      }).catch(err => err)
      // 用户确认删除，返回字符串confirm
      // 用户取消，返回字符串cancel
      // console.log(confirmRes)
      if (confirmRes !== 'confirm') return this.$message.info('已取消了删除')
      const { data: res } = await this.$http.delete(`roles/${row.id}/rights/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除权限成功')
      row.children = res.data
    },
    // 展示分配权限对话框
    async showSetRightDialog (row) {
      // 获取所有权限列表
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
      this.rightsList = res.data
      this.roleId = row.id
      // 递归获取三级节点的id
      this.getLeafKeys(row, this.defKeys)
      this.rightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限id 保存到本地
    getLeafKeys (node, arr) {
      // 如果当前 node 节点 不包含 children 属性 则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框的关闭事件
    rightClosed () {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async setRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error('分配权限失败')
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.rightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin-top: 7px;
  margin-right: 10px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
