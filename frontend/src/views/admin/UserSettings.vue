<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useGlobalState } from '../../store';
import { api } from '../../api';

const { loading } = useGlobalState();
const message = useMessage();

const { t } = useI18n({
    messages: {
        en: {
            save: 'Save',
            successTip: 'Save Success',
            enable: 'Enable',
            enableUserRegister: 'Allow Employee Self-Registration',
            enableMailVerify: 'Enable Mail Verify (Send address must be an address in the system with a balance and can send mail normally)',
            verifyMailSender: 'Verify Mail Sender',
            enableMailAllowList: 'Enable Mail Address Allow List (Manually enterable)',
            manualInputPrompt: 'Type and press Enter to add',
            mailAllowList: 'Mail Address Allow List',
            maxAddressCount: 'Maximum number of email addresses that can be binded',
            emailCheckRegex: "Email Check Regex (e.g. ^[^.]+{'@'}.+$ to disallow dots before {'@'})",
            enableEmailCheckRegex: 'Enable Email Check Regex',
        },
        zh: {
            save: '\u4fdd\u5b58',
            successTip: '\u4fdd\u5b58\u6210\u529f',
            enable: '\u542f\u7528',
            enableUserRegister: '\u5141\u8bb8\u5458\u5de5\u81ea\u52a9\u6ce8\u518c',
            enableMailVerify: '\u542f\u7528\u90ae\u4ef6\u9a8c\u8bc1\uff08\u53d1\u9001\u5730\u5740\u5fc5\u987b\u662f\u7cfb\u7edf\u4e2d\u80fd\u6b63\u5e38\u53d1\u90ae\u4ef6\u7684\u5730\u5740\uff09',
            verifyMailSender: '\u9a8c\u8bc1\u90ae\u4ef6\u53d1\u9001\u5730\u5740',
            enableMailAllowList: '\u542f\u7528\u90ae\u7bb1\u57df\u540d\u767d\u540d\u5355\uff08\u53ef\u624b\u52a8\u8f93\u5165\uff0c\u56de\u8f66\u6dfb\u52a0\uff09',
            manualInputPrompt: '\u8f93\u5165\u540e\u6309\u56de\u8f66\u952e\u6dfb\u52a0',
            mailAllowList: '\u90ae\u7bb1\u57df\u540d\u767d\u540d\u5355',
            maxAddressCount: '\u53ef\u7ed1\u5b9a\u7684\u6700\u5927\u90ae\u7bb1\u5730\u5740\u6570\u91cf',
            emailCheckRegex: '\u90ae\u7bb1\u6b63\u5219\u6821\u9a8c\uff08\u4f8b\u5982 ^[^.]+{\'@\'}.+$ \u7528\u4e8e\u7981\u6b62 @ \u524d\u51fa\u73b0\u70b9\uff09',
            enableEmailCheckRegex: '\u542f\u7528\u90ae\u7bb1\u6b63\u5219\u6821\u9a8c',
        }
    }
});

const commonMail = [
    'gmail.com', '163.com', '126.com', 'qq.com', 'outlook.com', 'hotmail.com',
    'icloud.com', 'yahoo.com', 'foxmail.com'
];

const mailAllowOptions = commonMail.map((item) => ({
    label: item,
    value: item
}));

const userSettings = ref({
    enable: false,
    enableMailVerify: false,
    verifyMailSender: '',
    enableMailAllowList: false,
    mailAllowList: commonMail,
    maxAddressCount: 5,
    enableEmailCheckRegex: false,
    emailCheckRegex: '',
});

const fetchData = async () => {
    try {
        const res = await api.fetch('/admin/user_settings');
        Object.assign(userSettings.value, res);
    } catch (error) {
        message.error(error.message || 'error');
    }
};

const save = async () => {
    try {
        await api.fetch('/admin/user_settings', {
            method: 'POST',
            body: JSON.stringify(userSettings.value)
        });
        message.success(t('successTip'));
    } catch (error) {
        message.error(error.message || 'error');
    }
};

onMounted(async () => {
    await fetchData();
});
</script>

<template>
    <div class="center">
        <n-card :bordered="false" embedded style="max-width: 600px;">
            <n-flex justify="end">
                <n-button @click="save" type="primary" :loading="loading">
                    {{ t('save') }}
                </n-button>
            </n-flex>
            <n-form :model="userSettings">
                <n-form-item-row :label="t('enableUserRegister')">
                    <n-switch v-model:value="userSettings.enable" :round="false" />
                </n-form-item-row>
                <n-form-item-row :label="t('enableMailVerify')">
                    <n-input-group>
                        <n-checkbox v-model:checked="userSettings.enableMailVerify" style="width: 20%;">
                            {{ t('enable') }}
                        </n-checkbox>
                        <n-input
                            v-if="userSettings.enableMailVerify"
                            v-model:value="userSettings.verifyMailSender"
                            style="width: 80%;"
                            :placeholder="t('verifyMailSender')"
                        />
                    </n-input-group>
                </n-form-item-row>
                <n-form-item-row :label="t('enableMailAllowList')">
                    <n-input-group>
                        <n-checkbox v-model:checked="userSettings.enableMailAllowList" style="width: 20%;">
                            {{ t('enable') }}
                        </n-checkbox>
                        <n-select
                            v-if="userSettings.enableMailAllowList"
                            v-model:value="userSettings.mailAllowList"
                            filterable
                            multiple
                            tag
                            style="width: 80%;"
                            :options="mailAllowOptions"
                            :placeholder="t('mailAllowList')"
                        >
                            <template #empty>
                                <n-text depth="3">
                                    {{ t('manualInputPrompt') }}
                                </n-text>
                            </template>
                        </n-select>
                    </n-input-group>
                </n-form-item-row>
                <n-form-item-row :label="t('maxAddressCount')">
                    <n-input-group>
                        <n-input-number
                            v-model:value="userSettings.maxAddressCount"
                            :placeholder="t('maxAddressCount')"
                        />
                    </n-input-group>
                </n-form-item-row>
                <n-form-item-row :label="t('enableEmailCheckRegex')">
                    <n-flex align="center" :wrap="false" style="width: 100%;">
                        <n-checkbox v-model:checked="userSettings.enableEmailCheckRegex" style="flex: 0 0 auto;">
                            {{ t('enable') }}
                        </n-checkbox>
                        <n-input
                            v-show="userSettings.enableEmailCheckRegex"
                            v-model:value="userSettings.emailCheckRegex"
                            style="flex: 1 1 auto;"
                            :placeholder="t('emailCheckRegex')"
                        />
                    </n-flex>
                </n-form-item-row>
            </n-form>
        </n-card>
    </div>
</template>

<style scoped>
.center {
    display: flex;
    text-align: left;
    place-items: center;
    justify-content: center;
}
</style>
