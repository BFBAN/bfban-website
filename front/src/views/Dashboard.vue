<template>
  <div class="container">
    <div class="content">
      <div v-if="isAdmin">
        <h1>
          管理后台
        </h1>

        <h3 style="color: #ed4014;">
          请各管理员谨慎使用管理功能，在 人人平等，言论自由 的前提下，尽量只对发动、恶意、诋毁、辱骂等内容进行删除。

        </h3>
        <h3 style="color: #ed4014;">
          勿滥用！！莫忘初心！！
        </h3>

        <h2>封禁用户 uid 搜索、编辑</h2>
        <Form inline>
          <FormItem>
            <Input v-model="userUId" placeholder="uid" />
          </FormItem>
          <FormItem>
            <Button>搜索</Button>
          </FormItem>
        </Form>

        <div>
          <ButtonGroup>
            <Button>封禁用户</Button>
            <Button>解禁用户</Button>
          </ButtonGroup>

          <ButtonGroup>
            <Button>设为普通管理员</Button>
            <Button>取消普通管理员</Button>
          </ButtonGroup>

        </div>

        <h2>cheaters ouid 搜索、编辑</h2>
        <Form inline>
          <FormItem>
            <Input placeholder="ouid" />
          </FormItem>
          <FormItem>
            <Button>搜索</Button>
          </FormItem>
        </Form>

        <p>被举报的游戏：</p>
        <Checkbox>bf1</Checkbox>
        <Checkbox>bfv</Checkbox>

        <p>举报记录：</p>
        <Checkbox v-for=""></Checkbox>

        <p>管理员处理记录：</p>
        <Checkbox v-for=""></Checkbox>

        <h2>管理员操作日志</h2>


      </div>
      <div v-else>404</div>

    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        userUId: '',
      }
    },
    computed: {
      isAdmin() {
        const user = this.$store.state.user;

        const is = user ? user.userPrivilege !== 'normal' : false;
        return Boolean(is);
      },
    }
  }
</script>
