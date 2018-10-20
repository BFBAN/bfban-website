<template>
    <div class="container">
        <Header />

        <div>
            <!-- component match the router will render here -->
            <router-view></router-view>
        </div>

        <Footer />
    </div>
</template>

<script>
import Header from './Header.vue'
import Footer from './Footer.vue'

export default {
    components: {
        Header,
        Footer
    }
}
</script>

<style>
</style>

