<template>
    <div class="container">
        <header>
            <router-link to="/">Home</router-link>

            <router-link to="/about">About</router-link>
            <router-link to="/report">Report</router-link>
            <router-link to="/list">List</router-link>

            <router-link to="/misc">Misc</router-link>

            <router-link to="/signin">登录</router-link>
            <router-link to="/signup">注册</router-link>
        </header>

        <div>
            <!-- component match the router will render here -->
            <router-view></router-view>
        </div>

        <footer>
            written by <a href="">fxodo</a>
        </footer>
    </div>
</template>

<script>
export default {

}
</script>

<style>
</style>

