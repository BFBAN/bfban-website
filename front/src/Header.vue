<template>
    <header>
        <router-link to="/">Home</router-link>

        <router-link to="/about">关于我们</router-link>
        <router-link to="/report">举报作弊</router-link>
        <router-link to="/list">外挂公示</router-link>

        <router-link to="/misc">Misc</router-link>

        <router-link to="/signin">登录</router-link>
        <router-link to="/signup">注册</router-link>
    </header>
</template>

<script>
export default {
    name: "Header"
}
</script>

