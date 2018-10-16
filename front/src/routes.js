import Home from './Home.vue';
import About from './About.vue';
import Report from './Report.vue';
import Misc from './Misc.vue';
import List from './List.vue';
import Signin from './Signin.vue';
import Signup from './Signup.vue';


const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/report', component: Report },
  { path: '/misc', component: Misc },
  { path: '/list', component: List },

  { path: '/signin', component: Signin },
  { path: '/signup', component: Signup },

];

export default routes;
