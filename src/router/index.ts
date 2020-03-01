import Vue from 'vue';
import VueRouter from 'vue-router';
import Index from '../views/Index';
import CourseCreate from '../views/course/create/CourseCreate';
import LessonPlay from '@/views/lesson/play/LessonPlay';
import LessonList from '@/views/lesson/list/LessonList';
import LessonCreate from '@/views/lesson/create/LessonCreate';
import LessonEdit from '@/views/lesson/edit/LessonEdit';
import LessonLocalPlay from '@/views/lesson/localplay/LessonLocalPlay';
import Setting from '@/views/setting/Setting';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Index',
    component: Index,
  },{
    path:'/course/create',
    name:'CourseCreate',
    component:CourseCreate
  },{
    path:'/lesson/play',
    name:'LessonPlay',
    component:LessonPlay
  },{
    path:'/lesson/list',
    name:'LessonList',
    component:LessonList
  },{
    path:'/lesson/create',
    name:'LessonCreate',
    component:LessonCreate
  },{
    path:'/lesson/edit',
    name:'LessonEdit',
    component:LessonEdit
  },{
    path:'/lesson/local/play',
    name:'LessonLocalPlay',
    component:LessonLocalPlay
  },
  {
    path:'/setting',
    name:'Setting',
    component:Setting
  },

  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
  // },

];

const router = new VueRouter({
  routes,
});

export default router;
