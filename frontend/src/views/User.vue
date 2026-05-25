<script setup>
import { defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'

import { useGlobalState } from '../store'
import { api } from '../api'

import AddressMangement from './user/AddressManagement.vue'
import UserSettingsPage from './user/UserSettings.vue'
import UserBar from './user/UserBar.vue'
import BindAddress from './user/BindAddress.vue'
import UserMailBox from './user/UserMailBox.vue'
import SendBox from '../components/SendBox.vue'

const SendMail = defineAsyncComponent(() => import('./index/SendMail.vue'))

const { userTab, globalTabplacement, userSettings, openSettings, settings } = useGlobalState()

const { t } = useI18n({
  messages: {
    en: {
      address_management: 'Address Management',
      user_mail_box_tab: 'Mail Box',
      user_settings: 'User Settings',
      bind_address: 'Bind Mail Address',
      sendbox: 'Send Box',
      sendmail: 'Send Mail',
      quickSendEntry: 'Need to send mail?'
    },
    zh: {
      address_management: '地址管理',
      user_mail_box_tab: '收件箱',
      user_settings: '用户设置',
      bind_address: '绑定邮箱地址',
      sendbox: '发件箱',
      sendmail: '发送邮件',
      quickSendEntry: '需要发送邮件？'
    }
  }
})

const fetchSendboxData = async (limit, offset) => {
  return await api.fetch(`/api/sendbox?limit=${limit}&offset=${offset}`)
}

const deleteSendboxMail = async (curMailId) => {
  await api.fetch(`/api/sendbox/${curMailId}`, { method: 'DELETE' })
}
</script>

<template>
  <div>
    <UserBar />
    <n-alert
      v-if="userSettings.user_email && openSettings.enableSendMail"
      type="info"
      :show-icon="false"
      :bordered="false"
      style="margin: 10px 0;"
    >
      {{ t('quickSendEntry') }}
      <n-button tertiary type="primary" size="small" @click="userTab = 'sendmail'">{{ t('sendmail') }}</n-button>
    </n-alert>
    <n-tabs v-if="userSettings.user_email" type="card" v-model:value="userTab" :placement="globalTabplacement">
      <n-tab-pane name="address_management" :tab="t('address_management')">
        <AddressMangement />
      </n-tab-pane>
      <n-tab-pane name="user_mail_box_tab" :tab="t('user_mail_box_tab')">
        <UserMailBox />
      </n-tab-pane>
      <n-tab-pane v-if="openSettings.enableSendMail && settings.address" name="sendbox" :tab="t('sendbox')">
        <SendBox
          :fetchMailData="fetchSendboxData"
          :enableUserDeleteEmail="openSettings.enableUserDeleteEmail"
          :deleteMail="deleteSendboxMail"
        />
      </n-tab-pane>
      <n-tab-pane v-if="openSettings.enableSendMail" name="sendmail" :tab="t('sendmail')">
        <SendMail />
      </n-tab-pane>
      <n-tab-pane name="user_settings" :tab="t('user_settings')">
        <UserSettingsPage />
      </n-tab-pane>
      <n-tab-pane name="bind_address" :tab="t('bind_address')">
        <BindAddress />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>
