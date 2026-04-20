<script setup>
import { ref, h, onMounted } from 'vue';
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { NBadge, NPopconfirm, NButton, NTag } from 'naive-ui'

import { useGlobalState } from '../../store'
import { api } from '../../api'
import { getRouterPathWithLang } from '../../utils'

const { jwt, settings } = useGlobalState()
const message = useMessage()
const router = useRouter()

const { locale, t } = useI18n({
    messages: {
        en: {
            success: 'Success',
            mailbox: 'Mailbox',
            mail_count: 'Mail Count',
            send_count: 'Send Count',
            actions: 'Actions',
            activateMailbox: 'Use This Mailbox',
            activateMailboxTip: 'Switch the current active mailbox for sending mail and mailbox-scoped actions.',
            current: 'Current',
        },
        zh: {
            success: '成功',
            mailbox: '邮箱',
            mail_count: '邮件数量',
            send_count: '发送数量',
            actions: '操作',
            activateMailbox: '切换邮箱',
            activateMailboxTip: '切换当前激活邮箱，用于发信和当前邮箱相关操作。',
            current: '当前',
        }
    }
});

const data = ref([])

const changeMailAddress = async (address_id) => {
    try {
        const res = await api.fetch(`/user_api/bind_address_jwt/${address_id}`);
        message.success(`${t('activateMailbox')} ${t('success')}`);
        if (!res.jwt) {
            message.error("jwt not found");
            return;
        }
        jwt.value = res.jwt;
        await router.push(getRouterPathWithLang("/", locale.value))
        location.reload();
    } catch (error) {
        console.log(error)
        message.error(error.message || "error");
    }
}

const fetchData = async () => {
    try {
        const { results } = await api.fetch(`/user_api/bind_address`);
        data.value = results;
    } catch (error) {
        console.log(error)
        message.error(error.message || "error");
    }
}

const columns = [
    {
        title: t('mailbox'),
        key: "name",
        render(row) {
            return h('div', [
                h('span', row.name),
                settings.value.address === row.name ? h(NTag, {
                    size: 'small',
                    type: 'success',
                    bordered: false,
                    style: { marginLeft: '8px' }
                }, { default: () => t('current') }) : null
            ]);
        }
    },
    {
        title: t('mail_count'),
        key: "mail_count",
        render(row) {
            return h(NBadge, {
                value: row.mail_count,
                'show-zero': true,
                max: 99,
                type: "success"
            })
        }
    },
    {
        title: t('send_count'),
        key: "send_count",
        render(row) {
            return h(NBadge, {
                value: row.send_count,
                'show-zero': true,
                max: 99,
                type: "success"
            })
        }
    },
    {
        title: t('actions'),
        key: 'actions',
        render(row) {
            return h(NPopconfirm,
                {
                    onPositiveClick: () => changeMailAddress(row.id)
                },
                {
                    trigger: () => h(NButton,
                        {
                            tertiary: true,
                            type: "primary",
                        },
                        { default: () => t('activateMailbox') }
                    ),
                    default: () => t('activateMailboxTip')
                }
            )
        }
    }
]

onMounted(async () => {
    await fetchData()
})
</script>

<template>
    <div style="overflow: auto;">
        <n-data-table :columns="columns" :data="data" :bordered="false" embedded />
    </div>
</template>

<style scoped>
.n-data-table {
    min-width: 700px;
}
</style>
