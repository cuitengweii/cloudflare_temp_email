<script setup>
import { computed, ref } from 'vue'
import { useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'

import { useGlobalState } from '../../store'

const { userJwt, userSettings, userOpenSettings } = useGlobalState()
const message = useMessage()
const showLogout = ref(false)

const { t } = useI18n({
    messages: {
        en: {
            accountCenter: 'Account Center',
            accountEmail: 'Employee Account',
            mailboxPolicyTitle: 'Mailbox Assignment',
            mailboxPolicy: 'Mailbox addresses are assigned and managed by administrators. Employees cannot create or bind addresses themselves.',
            resetPolicyTitle: 'Forgotten Passwords',
            resetPolicy: 'If you forget your password, contact the administrator to reset it and send you a new temporary password. After logging in, you can still change your password yourself from the account page.',
            allowedDomainsTitle: 'Company Domains',
            logout: 'Logout',
            logoutConfirm: 'Are you sure you want to logout?',
            logoutSuccess: 'Logged out successfully.',
        },
        zh: {
            accountCenter: '账户中心',
            accountEmail: '员工账号',
            mailboxPolicyTitle: '邮箱分配规则',
            mailboxPolicy: '邮箱地址由管理员统一分配和管理，员工不能自行创建或绑定地址。',
            resetPolicyTitle: '忘记密码处理',
            resetPolicy: '如果遗忘密码，请联系管理员重置并重新下发临时密码。员工登录后仍可在账户页自行修改密码。',
            allowedDomainsTitle: '公司域名',
            logout: '退出登录',
            logoutConfirm: '确认退出当前登录状态吗？',
            logoutSuccess: '已退出登录。',
        }
    }
})

const allowedDomainsText = computed(() =>
    Array.isArray(userOpenSettings.value.allowedDomains)
        ? userOpenSettings.value.allowedDomains.join(', ')
        : ''
)

const logout = async () => {
    userJwt.value = ''
    message.success(t('logoutSuccess'))
    location.href = '/'
}
</script>

<template>
    <div class="center" v-if="userSettings.user_email">
        <n-card embedded :bordered="false">
            <n-space vertical size="large">
                <n-page-header>
                    <template #title>
                        {{ t('accountCenter') }}
                    </template>
                </n-page-header>

                <n-descriptions bordered :column="1" label-placement="left">
                    <n-descriptions-item :label="t('accountEmail')">
                        {{ userSettings.user_email }}
                    </n-descriptions-item>
                    <n-descriptions-item :label="t('allowedDomainsTitle')">
                        {{ allowedDomainsText || '-' }}
                    </n-descriptions-item>
                </n-descriptions>

                <n-alert type="info" :show-icon="false" :bordered="false">
                    <strong>{{ t('mailboxPolicyTitle') }}</strong>
                    <div class="setting-detail">{{ t('mailboxPolicy') }}</div>
                </n-alert>

                <n-alert type="warning" :show-icon="false" :bordered="false">
                    <strong>{{ t('resetPolicyTitle') }}</strong>
                    <div class="setting-detail">{{ t('resetPolicy') }}</div>
                </n-alert>

                <n-button type="warning" secondary block strong @click="showLogout = true">
                    {{ t('logout') }}
                </n-button>
            </n-space>
        </n-card>

        <n-modal v-model:show="showLogout" preset="dialog" :title="t('logout')">
            <p>{{ t('logoutConfirm') }}</p>
            <template #action>
                <n-button tertiary type="warning" @click="logout">
                    {{ t('logout') }}
                </n-button>
            </template>
        </n-modal>
    </div>
</template>

<style scoped>
.center {
    display: flex;
    justify-content: center;
}

.n-card {
    max-width: 800px;
    width: 100%;
    text-align: left;
}

.setting-detail {
    margin-top: 8px;
}
</style>
