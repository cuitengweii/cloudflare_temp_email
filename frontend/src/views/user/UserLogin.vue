<script setup>
import { computed, ref } from 'vue';
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
            verifyCode: 'Verification Code',
            verifyCodeSent: 'Verification code sent and will expire in {timeout} seconds.',
            waitforVerifyCode: 'Wait {timeout}s',
            sendVerificationCode: 'Send Verification Code',
            forgotPassword: 'Forgot Password',
            cannotForgotPassword: 'Password reset is unavailable until employee email verification is enabled.',
            resetPassword: 'Reset Password',
            pleaseInput: 'Please input email and password.',
            pleaseInputEmail: 'Please input email.',
            pleaseInputCode: 'Please input verification code.',
            pleaseCompleteTurnstile: 'Please complete turnstile verification.',
            invalidCompanyEmail: 'Only company email domains are allowed: {domains}',
            employeeLoginTip: 'Employee accounts are created by the administrator. Contact your administrator if you need an account or an initial password.',
            allowedDomainsTip: 'Company email domains: {domains}',
            verificationUnavailableTip: 'Password reset is disabled until employee email verification is enabled by the administrator.',
            passwordResetSuccess: 'Password reset complete. Please login with the new password.',
            resetEmailTip: 'The verification code will be sent to this employee mailbox.',
        },
        zh: {
            login: '\u767b\u5f55',
            email: '\u90ae\u7bb1',
            password: '\u5bc6\u7801',
            verifyCode: '\u9a8c\u8bc1\u7801',
            verifyCodeSent: '\u9a8c\u8bc1\u7801\u5df2\u53d1\u9001\uff0c{timeout} \u79d2\u540e\u5931\u6548\u3002',
            waitforVerifyCode: '\u7b49\u5f85 {timeout} \u79d2',
            sendVerificationCode: '\u53d1\u9001\u9a8c\u8bc1\u7801',
            forgotPassword: '\u5fd8\u8bb0\u5bc6\u7801',
            cannotForgotPassword: '\u7ba1\u7406\u5458\u5c1a\u672a\u5f00\u542f\u5458\u5de5\u90ae\u7bb1\u9a8c\u8bc1\uff0c\u76ee\u524d\u65e0\u6cd5\u91cd\u7f6e\u5bc6\u7801\u3002',
            resetPassword: '\u91cd\u7f6e\u5bc6\u7801',
            pleaseInput: '\u8bf7\u8f93\u5165\u90ae\u7bb1\u548c\u5bc6\u7801\u3002',
            pleaseInputEmail: '\u8bf7\u8f93\u5165\u90ae\u7bb1\u3002',
            pleaseInputCode: '\u8bf7\u8f93\u5165\u9a8c\u8bc1\u7801\u3002',
            pleaseCompleteTurnstile: '\u8bf7\u5b8c\u6210\u4eba\u673a\u9a8c\u8bc1\u3002',
            invalidCompanyEmail: '\u4ec5\u5141\u8bb8\u4f7f\u7528\u516c\u53f8\u90ae\u7bb1\u57df\u540d\uff1a{domains}',
            employeeLoginTip: '\u5458\u5de5\u8d26\u53f7\u7531\u7ba1\u7406\u5458\u7edf\u4e00\u521b\u5efa\u5e76\u4e0b\u53d1\u521d\u59cb\u5bc6\u7801\uff0c\u5982\u9700\u5f00\u901a\u8bf7\u8054\u7cfb\u7ba1\u7406\u5458\u3002',
            allowedDomainsTip: '\u516c\u53f8\u90ae\u7bb1\u57df\u540d\uff1a{domains}',
            verificationUnavailableTip: '\u7ba1\u7406\u5458\u5c1a\u672a\u5f00\u542f\u5458\u5de5\u90ae\u7bb1\u9a8c\u8bc1\uff0c\u76ee\u524d\u65e0\u6cd5\u627e\u56de\u5bc6\u7801\u3002',
            passwordResetSuccess: '\u5bc6\u7801\u5df2\u91cd\u7f6e\uff0c\u8bf7\u4f7f\u7528\u65b0\u5bc6\u7801\u767b\u5f55\u3002',
            resetEmailTip: '\u9a8c\u8bc1\u7801\u4f1a\u53d1\u9001\u5230\u8be5\u5458\u5de5\u90ae\u7bb1\u5185\u3002',
        }
    }
});

const showResetModal = ref(false);
const user = ref({
    email: '',
    password: '',
    code: '',
});

const resetCfToken = ref('');
const loginCfToken = ref('');
const resetTurnstileRef = ref(null);
const loginTurnstileRef = ref(null);

const verifyCodeExpire = ref(0);
const verifyCodeTimeout = ref(0);

const canUsePasswordReset = computed(() => userOpenSettings.value.enableMailVerify);
const allowedDomainsText = computed(() =>
    Array.isArray(userOpenSettings.value.allowedDomains)
        ? userOpenSettings.value.allowedDomains.join(', ')
        : ''
);

const getVerifyCodeTimeout = () => {
    if (!verifyCodeExpire.value || verifyCodeExpire.value < Date.now()) return 0;
    return Math.round((verifyCodeExpire.value - Date.now()) / 1000);
};

const validateCompanyEmail = () => {
    if (!user.value.email) {
        return t('pleaseInputEmail');
    }
    const allowedDomains = Array.isArray(userOpenSettings.value.allowedDomains)
        ? userOpenSettings.value.allowedDomains
        : [];
    if (!allowedDomains.length) {
        return '';
    }
    const mailDomain = String(user.value.email).split('@')[1]?.trim().toLowerCase();
    if (!mailDomain || !allowedDomains.includes(mailDomain)) {
        return t('invalidCompanyEmail', { domains: allowedDomainsText.value });
    }
    return '';
};

const resetVerifyCodeCountdown = (expirationTtl) => {
    verifyCodeExpire.value = Date.now() + expirationTtl * 1000;
    verifyCodeTimeout.value = expirationTtl;
    const intervalId = setInterval(() => {
        verifyCodeTimeout.value = getVerifyCodeTimeout();
        if (verifyCodeTimeout.value <= 0) {
            clearInterval(intervalId);
            verifyCodeTimeout.value = 0;
        }
    }, 1000);
};

const openResetPasswordModal = () => {
    if (!canUsePasswordReset.value) {
        message.error(t('cannotForgotPassword'));
        return;
    }
    user.value.code = '';
    user.value.password = '';
    showResetModal.value = true;
};

const emailLogin = async () => {
    if (!user.value.email || !user.value.password) {
        message.error(t('pleaseInput'));
        return;
    }
    try {
        const res = await api.fetch('/user_api/login', {
            method: 'POST',
            body: JSON.stringify({
                email: user.value.email,
                password: await hashPassword(user.value.password),
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

const sendVerificationCode = async () => {
    if (!canUsePasswordReset.value) {
        message.error(t('cannotForgotPassword'));
        return;
    }
    const emailError = validateCompanyEmail();
    if (emailError) {
        message.error(emailError);
        return;
    }
    if (openSettings.value.enableGlobalTurnstileCheck && !resetCfToken.value) {
        message.error(t('pleaseCompleteTurnstile'));
        return;
    }
    try {
        const res = await api.fetch('/user_api/verify_code', {
            method: 'POST',
            body: JSON.stringify({
                email: user.value.email,
                cf_token: resetCfToken.value,
            })
        });
        if (res?.expirationTtl) {
            message.success(t('verifyCodeSent', { timeout: res.expirationTtl }));
            resetVerifyCodeCountdown(res.expirationTtl);
        }
    } catch (error) {
        message.error(error.message || 'send verification code failed');
    }
    resetTurnstileRef.value?.refresh?.();
};

const resetPasswordByCode = async () => {
    if (!canUsePasswordReset.value) {
        message.error(t('cannotForgotPassword'));
        return;
    }
    if (!user.value.email || !user.value.password) {
        message.error(t('pleaseInput'));
        return;
    }
    const emailError = validateCompanyEmail();
    if (emailError) {
        message.error(emailError);
        return;
    }
    if (!user.value.code) {
        message.error(t('pleaseInputCode'));
        return;
    }
    if (openSettings.value.enableGlobalTurnstileCheck && !resetCfToken.value) {
        message.error(t('pleaseCompleteTurnstile'));
        return;
    }
    try {
        await api.fetch('/user_api/register', {
            method: 'POST',
            body: JSON.stringify({
                email: user.value.email,
                password: await hashPassword(user.value.password),
                code: user.value.code,
                cf_token: resetCfToken.value,
            }),
            message,
        });
        user.value.code = '';
        user.value.password = '';
        showResetModal.value = false;
        message.success(t('passwordResetSuccess'));
    } catch (error) {
        message.error(error.message || 'reset password failed');
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
                    <n-button @click="openResetPasswordModal" type="info" quaternary size="tiny">
                        {{ t('forgotPassword') }}
                    </n-button>
                    <n-alert
                        v-if="!canUsePasswordReset"
                        type="warning"
                        :show-icon="false"
                        :bordered="false"
                        style="margin-top: 16px;"
                    >
                        {{ t('verificationUnavailableTip') }}
                    </n-alert>
                </n-form>
            </n-tab-pane>
        </n-tabs>

        <n-modal v-model:show="showResetModal" preset="dialog" :title="t('resetPassword')">
            <n-space vertical>
                <n-alert type="info" :show-icon="false" :bordered="false">
                    <div>{{ t('resetEmailTip') }}</div>
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
                <n-form-item-row :label="t('verifyCode')" required>
                    <n-input-group>
                        <n-input v-model:value="user.code" />
                        <n-button
                            type="primary"
                            secondary
                            strong
                            :disabled="verifyCodeTimeout > 0"
                            @click="sendVerificationCode"
                        >
                            {{
                                verifyCodeTimeout > 0
                                    ? t('waitforVerifyCode', { timeout: verifyCodeTimeout })
                                    : t('sendVerificationCode')
                            }}
                        </n-button>
                    </n-input-group>
                </n-form-item-row>
                <Turnstile
                    v-if="openSettings.enableGlobalTurnstileCheck"
                    ref="resetTurnstileRef"
                    v-model:value="resetCfToken"
                />
            </n-space>
            <template #action>
                <n-button type="primary" @click="resetPasswordByCode">
                    {{ t('resetPassword') }}
                </n-button>
            </template>
        </n-modal>
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
}

.domain-hint {
    margin-top: 8px;
}
</style>
