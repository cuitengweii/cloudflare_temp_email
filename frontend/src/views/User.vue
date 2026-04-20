<script setup>
import { defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'

import { useGlobalState } from '../store'
import { api } from '../api'

import AddressManagement from './user/AddressManagement.vue';
import UserSettingsPage from './user/UserSettings.vue';
import UserBar from './user/UserBar.vue';
import UserMailBox from './user/UserMailBox.vue';
import SendBox from '../components/SendBox.vue';

const {
    userTab, globalTabplacement, userSettings,
    settings, openSettings, loading
} = useGlobalState()

const SendMail = defineAsyncComponent(() => {
    loading.value = true;
    return import('./index/SendMail.vue')
        .finally(() => loading.value = false);
});

const { t } = useI18n({
    messages: {
        en: {
            address_management: 'My Mailboxes',
            user_mail_box_tab: 'Inbox',
            sendbox: 'Sent',
            sendmail: 'Send Mail',
            user_settings: 'Account',
        },
        zh: {
            address_management: '我的邮箱',
            user_mail_box_tab: '收件箱',
            sendbox: '发件箱',
            sendmail: '发送邮件',
            user_settings: '账户',
        }
    }
});

const fetchSendboxData = async (limit, offset) => {
    return await api.fetch(`/api/sendbox?limit=${limit}&offset=${offset}`);
};

const deleteSendboxMail = async (curMailId) => {
    await api.fetch(`/api/sendbox/${curMailId}`, { method: 'DELETE' });
};
</script>

<template>
    <div>
        <UserBar />
        <n-tabs
            v-if="userSettings.user_email"
            type="card"
            v-model:value="userTab"
            :placement="globalTabplacement"
        >
            <n-tab-pane name="address_management" :tab="t('address_management')">
                <AddressManagement />
            </n-tab-pane>
            <n-tab-pane name="user_mail_box_tab" :tab="t('user_mail_box_tab')">
                <UserMailBox />
            </n-tab-pane>
            <n-tab-pane
                v-if="openSettings.enableSendMail && settings.address"
                name="sendbox"
                :tab="t('sendbox')"
            >
                <SendBox
                    :fetchMailData="fetchSendboxData"
                    :enableUserDeleteEmail="openSettings.enableUserDeleteEmail"
                    :deleteMail="deleteSendboxMail"
                />
            </n-tab-pane>
            <n-tab-pane
                v-if="openSettings.enableSendMail && settings.address"
                name="sendmail"
                :tab="t('sendmail')"
            >
                <SendMail />
            </n-tab-pane>
            <n-tab-pane name="user_settings" :tab="t('user_settings')">
                <UserSettingsPage />
            </n-tab-pane>
        </n-tabs>
    </div>
</template>
