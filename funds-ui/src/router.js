import BasicInfo from './views/BasicInfo.vue';
import BasicInfoForm from './views/BasicInfoForm.vue'
import FundCalendar from './views/FundCalendar.vue'
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {path: '/', name: 'home', component: BasicInfo},
    {path: '/info/form', name: 'basicForm', component: BasicInfoForm},
    {path: '/calendar', name: 'fundCalendar', component: FundCalendar}
];

const router = createRouter({
    history: createWebHistory(),
    routes: routes
});

export default router;