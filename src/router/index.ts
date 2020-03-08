import Vue from 'vue';
import VueRouter from 'vue-router';
import Index from '../views/Index';
import CourseCreate from '../views/course/create/CourseCreate';
import LessonPlay from '@/views/lesson/play/LessonPlay';
import LessonList from '@/views/lesson/list/LessonList';
import LessonCreate from '@/views/lesson/create/LessonCreate';
import LessonEdit from '@/views/lesson/edit/LessonEdit';
import LessonMd from '@/views/lesson/md/LessonMd';
import LessonLocalPlay from '@/views/lesson/localplay/LessonLocalPlay';
import Setting from '@/views/setting/Setting';
import CourseEdit from '@/views/course/edit/CourseEdit';
import About from '@/views/setting/about/About';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Index',
    component: Index,
  }, {
    path: '/course/create',
    name: 'CourseCreate',
    component: CourseCreate
  }, {
    path: '/course/edit',
    name: 'CourseEdit',
    component: CourseEdit
  }, {
    path: '/lesson/play',
    name: 'LessonPlay',
    component: LessonPlay
  }, {
    path: '/lesson/list',
    name: 'LessonList',
    component: LessonList
  }, {
    path: '/lesson/create',
    name: 'LessonCreate',
    component: LessonCreate
  }, {
    path: '/lesson/edit',
    name: 'LessonEdit',
    component: LessonEdit
  }, {
    path: '/lesson/md',
    name: 'LessonMd',
    component: LessonMd
  }, {
    path: '/lesson/local/play',
    name: 'LessonLocalPlay',
    component: LessonLocalPlay
  },{
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/setting',
    name: 'Setting',
    component: Setting
  }

];

const router = new VueRouter({
  routes,
});

export default router;
