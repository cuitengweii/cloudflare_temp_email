<script setup>
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { useI18n } from 'vue-i18n'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

import AdminContact from '../common/AdminContact.vue'
import { useGlobalState } from '../../store'
import { api } from '../../api'

const message = useMessage()
const isPreview = ref(false)
const editorRef = shallowRef()

const { settings, sendMailModel, indexTab, userSettings, jwt, openSettings } = useGlobalState()

const { t } = useI18n({
  locale: 'zh',
  messages: {
    en: {
      composeTitle: 'New Message',
      successSend: 'Send success. Please check your sendbox.',
      fromName: 'Your Name and Address, leave Name blank to use email address',
      toName: 'Recipient Name and Address, leave Name blank to use email address',
      subject: 'Subject',
      options: 'Options',
      edit: 'Edit',
      preview: 'Preview',
      content: 'Content',
      send: 'Send',
      requestAccess: 'Request Access',
      requestAccessTip: 'You need to request access to send mail. If you have already requested, please contact admin to increase quota.',
      send_balance: 'Send Mail Balance Left',
      text: 'Text',
      html: 'HTML',
      richText: 'Rich Text',
      tooLarge: 'Too large file, please upload file less than 1MB.',
      activateMailboxFirst: 'Please activate a mailbox first to send mail.',
      activateMailboxNow: 'Activate Mailbox Now'
    },
    zh: {
      composeTitle: '写邮件',
      successSend: '发送成功，请查看发件箱。',
      fromName: '你的名称和地址，名称不填写则使用邮箱地址',
      toName: '收件人名称和地址，名称不填写则使用邮箱地址',
      subject: '主题',
      options: '选项',
      edit: '编辑',
      preview: '预览',
      content: '内容',
      send: '发送',
      requestAccess: '申请权限',
      requestAccessTip: '你需要先申请发送权限才能发邮件；如果已经申请过，请联系管理员提升额度。',
      send_balance: '剩余发送邮件额度',
      text: '文本',
      html: 'HTML',
      richText: '富文本',
      tooLarge: '文件过大，请上传小于 1MB 的文件。',
      activateMailboxFirst: '请先激活邮箱后再发送邮件。',
      activateMailboxNow: '立即激活邮箱'
    }
  }
})

const contentTypes = [
  { label: t('text'), value: 'text' },
  { label: t('html'), value: 'html' },
  { label: t('richText'), value: 'rich' }
]

const canSendAsEmployeeUser = computed(() => !!userSettings.value.user_email)

const activateFirstMailbox = async () => {
  const { results } = await api.fetch('/user_api/bind_address')
  const firstAddressId = Array.isArray(results) ? results?.[0]?.id : null
  if (!firstAddressId) return false
  const res = await api.fetch(`/user_api/bind_address_jwt/${firstAddressId}`)
  if (!res?.jwt) return false
  jwt.value = res.jwt
  await api.getSettings()
  return true
}

const buildSendPayload = () => ({
  from_name: sendMailModel.value.fromName,
  to_name: sendMailModel.value.toName,
  to_mail: sendMailModel.value.toMail,
  subject: sendMailModel.value.subject,
  is_html: sendMailModel.value.contentType !== 'text',
  content: sendMailModel.value.content
})

const doSend = async () => {
  await api.fetch('/api/send_mail', {
    method: 'POST',
    body: JSON.stringify(buildSendPayload())
  })
}

const isBalanceError = (msg) => {
  if (!msg) return false
  return msg.includes('No balance') || msg.includes('余额')
}

const resetForm = () => {
  sendMailModel.value = {
    fromName: '',
    toName: '',
    toMail: '',
    subject: '',
    contentType: 'text',
    content: ''
  }
}

const send = async () => {
  try {
    await doSend()
    resetForm()
    message.success(t('successSend'))
    indexTab.value = 'sendbox'
  } catch (error) {
    const errMsg = error?.message || 'error'
    if (isBalanceError(errMsg)) {
      try {
        const rebound = await activateFirstMailbox()
        if (rebound) {
          await doSend()
          resetForm()
          message.success(t('successSend'))
          indexTab.value = 'sendbox'
          return
        }
      } catch (retryError) {
        console.log(retryError)
      }
    }
    message.error(errMsg)
  }
}

const requestAccess = async () => {
  try {
    await api.fetch('/api/request_send_mail_access', {
      method: 'POST',
      body: JSON.stringify({})
    })
    message.success(t('requestAccess'))
    await api.getSettings()
  } catch (error) {
    message.error(error.message || 'error')
  }
}

const toolbarConfig = {
  excludeKeys: ['uploadVideo']
}

const editorConfig = {
  MENU_CONF: {
    uploadImage: {
      async customUpload() {
        message.error(t('tooLarge'))
      },
      maxFileSize: 1 * 1024 * 1024,
      base64LimitSize: 1 * 1024 * 1024
    }
  }
}

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor) => {
  editorRef.value = editor
}

onMounted(async () => {
  if (!userSettings.value.user_id) await api.getUserSettings(message)
  if (!openSettings.value.fetched) await api.getOpenSettings(message)
  if (!settings.value.address && userSettings.value.user_email) {
    try {
      await activateFirstMailbox()
    } catch (error) {
      console.log(error)
    }
  }
  await api.getSettings()
})
</script>

<template>
  <div class="compose-page">
    <div v-if="!settings.address">
      <n-alert type="warning" :show-icon="false" :bordered="false">
        {{ t('activateMailboxFirst') }}
        <n-button type="primary" tertiary @click="activateFirstMailbox" size="small">
          {{ t('activateMailboxNow') }}
        </n-button>
      </n-alert>
      <AdminContact />
    </div>

    <div v-else-if="!canSendAsEmployeeUser && (!settings.send_balance || settings.send_balance <= 0)">
      <n-alert type="warning" :show-icon="false" :bordered="false">
        {{ t('requestAccessTip') }}
        <n-button type="primary" tertiary @click="requestAccess" size="small">
          {{ t('requestAccess') }}
        </n-button>
      </n-alert>
      <AdminContact />
    </div>

    <div v-else class="compose-shell">
      <div class="compose-header">
        <div class="compose-header-left">
          <div class="compose-title">{{ t('composeTitle') }}</div>
          <div class="compose-subtitle">
            {{ t('send_balance') }}: {{ settings.send_balance }}
          </div>
        </div>
        <n-button class="compose-send" type="primary" @click="send">
          {{ t('send') }}
        </n-button>
      </div>

      <div class="compose-body">
        <n-form :model="sendMailModel" class="compose-form">
          <div class="compose-field">
            <div class="compose-field-label">{{ t('fromName') }}</div>
            <div class="compose-line compose-line--dual">
              <n-input
                v-model:value="sendMailModel.fromName"
                class="compose-input"
                :placeholder="t('fromName')"
              />
              <n-input
                :value="settings.address"
                disabled
                class="compose-input compose-input--fixed"
              />
            </div>
          </div>

          <div class="compose-field">
            <div class="compose-field-label">{{ t('toName') }}</div>
            <div class="compose-line compose-line--dual">
              <n-input
                v-model:value="sendMailModel.toName"
                class="compose-input"
                :placeholder="t('toName')"
              />
              <n-input
                v-model:value="sendMailModel.toMail"
                class="compose-input"
                :placeholder="t('toName')"
              />
            </div>
          </div>

          <div class="compose-field">
            <div class="compose-field-label">{{ t('subject') }}</div>
            <n-input
              v-model:value="sendMailModel.subject"
              class="compose-input compose-input--subject"
              :placeholder="t('subject')"
            />
          </div>

          <div class="compose-field compose-field--options">
            <div class="compose-field-label">{{ t('options') }}</div>
            <div class="compose-options">
              <n-radio-group v-model:value="sendMailModel.contentType" class="compose-radio-group">
                <n-radio-button
                  v-for="option in contentTypes"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                />
              </n-radio-group>
              <n-button
                v-if="sendMailModel.contentType !== 'text'"
                class="compose-preview-toggle"
                tertiary
                @click="isPreview = !isPreview"
              >
                {{ isPreview ? t('edit') : t('preview') }}
              </n-button>
            </div>
          </div>

          <div class="compose-field compose-field--content">
            <div class="compose-field-label">{{ t('content') }}</div>
            <div class="compose-editor-panel">
              <n-card :bordered="false" embedded v-if="isPreview" class="compose-preview-card">
                <div v-html="sendMailModel.content" />
              </n-card>
              <div v-else-if="sendMailModel.contentType === 'rich'" class="compose-rich-editor">
                <Toolbar
                  class="compose-toolbar"
                  :defaultConfig="toolbarConfig"
                  :editor="editorRef"
                  mode="default"
                />
                <Editor
                  class="compose-editor"
                  v-model="sendMailModel.content"
                  :defaultConfig="editorConfig"
                  mode="default"
                  @onCreated="handleCreated"
                />
              </div>
              <n-input
                v-else
                v-model:value="sendMailModel.content"
                type="textarea"
                class="compose-textarea"
                :placeholder="t('content')"
              />
            </div>
          </div>
        </n-form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.compose-page {
  width: 100%;
}

.compose-shell {
  width: min(100%, 980px);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: min(76vh, 860px);
  border: 1px solid rgba(32, 33, 36, 0.12);
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 16px 48px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.compose-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  border-bottom: 1px solid rgba(32, 33, 36, 0.08);
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

.compose-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.compose-title {
  font-size: 18px;
  font-weight: 700;
  color: #202124;
  letter-spacing: 0.2px;
}

.compose-subtitle {
  font-size: 12px;
  color: #5f6368;
}

.compose-send {
  min-width: 96px;
  border-radius: 999px;
  font-weight: 600;
}

.compose-body {
  flex: 1;
  padding: 20px 22px 24px;
}

.compose-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  height: 100%;
}

.compose-field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.compose-field--content {
  flex: 1;
  min-height: 340px;
}

.compose-field-label {
  font-size: 12px;
  font-weight: 600;
  color: #5f6368;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.compose-line {
  display: grid;
  gap: 12px;
}

.compose-line--dual {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}

.compose-input :deep(.n-input__input-el),
.compose-input :deep(.n-input__textarea-el),
.compose-input :deep(input) {
  border-radius: 12px;
}

.compose-input--fixed :deep(.n-input__state-border),
.compose-input--subject :deep(.n-input__state-border) {
  border-radius: 12px;
}

.compose-input--fixed :deep(.n-input__input-el) {
  color: #3c4043;
}

.compose-options {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.compose-radio-group {
  display: inline-flex;
}

.compose-preview-toggle {
  border-radius: 999px;
}

.compose-editor-panel {
  flex: 1;
  min-height: 340px;
  display: flex;
}

.compose-preview-card {
  width: 100%;
  border-radius: 16px;
  background: #fafafa;
}

.compose-rich-editor {
  width: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(32, 33, 36, 0.14);
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
}

.compose-toolbar {
  border-bottom: 1px solid rgba(32, 33, 36, 0.08);
}

.compose-editor {
  height: 100%;
  min-height: 360px;
  overflow-y: auto;
}

.compose-textarea {
  width: 100%;
  min-height: 360px;
}

.compose-textarea :deep(.n-input__textarea-el) {
  min-height: 360px;
  border-radius: 16px;
}

.n-alert {
  margin-bottom: 10px;
}

@media (max-width: 960px) {
  .compose-shell {
    min-height: calc(100vh - 180px);
  }

  .compose-line--dual {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .compose-header,
  .compose-body {
    padding-left: 14px;
    padding-right: 14px;
  }

  .compose-shell {
    border-radius: 14px;
  }

  .compose-send {
    min-width: 80px;
  }
}
</style>
