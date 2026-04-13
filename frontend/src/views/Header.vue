<script setup>
import { ref, h, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useIsMobile } from '../utils/composables'
import {
    DarkModeFilled, LightModeFilled, MenuFilled,
    AdminPanelSettingsFilled, MonitorHeartFilled
} from '@vicons/material'
import { GithubAlt, Language, User, Home } from '@vicons/fa'

import { useGlobalState } from '../store'
import { api } from '../api'
import { getRouterPathWithLang, hashPassword } from '../utils'
import Turnstile from '../components/Turnstile.vue'

const message = useMessage()
const notification = useNotification()

const {
    toggleDark, isDark, isTelegram, showAdminPage,
    showAuth, auth, loading, openSettings, userSettings
} = useGlobalState()
const route = useRoute()
const router = useRouter()
const isMobile = useIsMobile()

const showMobileMenu = ref(false)
const menuValue = computed(() => {
    if (route.path.includes("user")) return "user";
    if (route.path.includes("admin")) return "admin";
    return "home";
});

const cfToken = ref('')
const turnstileRef = ref(null)

const authFunc = async () => {
    try {
        await api.fetch('/open_api/site_login', {
            method: 'POST',
            body: JSON.stringify({
                password: await hashPassword(auth.value),
                cf_token: cfToken.value
            })
        });
        location.reload()
    } catch (error) {
        message.error(error.message || "error");
        turnstileRef.value?.refresh?.();
    }
}

const changeLocale = async (lang) => {
    if (lang == 'zh') {
        await router.push(route.fullPath.replace('/en', ''));
    } else {
        await router.push(`/${lang}${route.fullPath}`);
    }
}

const { locale, t } = useI18n({
    messages: {
        en: {
            title: 'GasGx Temp Email',
            dark: 'Dark',
            light: 'Light',
            accessHeader: 'Access Password',
            accessTip: 'Please enter the correct access password',
            home: 'Home',
            menu: 'Menu',
            user: 'User',
            status: 'Status',
            ok: 'OK',
        },
        zh: {
            title: 'GasGx临时邮件',
            dark: '暗色',
            light: '亮色',
            accessHeader: '访问密码',
            accessTip: '请输入站点访问密码',
            home: '主页',
            menu: '菜单',
            user: '用户',
            status: '状态',
            ok: '确定',
        }
    }
});

const version = import.meta.env.PACKAGE_VERSION ? `v${import.meta.env.PACKAGE_VERSION}` : "";

const menuOptions = computed(() => [
    {
        label: () => t('home'),
        key: "home",
        icon: () => h(NIcon, { component: Home }),
        show: true,
    },
    {
        label: () => t('user'),
        key: "user",
        icon: () => h(NIcon, { component: User }),
        show: !isTelegram.value,
    },
    {
        label: () => "Admin",
        key: "admin",
        icon: () => h(NIcon, { component: AdminPanelSettingsFilled }),
        show: showAdminPage.value,
    },
    {
        label: () => isDark.value ? t('light') : t('dark'),
        key: "theme",
        icon: () => h(NIcon, { component: isDark.value ? LightModeFilled : DarkModeFilled }),
    },
    {
        label: () => locale.value == 'zh' ? "English" : "中文",
        key: "lang",
        icon: () => h(NIcon, { component: Language }),
    },
    {
        label: () => t('status'),
        key: "status",
        icon: () => h(NIcon, { component: MonitorHeartFilled }),
        show: !!openSettings.value?.statusUrl,
    },
    {
        label: () => version || "Github",
        key: "github",
        icon: () => h(NIcon, { component: GithubAlt }),
        show: openSettings.value?.showGithub,
    }
]);

const handleMenuUpdate = async (key) => {
    showMobileMenu.value = false;
    if (key === 'home') {
        await router.push(getRouterPathWithLang('/', locale.value));
    } else if (key === 'user') {
        await router.push(getRouterPathWithLang("/user", locale.value));
    } else if (key === 'admin') {
        loading.value = true;
        await router.push(getRouterPathWithLang('/admin', locale.value));
        loading.value = false;
    } else if (key === 'theme') {
        toggleDark();
    } else if (key === 'lang') {
        locale.value == 'zh' ? await changeLocale('en') : await changeLocale('zh');
    } else if (key === 'status') {
        window.open(openSettings.value?.statusUrl, '_blank');
    } else if (key === 'github') {
        window.open("https://github.com/dreamhunter2333/cloudflare_temp_email", '_blank');
    }
};

useHead({
    title: () => openSettings.value.title || t('title'),
    meta: [
        { name: "description", content: openSettings.value.description || t('title') },
    ]
});

const logoClickCount = ref(0);
const logoClick = async () => {
    if (route.path.includes("admin")) {
        logoClickCount.value = 0;
        return;
    }
    if (logoClickCount.value >= 5) {
        logoClickCount.value = 0;
        message.info("Change to admin Page");
        loading.value = true;
        await router.push(getRouterPathWithLang('/admin', locale.value));
        loading.value = false;
    } else {
        logoClickCount.value++;
    }
    if (logoClickCount.value > 0) {
        message.info(`Click ${5 - logoClickCount.value + 1} times to enter the admin page`);
    }
}

onMounted(async () => {
    await api.getOpenSettings(message, notification);
    // make sure user_id is fetched
    if (!userSettings.value.user_id) await api.getUserSettings(message);
});
</script>

<template>
    <div>
        <n-page-header>
            <template #title>
                <h3>{{ openSettings.title || t('title') }}</h3>
            </template>
            <template #avatar>
                <div @click="logoClick" style="margin-left: 10px; cursor: pointer;">
                    <img src="/logo.svg" alt="logo" style="width: 40px; height: 40px;" />
                </div>
            </template>
            <template #extra>
                <n-space>
                    <n-menu v-if="!isMobile" mode="horizontal" :options="menuOptions" :value="menuValue" @update:value="handleMenuUpdate" responsive />
                    <n-button v-else :text="true" @click="showMobileMenu = !showMobileMenu" style="margin-right: 10px;">
                        <template #icon>
                            <n-icon :component="MenuFilled" />
                        </template>
                        {{ t('menu') }}
                    </n-button>
                </n-space>
            </template>
        </n-page-header>
        <n-drawer v-model:show="showMobileMenu" placement="top" style="height: 100vh;">
            <n-drawer-content :title="t('menu')" closable>
                <n-menu :options="menuOptions" :value="menuValue" @update:value="handleMenuUpdate" />
            </n-drawer-content>
        </n-drawer>
        <n-modal v-model:show="showAuth" :closable="false" :closeOnEsc="false" :maskClosable="false" preset="dialog"
            :title="t('accessHeader')">
            <p>{{ t('accessTip') }}</p>
            <n-input v-model:value="auth" type="password" show-password-on="click" />
            <Turnstile ref="turnstileRef" v-if="openSettings.enableGlobalTurnstileCheck" v-model:value="cfToken" />
            <template #action>
                <n-button :loading="loading" @click="authFunc" type="primary">
                    {{ t('ok') }}
                </n-button>
            </template>
        </n-modal>
    </div>
</template>

<style scoped>
.n-layout-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.n-alert {
    margin-top: 10px;
    margin-bottom: 10px;
    text-align: center;
}

.n-card {
    margin-top: 10px;
}

.center {
    display: flex;
    text-align: left;
    place-items: center;
    justify-content: center;
    margin: 20px;
}

.n-form .n-button {
    margin-top: 10px;
}
</style>
