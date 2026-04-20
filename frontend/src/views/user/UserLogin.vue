<script setup>
import { computed, ref } from 'vue'
import { useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'

import { api } from '../../api'
import { useGlobalState } from '../../store'
import { hashPassword } from '../../utils'
import Turnstile from '../../components/Turnstile.vue'

const { userJwt, userOpenSettings, openSettings } = useGlobalState()
const message = useMessage()

const { t } = useI18n({
    messages: {
        en: {
            login: 'Login',
            register: 'Register',
            email: 'Email',
            password: 'Password',
            verifyCode: 'Verification Code',
            verifyCodeSent: 'Verification code sent and will expire in {timeout} seconds.',
            waitforVerifyCode: 'Wait {timeout}s',
            sendVerificationCode: 'Send Verification Code',
            forgotPassword: 'Forgot Password',
            cannotForgotPassword: 'Email verification is not available. Please contact your administrator.',
            resetPassword: 'Reset Password',
            pleaseInput: 'Please input email and password.',
            pleaseInputEmail: 'Please input email.',
            pleaseInputCode: 'Please input verification code.',
            pleaseCompleteTurnstile: 'Please complete turnstile verification.',
            pleaseLogin: 'Registration complete. Please login.',
            invalidCompanyEmail: 'Only company email domains are allowed: {domains}',
            employeeRegisterTip: 'Registration only creates an employee account. Mailboxes are assigned by the administrator.',
            allowedDomainsTip: 'Allowed company domains: {domains}',
            verificationUnavailableTip: 'Registration and password reset are disabled until email verification is enabled by the administrator.',
            passwordResetSuccess: 'Password reset complete. Please login with the new password.',
        },
        zh: {
            login: '登录',
            register: '注册',
            email: '邮箱',
            password: '密码',
            verifyCode: '验证码',
            verifyCodeSent: '验证码已发送，{timeout} 秒后失效。',
            waitforVerifyCode: '等待 {timeout} 秒',
            sendVerificationCode: '发送验证码',
            forgotPassword: '忘记密码',
            cannotForgotPassword: '当前未启用邮箱验证，请联系管理员处理。',
            resetPassword: '重置密码',
            pleaseInput: '请输入邮箱和密码。',
            pleaseInputEmail: '请输入邮箱。',
            pleaseInputCode: '请输入验证码。',
            pleaseCompleteTurnstile: '请完成人机验证。',
            pleaseLogin: '注册完成，请登录。',
            invalidCompanyEmail: '仅允许使用公司邮箱域名：{domains}',
            employeeRegisterTip: '注册只会创建员工账号，邮箱地址需要由管理员分配。',
            allowedDomainsTip: '允许注册的公司域名：{domains}',
            verificationUnavailableTip: '管理员尚未开启邮箱验证，当前无法注册或重置密码。',
            passwordResetSuccess: '密码已重置，请使用新密码登录。',
        }
    }
})

const tabValue = ref('signin')
const showResetModal = ref(false)
const user = ref({
    email: '',
    password: '',
    code: '',
})

const signupCfToken = ref('')
const resetCfToken = ref('')
const loginCfToken = ref('')
const signupTurnstileRef = ref(null)
const resetTurnstileRef = ref(null)
const loginTurnstileRef = ref(null)

const verifyCodeExpire = ref(0)
const verifyCodeTimeout = ref(0)

const canUseEmployeeRegistration = computed(() =>
    userOpenSettings.value.enable && userOpenSettings.value.enableMailVerify
)
const allowedDomainsText = computed(() =>
    Array.isArray(userOpenSettings.value.allowedDomains)
        ? userOpenSettings.value.allowedDomains.join(', ')
        : ''
)

const getVerifyCodeTimeout = () => {
    if (!verifyCodeExpire.value || verifyCodeExpire.value < Date.now()) return 0
    return Math.round((verifyCodeExpire.value - Date.now()) / 1000)
}

const validateCompanyEmail = () => {
    if (!user.value.email) {
        return t('pleaseInputEmail')
    }
    const allowedDomains = Array.isArray(userOpenSettings.value.allowedDomains)
        ? userOpenSettings.value.allowedDomains
        : []
    if (!allowedDomains.length) {
        return ''
    }
    const mailDomain = String(user.value.email).split('@')[1]?.trim().toLowerCase()
    if (!mailDomain || !allowedDomains.includes(mailDomain)) {
        return t('invalidCompanyEmail', { domains: allowedDomainsText.value })
    }
    return ''
}

const resetVerifyCodeCountdown = (expirationTtl) => {
    verifyCodeExpire.value = Date.now() + expirationTtl * 1000
    verifyCodeTimeout.value = expirationTtl
    const intervalId = setInterval(() => {
        verifyCodeTimeout.value = getVerifyCodeTimeout()
        if (verifyCodeTimeout.value <= 0) {
            clearInterval(intervalId)
            verifyCodeTimeout.value = 0
        }
    }, 1000)
}

const openResetPasswordModal = () => {
    if (!canUseEmployeeRegistration.value) {
        message.error(t('cannotForgotPassword'))
        return
    }
    user.value.code = ''
    showResetModal.value = true
}

const emailLogin = async () => {
    if (!user.value.email || !user.value.password) {
        message.error(t('pleaseInput'))
        return
    }
    try {
        const res = await api.fetch('/user_api/login', {
            method: 'POST',
            body: JSON.stringify({
                email: user.value.email,
                password: await hashPassword(user.value.password),
                cf_token: loginCfToken.value,
            })
        })
        userJwt.value = res.jwt
        location.reload()
    } catch (error) {
        message.error(error.message || 'login failed')
        loginTurnstileRef.value?.refresh?.()
    }
}

const sendVerificationCode = async () => {
    if (!canUseEmployeeRegistration.value) {
        message.error(t('cannotForgotPassword'))
        return
    }
    const emailError = validateCompanyEmail()
    if (emailError) {
        message.error(emailError)
        return
    }
    const currentCfToken = showResetModal.value ? resetCfToken.value : signupCfToken.value
    if (openSettings.value.enableGlobalTurnstileCheck && !currentCfToken) {
        message.error(t('pleaseCompleteTurnstile'))
        return
    }
    try {
        const res = await api.fetch('/user_api/verify_code', {
            method: 'POST',
            body: JSON.stringify({
                email: user.value.email,
                cf_token: currentCfToken,
            })
        })
        if (res?.expirationTtl) {
            message.success(t('verifyCodeSent', { timeout: res.expirationTtl }))
            resetVerifyCodeCountdown(res.expirationTtl)
        }
    } catch (error) {
        message.error(error.message || 'send verification code failed')
    }
    if (showResetModal.value) {
        resetTurnstileRef.value?.refresh?.()
    } else {
        signupTurnstileRef.value?.refresh?.()
    }
}

const submitEmployeeCredential = async (isPasswordReset = false) => {
    if (!canUseEmployeeRegistration.value) {
        message.error(t('cannotForgotPassword'))
        return
    }
    if (!user.value.email || !user.value.password) {
        message.error(t('pleaseInput'))
        return
    }
    const emailError = validateCompanyEmail()
    if (emailError) {
        message.error(emailError)
        return
    }
    if (!user.value.code) {
        message.error(t('pleaseInputCode'))
        return
    }
    const currentCfToken = isPasswordReset ? resetCfToken.value : signupCfToken.value
    if (openSettings.value.enableGlobalTurnstileCheck && !currentCfToken) {
        message.error(t('pleaseCompleteTurnstile'))
        return
    }
    try {
        await api.fetch('/user_api/register', {
            method: 'POST',
            body: JSON.stringify({
                email: user.value.email,
                password: await hashPassword(user.value.password),
                code: user.value.code,
                cf_token: currentCfToken,
            }),
            message,
        })
        user.value.code = ''
        user.value.password = ''
        showResetModal.value = false
        tabValue.value = 'signin'
        message.success(isPasswordReset ? t('passwordResetSuccess') : t('pleaseLogin'))
    } catch (error) {
        message.error(error.message || 'register failed')
    }
}
</script>

<template>
    <div class="center">
        <n-skeleton v-if="!userOpenSettings.fetched" style="height: 320px; width: 100%;" />
        <n-tabs v-else v-model:value="tabValue" size="large" justify-content="space-evenly">
            <n-tab-pane name="signin" :tab="t('login')">
                <n-form>
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
                        v-if="!canUseEmployeeRegistration"
                        type="warning"
                        :show-icon="false"
                        :bordered="false"
                        style="margin-top: 16px;"
                    >
                        {{ t('verificationUnavailableTip') }}
                    </n-alert>
                </n-form>
            </n-tab-pane>

            <n-tab-pane v-if="canUseEmployeeRegistration" name="signup" :tab="t('register')">
                <n-form>
                    <n-alert type="info" :show-icon="false" :bordered="false" style="margin-bottom: 16px;">
                        <div>{{ t('employeeRegisterTip') }}</div>
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
                        ref="signupTurnstileRef"
                        v-model:value="signupCfToken"
                    />
                    <n-button @click="submitEmployeeCredential(false)" type="primary" block secondary strong>
                        {{ t('register') }}
                    </n-button>
                </n-form>
            </n-tab-pane>
        </n-tabs>

        <n-modal v-model:show="showResetModal" preset="dialog" :title="t('resetPassword')">
            <n-space vertical>
                <n-alert
                    v-if="allowedDomainsText"
                    type="info"
                    :show-icon="false"
                    :bordered="false"
                >
                    {{ t('allowedDomainsTip', { domains: allowedDomainsText }) }}
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
                <n-button type="primary" @click="submitEmployeeCredential(true)">
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

.domain-hint {
    margin-top: 8px;
}
</style>
