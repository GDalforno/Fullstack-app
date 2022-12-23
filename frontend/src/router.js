import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Register from "./views/Register"
import Login from "./views/Login"
import Users from "./views/Users"
import Edit from "./views/Edit"
import axios from "axios";


function adminAuth(to, from, next) {
  if(localStorage.getItem("token") != undefined) {

    var req = {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      }
    }

    axios.post("http://localhost:8686/validate", {}, req).then(res => {
      res;
      next();
    }).catch(err => {
      console.log(err);
      next("/login");
    });

    next();
  } else {
    next("/login");
  }
}

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/admin/users',
      name: 'Users',
      component: Users,
      beforeEnter: adminAuth
    },
    {
      path: "/admin/users/edit/:id",
      name: "UsersEdit",
      component: Edit,
      beforeEnter: adminAuth
    }
  ]
})
