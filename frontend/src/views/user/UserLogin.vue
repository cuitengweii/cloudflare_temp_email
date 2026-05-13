<script setup>
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { api } from '../../api';
import { useGlobalState } from '../../store';
import { hashPassword } from '../../utils';
import Turnstile from '../../components/Turnstile.vue';

const { userJwt, userOpenSettings, openSettings } = useGlobalState();
const message = useMessage();

const { t } = useI18n({
    messages: {
        en: {
            login: 'Login',
            email: 'Email',
            password: 'Password',
            pleaseInput: 'Please input email and password.',
            pleaseCompleteTurnstile: 'Please complete turnstile verification.',
            employeeLoginTip: 'Employee accounts are created by the administrator. Contact your administrator if you need an account or an initial password.',
            employeeResetTip: 'If you forget your password, contact your administrator to reset it and receive a new temporary password.',
            allowedDomainsTip: 'Company email domains: {domains}',
        },
        zh: {
            login: '\u767b\u5f55',
            email: '\u90ae\u7bb1',
            password: '\u5bc6\u7801',
            pleaseInput: '\u8bf7\u8f93\u5165\u90ae\u7bb1\u548c\u5bc6\u7801\u3002',
            pleaseCompleteTurnstile: '\u8bf7\u5b8c\u6210\u4eba\u673a\u9a8c\u8bc1\u3002',
            employeeLoginTip: '\u5458\u5de5\u8d26\u53f7\u7531\u7ba1\u7406\u5458\u7edf\u4e00\u521b\u5efa\u5e76\u4e0b\u53d1\u521d\u59cb\u5bc6\u7801\uff0c\u5982\u9700\u5f00\u901a\u8bf7\u8054\u7cfb\u7ba1\u7406\u5458\u3002',
            employeeResetTip: '\u5982\u679c\u9057\u5fd8\u5bc6\u7801\uff0c\u8bf7\u8054\u7cfb\u7ba1\u7406\u5458\u91cd\u7f6e\u5bc6\u7801\u5e76\u91cd\u65b0\u4e0b\u53d1\u4e34\u65f6\u5bc6\u7801\u3002',
            allowedDomainsTip: '\u516c\u53f8\u90ae\u7bb1\u57df\u540d\uff1a{domains}',
        }
    }
});

const user = reactive({
    email: '',
    password: '',
});

const loginCfToken = ref('');
const loginTurnstileRef = ref(null);

const allowedDomainsText = computed(() =>
    Array.isArray(userOpenSettings.value.allowedDomains)
        ? userOpenSettings.value.allowedDomains.join(', ')
        : ''
);

const emailLogin = async () => {
    if (!user.email || !user.password) {
        message.error(t('pleaseInput'));
        return;
    }
    try {
        const res = await api.fetch('/user_api/login', {
            method: 'POST',
            body: JSON.stringify({
                email: user.email,
                password: await hashPassword(user.password),
                cf_token: loginCfToken.value,
            })
        });
        userJwt.value = res.jwt;
        location.reload();
    } catch (error) {
        message.error(error.message || 'login failed');
        loginTurnstileRef.value?.refresh?.();
    }
};
</script>

<template>
    <div class="center">
        <n-skeleton v-if="!userOpenSettings.fetched" style="height: 320px; width: 100%;" />
        <n-tabs v-else value="signin" size="large" justify-content="space-evenly" class="auth-tabs">
            <n-tab-pane name="signin" :tab="t('login')">
                <n-form class="auth-form">
                    <n-alert type="info" :show-icon="false" :bordered="false" style="margin-bottom: 16px;">
                        <div>{{ t('employeeLoginTip') }}</div>
                        <div class="domain-hint">{{ t('employeeResetTip') }}</div>
                        <div v-if="allowedDomainsText" class="domain-hint">
                            {{ t('allowedDomainsTip', { domains: allowedDomainsText }) }}
                        </div>
                    </n-alert>
                    <n-form-item-row :label="t('email')" required>
                        <n-input v-model:value="user.email" />
                    </n-form-item-row>
                    <n-form-item-row :label="t('password')" required>
                        <n-input v-model:value="user.password" type="password" show-password-on="click" />
                    </n-form-item-row>
                    <Turnstile
                        v-if="openSettings.enableGlobalTurnstileCheck"
                        ref="loginTurnstileRef"
                        v-model:value="loginCfToken"
                    />
                    <n-button @click="emailLogin" type="primary" block secondary strong>
                        {{ t('login') }}
                    </n-button>
                </n-form>
            </n-tab-pane>
        </n-tabs>
    </div>
</template>

<style scoped>
.center {
    width: 100%;
}

.auth-tabs {
    width: 100%;
}

.auth-form {
    width: 100%;
    max-width: 520px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.auth-form :deep(.n-form-item),
.auth-form :deep(.n-form-item-row),
.auth-form :deep(.n-input),
.auth-form :deep(.n-input-wrapper),
.auth-form :deep(.n-base-selection),
.auth-form :deep(.n-button),
.auth-form :deep(.turnstile-container) {
    width: 100%;
}

.auth-form :deep(.n-alert-body__content) {
    text-align: center;
}

.domain-hint {
    margin-top: 8px;
}
</style>
