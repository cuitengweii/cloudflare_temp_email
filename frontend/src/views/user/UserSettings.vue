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
            resetPolicyTitle: 'Password Reset',
            resetPolicyEnabled: 'Password reset is available through company email verification.',
            resetPolicyDisabled: 'Password reset is temporarily unavailable because email verification is disabled.',
            allowedDomainsTitle: 'Company Domains',
            logout: 'Logout',
            logoutConfirm: 'Are you sure you want to logout?',
            logoutSuccess: 'Logged out successfully.',
        },
        zh: {
            accountCenter: '账户中心',
            accountEmail: '员工账号',
            mailboxPolicyTitle: '邮箱分配规则',
            mailboxPolicy: '邮箱地址由管理员统一分配和管理，员工不能自行创建或绑定邮箱地址。',
            resetPolicyTitle: '密码重置',
            resetPolicyEnabled: '当前支持通过公司邮箱验证码重置密码。',
            resetPolicyDisabled: '当前未开启邮箱验证，暂时无法通过邮箱验证码重置密码。',
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

                <n-alert
                    :type="userOpenSettings.enableMailVerify ? 'success' : 'warning'"
                    :show-icon="false"
                    :bordered="false"
                >
                    <strong>{{ t('resetPolicyTitle') }}</strong>
                    <div class="setting-detail">
                        {{ userOpenSettings.enableMailVerify ? t('resetPolicyEnabled') : t('resetPolicyDisabled') }}
                    </div>
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
